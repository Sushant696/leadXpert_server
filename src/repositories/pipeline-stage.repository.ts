import { ClientSession } from "mongoose";
import {
  IPipelineStage,
  PipelineStage,
  PipelineStageDocument,
} from "../models/pipeline-stage.model";

interface PipelineStageRepository {
  findById(id: string): Promise<PipelineStageDocument | null>;
  findAll(pipelineId: string): Promise<PipelineStageDocument[]>;
  create(
    pipelineStage: Partial<IPipelineStage>,
    session: ClientSession,
  ): Promise<PipelineStageDocument | null>;
  bulkCreate(
    pipelineStages: Partial<IPipelineStage>[],
    session: ClientSession,
  ): Promise<PipelineStageDocument[] | null>;
  delete(id: string, session: ClientSession): Promise<void>;
  updatePipelineStage(
    id: string,
    data: Partial<IPipelineStage>,
  ): Promise<PipelineStageDocument | null>;
}

class PipelineStageRepository implements PipelineStageRepository {
  async findById(id: string): Promise<PipelineStageDocument | null> {
    return PipelineStage.findById(id);
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

  async findAll(pipelineId: string): Promise<PipelineStageDocument[]> {
    return await PipelineStage.find({ pipelineId }).sort({ createdAt: 1 });
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

  async bulkCreate(
    pipelineStages: Partial<IPipelineStage>[],
    session: ClientSession,
  ): Promise<PipelineStageDocument[] | null> {
    const createdPipelineStates = await PipelineStage.insertMany(
      pipelineStages,
      {
        session,
      },
    );
    return createdPipelineStates || null;
  }

  async updatePipelineStage(
    id: string,
    data: Partial<IPipelineStage>,
  ): Promise<PipelineStageDocument | null> {
    return await PipelineStage.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string, session: ClientSession): Promise<void> {
    await PipelineStage.findByIdAndDelete(id, { session });
  }
}

export default PipelineStageRepository;
