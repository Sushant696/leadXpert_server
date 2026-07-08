import { Types } from "mongoose";

import { Lead } from "../models/lead.model";
import { Pipeline } from "../models/pipeline.model";
import { PipelineStage } from "../models/pipeline-stage.model";
import { LeadPriority, LeadStatus } from "../types/shared.types";
import {
  FEATURE_IMPORTANCE,
  MODEL_METRICS,
  MODEL_NAME,
} from "../constants/modelFeatureImportance";

const MISSING_TIER = "UNSCORED";
const SCORE_TIERS = [
  LeadPriority.HIGH,
  LeadPriority.MEDIUM,
  LeadPriority.LOW,
] as const;

class InsightsService {
  // ── Dashboard widget (all roles): leads to work today ──
  async getHotLeadsToday(workspaceId: string, days = 3) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const leads = await Lead.find({
      workspaceId: workspaceObjectId,
      mlPriority: LeadPriority.HIGH,
      isConverted: false,
      status: { $nin: [LeadStatus.LOST, LeadStatus.ARCHIVED] },
      $or: [{ lastContactedAt: null }, { lastContactedAt: { $lt: threshold } }],
    })
      .sort({ mlScore: -1 })
      .limit(10)
      .populate("contactId", "name email phone")
      .populate("assignedTo", "name")
      .populate("stageId", "name")
      .select(
        "title value currency mlScore lastContactedAt contactId assignedTo stageId",
      )
      .lean();

