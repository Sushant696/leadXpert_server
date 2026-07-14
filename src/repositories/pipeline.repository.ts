import { Types } from "mongoose";
import {
  IPipeline,
  Pipeline,
  PipelineDocument,
} from "../models/pipeline.model";
import { Lead } from "../models/lead.model";
import { LeadStatus } from "../types/shared.types";

interface PipelineRepositoryInterface {
  getPipelineById(id: string): Promise<PipelineDocument | null>;
  createPipeline(pipeline: Partial<IPipeline>): Promise<PipelineDocument>;
  updatePipeline(
    id: string,
    pipeline: Partial<IPipeline>,
  ): Promise<PipelineDocument | null>;
  deletePipeline(id: string): Promise<void>;
  findPipelinesByWorkspaceId(workspaceId: string): Promise<PipelineDocument[]>;
  findPipelinesByWorkspaceIdAndName(
    workspaceId: string,
    name: string,
    excludeId?: string,
  ): Promise<PipelineDocument[]>;
  findPipelineSummariesByWorkspaceId(
    workspaceId: string,
  ): Promise<Partial<PipelineDocument>[]>;
  findPipelineWithStages(pipelineId: string): Promise<PipelineDocument | null>;
  reorderPipelineStages(
    pipelineId: Types.ObjectId,
    data: string[],
  ): Promise<PipelineDocument | null>;
  syncPipelineStats(pipelineId: string): Promise<PipelineDocument | null>;
}

class PipelineRepository implements PipelineRepositoryInterface {
  async createPipeline(
    pipeline: Partial<IPipeline>,
  ): Promise<PipelineDocument> {
    const newPipeline = new Pipeline(pipeline);
    return newPipeline.save();
  }

  async updatePipeline(
    id: string,
    pipeline: Partial<IPipeline>,
  ): Promise<PipelineDocument | null> {
    return Pipeline.findByIdAndUpdate(id, pipeline, { new: true });
  }

  async getPipelineById(id: string): Promise<PipelineDocument | null> {
    return Pipeline.findById(id);
  }

  findPipelinesByWorkspaceId(workspaceId: string): Promise<PipelineDocument[]> {
    return Pipeline.find({ workspaceId });
  }

  findPipelineSummariesByWorkspaceId(
    workspaceId: string,
  ): Promise<Partial<PipelineDocument>[]> {
    return Pipeline.find({ workspaceId: new Types.ObjectId(workspaceId) })
      .select("_id name color icon workspaceId")
      .lean();
  }

  findPipelinesByWorkspaceIdAndName(
    workspaceId: string,
    name: string,
    excludeId?: string,
  ): Promise<PipelineDocument[]> {
    const query: Record<string, any> = {
      workspaceId,
      name: new RegExp(`^${name}$`, "i"),
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Pipeline.find(query);
  }

  findPipelineWithStages(pipelineId: string): Promise<PipelineDocument | null> {
    return Pipeline.findById({ _id: pipelineId }).populate({
      path: "stageOrder",
      model: "PipelineStage",
    });
  }

  reorderPipelineStages(
    pipelineId: Types.ObjectId,
    data: string[],
  ): Promise<PipelineDocument | null> {
    return Pipeline.findByIdAndUpdate(
      pipelineId,
      { stageOrder: data },
      { new: true },
    );
  }

  async deletePipeline(id: string): Promise<void> {
    await Pipeline.findByIdAndDelete(id);
  }

  /**
   * Recomputes the denormalized `stats` block for a pipeline from its leads
   * and persists it. Called after any change that can affect lead counts or
   * value (create / move / status change / delete). Archived leads are
   * excluded from the totals.
   */
  async syncPipelineStats(
    pipelineId: string,
  ): Promise<PipelineDocument | null> {
    const pipelineObjectId = new Types.ObjectId(pipelineId);

    const [grouped] = await Lead.aggregate<{
      totalLeads: number;
      openLeads: number;
      wonLeads: number;
      lostLeads: number;
      totalValue: number;
      wonValue: number;
    }>([
      {
        $match: {
          pipelineId: pipelineObjectId,
          status: { $ne: LeadStatus.ARCHIVED },
        },
      },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          openLeads: {
            $sum: { $cond: [{ $eq: ["$status", LeadStatus.OPEN] }, 1, 0] },
          },
          wonLeads: {
            $sum: { $cond: [{ $eq: ["$status", LeadStatus.WON] }, 1, 0] },
          },
          lostLeads: {
            $sum: { $cond: [{ $eq: ["$status", LeadStatus.LOST] }, 1, 0] },
          },
          totalValue: { $sum: "$value" },
          wonValue: {
            $sum: {
              $cond: [{ $eq: ["$status", LeadStatus.WON] }, "$value", 0],
            },
          },
        },
      },
    ]);

    const stats = {
      totalLeads: grouped?.totalLeads ?? 0,
      openLeads: grouped?.openLeads ?? 0,
      wonLeads: grouped?.wonLeads ?? 0,
      lostLeads: grouped?.lostLeads ?? 0,
      totalValue: grouped?.totalValue ?? 0,
      wonValue: grouped?.wonValue ?? 0,
    };

    return Pipeline.findByIdAndUpdate(
      pipelineObjectId,
      { $set: { stats } },
      { new: true },
    );
  }
}

export default PipelineRepository;
