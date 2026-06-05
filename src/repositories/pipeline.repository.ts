import { Types } from "mongoose";
import {
  IPipeline,
  Pipeline,
  PipelineDocument,
} from "../models/pipeline.model";

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
  syncPipelineStats(pipelineId: string): Promise<void>;
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

  async syncPipelineStats(pipelineId: string): Promise<void> {
    const { Lead } = await import("../models/lead.model");

    const result = await Lead.aggregate([
      {
        $match: {
          pipelineId: new Types.ObjectId(pipelineId),
          status: { $ne: "ARCHIVED" },
        },
      },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          openLeads: { $sum: { $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0] } },
          wonLeads: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
          lostLeads: { $sum: { $cond: [{ $eq: ["$status", "LOST"] }, 1, 0] } },
          totalValue: { $sum: "$value" },
          wonValue: {
            $sum: { $cond: [{ $eq: ["$status", "WON"] }, "$value", 0] },
          },
        },
      },
    ]);

    const stats = result[0] ?? {
      totalLeads: 0,
      openLeads: 0,
      wonLeads: 0,
      lostLeads: 0,
      totalValue: 0,
      wonValue: 0,
    };

    delete stats._id;
    await Pipeline.findByIdAndUpdate(pipelineId, { $set: { stats } });
  }
}

export default PipelineRepository;