    return leads.map((lead) => ({
      leadId: String(lead._id),
      title: lead.title,
      value: lead.value,
      currency: lead.currency,
      mlScore: lead.mlScore,
      lastContactedAt: lead.lastContactedAt ?? null,
      stageName: (lead.stageId as any)?.name ?? null,
      contact: lead.contactId
        ? {
            name: (lead.contactId as any).name,
            email: (lead.contactId as any).email ?? null,
            phone: (lead.contactId as any).phone ?? null,
          }
        : null,
      assignedTo: lead.assignedTo
        ? { name: (lead.assignedTo as any).name }
        : null,
    }));
  }

  // ── Dashboard widget (all roles): current pipeline funnel ──
  // Scoped to a single pipeline (explicit or the workspace's oldest active
  // one) since stage order/identity isn't comparable across pipelines.
  async getStageFunnel(workspaceId: string, pipelineId?: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const pipeline = pipelineId
      ? await Pipeline.findOne({
          _id: pipelineId,
          workspaceId: workspaceObjectId,
        }).lean()
      : await Pipeline.findOne({
          workspaceId: workspaceObjectId,
          isArchived: false,
        })
          .sort({ createdAt: 1 })
          .lean();

    if (!pipeline) {
      return { pipelineId: null, pipelineName: null, stages: [] };
    }

    const [stages, leadCounts, avgTimePerStage] = await Promise.all([
      PipelineStage.find({ pipelineId: pipeline._id })
        .select("name color")
        .lean(),
      Lead.aggregate([
        {
          $match: {
            pipelineId: pipeline._id,
            isConverted: false,
            status: { $nin: [LeadStatus.LOST, LeadStatus.ARCHIVED] },
          },
        },
        { $group: { _id: "$stageId", count: { $sum: 1 } } },
      ]),
      // avg time-spent only counts stage visits that have actually ended
      // (exitedAt set) — an in-progress visit isn't a completed data point.
      Lead.aggregate([
        { $match: { pipelineId: pipeline._id } },
        { $unwind: "$stageHistory" },
        { $match: { "stageHistory.exitedAt": { $ne: null } } },
        {
          $group: {
            _id: "$stageHistory.stageId",
            avgTimeSpentMs: { $avg: "$stageHistory.timeSpentMs" },
          },
        },
      ]),
    ]);

    const stageMap = new Map(stages.map((s) => [String(s._id), s]));
    const countMap = new Map(
      leadCounts.map((c) => [String(c._id), c.count as number]),
    );
    const avgTimeMap = new Map(
      avgTimePerStage.map((a) => [String(a._id), a.avgTimeSpentMs as number]),
    );

    const stageOrder = (pipeline.stageOrder ?? []).map(String);
    const orderedStageIds =
      stageOrder.length > 0 ? stageOrder : stages.map((s) => String(s._id));

    const stagesResult = orderedStageIds
      .filter((id) => stageMap.has(id))
      .map((id) => {
        const stage = stageMap.get(id)!;
        return {
          stageId: id,
          stageName: stage.name,
          color: stage.color,
          currentLeadCount: countMap.get(id) ?? 0,
          avgTimeSpentMs: avgTimeMap.get(id) ?? null,
        };
      });

    return {
      pipelineId: String(pipeline._id),
      pipelineName: pipeline.name,
      stages: stagesResult,
    };
  }

  // ── Insights page (super admin only) ──

  async getScoreCalibration(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const rows = await Lead.aggregate([
      { $match: { workspaceId: workspaceObjectId } },
      {
        $group: {
          _id: { $ifNull: ["$mlPriority", MISSING_TIER] },
          total: { $sum: 1 },
          converted: { $sum: { $cond: ["$isConverted", 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ["$status", LeadStatus.LOST] }, 1, 0] } },
        },
      },
    ]);

    return [...SCORE_TIERS, MISSING_TIER].map((tier) => {
      const row = rows.find((r) => r._id === tier);
      const total = row?.total ?? 0;
      const converted = row?.converted ?? 0;
      const lost = row?.lost ?? 0;
      return {
        tier,
        total,
        converted,
        lost,
        open: total - converted - lost,
        conversionRate:
          total > 0 ? Number(((converted / total) * 100).toFixed(1)) : 0,
      };
    });
  }

  // Reshapes the calibration data as a predicted-tier x actual-outcome grid,
  // plus a binary precision/recall/F1 summary treating "HIGH priority" as the
  // positive prediction (mirrors the production threshold: mlScore >= 65 ->
  // HIGH, set at scoring time in scoring.service.ts). Only resolved leads
  // (converted or explicitly lost) are included — an open lead's true label
  // isn't known yet, so it can't count toward a confusion matrix.
  async getConfusionMatrix(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const rows = await Lead.aggregate([
      {
        $match: {
          workspaceId: workspaceObjectId,
          mlPriority: { $ne: null },
          $or: [{ isConverted: true }, { status: LeadStatus.LOST }],
        },
      },
      {
        $group: {
          _id: {
            tier: "$mlPriority",
            outcome: { $cond: ["$isConverted", "CONVERTED", "LOST"] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const grid = SCORE_TIERS.map((tier) => {
      const converted =
        rows.find((r) => r._id.tier === tier && r._id.outcome === "CONVERTED")
          ?.count ?? 0;
      const lost =
        rows.find((r) => r._id.tier === tier && r._id.outcome === "LOST")
          ?.count ?? 0;
      return { tier, converted, lost, total: converted + lost };
    });

    const highRow = grid.find((g) => g.tier === LeadPriority.HIGH)!;
    const tp = highRow.converted;
    const fp = highRow.lost;
    const fn = grid
      .filter((g) => g.tier !== LeadPriority.HIGH)
      .reduce((sum, g) => sum + g.converted, 0);
    const tn = grid
      .filter((g) => g.tier !== LeadPriority.HIGH)
      .reduce((sum, g) => sum + g.lost, 0);

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 =
      precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const accuracy =
      tp + fp + fn + tn > 0 ? (tp + tn) / (tp + fp + fn + tn) : 0;

    return {
      grid,
      binary: {
        positiveClass: "HIGH priority (predicted to convert)",
        truePositive: tp,
        falsePositive: fp,
        falseNegative: fn,
        trueNegative: tn,
        precision: Number((precision * 100).toFixed(1)),
        recall: Number((recall * 100).toFixed(1)),
        f1: Number((f1 * 100).toFixed(1)),
        accuracy: Number((accuracy * 100).toFixed(1)),
      },
      note:
        "Computed over resolved leads only (converted or lost). Open leads are excluded since their true outcome isn't known yet.",
    };
  }

  async getPriorityMismatch(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const leads = await Lead.find({
      workspaceId: workspaceObjectId,
      mlPriority: { $ne: null },
      isConverted: false,
      status: { $nin: [LeadStatus.LOST, LeadStatus.ARCHIVED] },
      $expr: { $ne: ["$mlPriority", "$priority"] },
    })
      .sort({ mlScore: -1 })
      .limit(200)
      .populate("contactId", "name")
      .populate("assignedTo", "name")
      .select("title value currency mlScore mlPriority priority contactId assignedTo")
      .lean();

    return leads.map((lead) => ({
      leadId: String(lead._id),
      title: lead.title,
      value: lead.value,
      currency: lead.currency,
      mlScore: lead.mlScore,
      mlPriority: lead.mlPriority,
      humanPriority: lead.priority,
      contactName: (lead.contactId as any)?.name ?? null,
      assignedToName: (lead.assignedTo as any)?.name ?? null,
    }));
  }

  async getAtRiskValue(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const [overall, byStage] = await Promise.all([
      Lead.aggregate([
        {
          $match: {
            workspaceId: workspaceObjectId,
            isRotten: true,
            isConverted: false,
          },
        },
        { $group: { _id: null, count: { $sum: 1 }, value: { $sum: "$value" } } },
      ]),
      Lead.aggregate([
        {
          $match: {
            workspaceId: workspaceObjectId,
            isRotten: true,
            isConverted: false,
          },
        },
        { $group: { _id: "$stageId", count: { $sum: 1 }, value: { $sum: "$value" } } },
        {
          $lookup: {
            from: "pipelinestages",
            localField: "_id",
            foreignField: "_id",
            as: "stage",
          },
        },
        { $unwind: { path: "$stage", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            stageId: "$_id",
            stageName: "$stage.name",
            count: 1,
            value: 1,
          },
        },
        { $sort: { value: -1 } },
      ]),
    ]);

    return {
      count: overall[0]?.count ?? 0,
      value: overall[0]?.value ?? 0,
      byStage,
    };
  }

  getFeatureImportance() {
    return {
      model: MODEL_NAME,
      metrics: MODEL_METRICS,
      features: FEATURE_IMPORTANCE,
    };
  }

  async getSourcePerformance(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const rows = await Lead.aggregate([
      { $match: { workspaceId: workspaceObjectId } },
      {
        $group: {
          _id: { $ifNull: ["$source", "UNKNOWN"] },
          total: { $sum: 1 },
          converted: { $sum: { $cond: ["$isConverted", 1, 0] } },
          avgValue: { $avg: "$value" },
          avgMlScore: { $avg: "$mlScore" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return rows.map((r) => ({
      source: r._id as string,
      total: r.total,
      converted: r.converted,
      conversionRate:
        r.total > 0 ? Number(((r.converted / r.total) * 100).toFixed(1)) : 0,
      avgValue: Math.round(r.avgValue ?? 0),
      avgMlScore: Math.round(r.avgMlScore ?? 0),
    }));
  }
}

export default InsightsService;
