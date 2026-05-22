import mongoose, { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import {
  CreatePipelineStageDto,
  ReorderPipelineStagesDto,
  UpdatePipelineStageDto,
} from "../dtos/pipeline-stage.dto";
import { PipelineDocument } from "../models/pipeline.model";
import PipelineRepository from "../repositories/pipeline.repository";
import PipelineStageRepository from "../repositories/pipeline-stage.repository";

const pipelineRepository = new PipelineRepository();
const pipelintStageRepository = new PipelineStageRepository();

class PipelineStageService {
  async createPipelineStage(
    pipeline: PipelineDocument,
    workspaceId: string,
    data: CreatePipelineStageDto,
  ) {
    const existingStage =
      await pipelintStageRepository.findPipelineStagesByPipelineIdandName(
        pipeline._id.toString(),
        data.name,
      );

    if (existingStage) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.PIPELINE_STAGE.NAME_EXISTS,
      );
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const createdPipelineStage = await pipelintStageRepository.create(
        {
          pipelineId: new Types.ObjectId(pipeline._id),
          workspaceId: new Types.ObjectId(workspaceId),
          ...data,
        },
        session,
      );
      if (!createdPipelineStage) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          errorMessages.PIPELINE_STAGE.CREATE_FAILED,
        );
      }

      await pipelineRepository.updatePipeline(pipeline._id.toString(), {
        stageOrder: [...pipeline.stageOrder, createdPipelineStage._id],
      });
      await session.commitTransaction();
      return createdPipelineStage;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async reorderPipelineStage(
    pipeline: PipelineDocument,
    data: ReorderPipelineStagesDto,
  ) {
    // first check the order send from client
    const isValidOrder = data.stageIds.every((id, index) => {
      return pipeline.stageOrder[index].toString() === id;
    });

    if (isValidOrder) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.PIPELINE_STAGE.REORDER_SAME_ORDER,
      );
    }

    const reorderedStages = await pipelineRepository.reorderPipelineStages(
      pipeline._id,
      data.stageIds,
    );
    if (!reorderedStages) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessages.PIPELINE_STAGE.REORDER_FAILED,
      );
    }
    return reorderedStages.stageOrder;
  }

  async updatePipilineStage(
    pipelineId: string,
    workspaceId: string,
    data: UpdatePipelineStageDto,
  ) {}
}

export default PipelineStageService;
