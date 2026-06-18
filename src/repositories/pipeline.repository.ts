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
}

export default PipelineRepository;
