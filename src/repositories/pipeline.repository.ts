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
  ): Promise<PipelineDocument[]>;
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

  findPipelinesByWorkspaceIdAndName(
    workspaceId: string,
    name: string,
  ): Promise<PipelineDocument[]> {
    return Pipeline.find({ workspaceId, name: new RegExp(name, "i") });
  }

  async deletePipeline(id: string): Promise<void> {
    await Pipeline.findByIdAndDelete(id);
  }
}

export default PipelineRepository;
