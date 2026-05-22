import { ClientSession, Types } from "mongoose";
import {
  IPipelineStage,
  PipelineStage,
  PipelineStageDocument,
} from "../models/pipeline-stage.model";

interface PipelineStageRepository {
  findById(id: string): Promise<PipelineStageDocument | null>;
  findAll(): Promise<PipelineStageDocument[]>;
  create(
    pipelineStage: Partial<IPipelineStage>,
    session: ClientSession,
  ): Promise<PipelineStageDocument | null>;
  delete(id: string): Promise<void>;
}

class PipelineStageRepository implements PipelineStageRepository {
  async findById(id: string): Promise<PipelineStageDocument | null> {
    // Implementation to find a pipeline stage by ID
    return null;
  }

  async findPipelineStagesByPipelineIdandName(
    pipelineId: string,
    name: string,
  ): Promise<PipelineStageDocument | null> {
    return PipelineStage.findOne({
      pipelineId,
      name: new RegExp(`^${name}$`, "i"),
    });
  }

  async findAll(): Promise<PipelineStageDocument[]> {
    // Implementation to find all pipeline stages
    return [];
  }

  async create(
    pipelineStage: Partial<IPipelineStage>,
    session: ClientSession,
  ): Promise<PipelineStageDocument | null> {
    const pipelineState = await PipelineStage.create([pipelineStage], {
      session,
    });
    return pipelineState[0] || null;
  }

  async delete(id: string): Promise<void> {
    // Implementation to delete a pipeline stage by ID
  }
}

export default PipelineStageRepository;
