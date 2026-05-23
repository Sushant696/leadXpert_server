import mongoose, { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import {
  CreatePipelineStageDto,
  ReorderPipelineStagesDto,
  UpdatePipelineStageDto,
} from "../dtos/pipeline-stage.dto";
import { Pipeline, PipelineDocument } from "../models/pipeline.model";
import PipelineRepository from "../repositories/pipeline.repository";
import PipelineStageRepository from "../repositories/pipeline-stage.repository";
import {
  STARTER_TEMPLATES,
  TemplateIdLookup,
} from "../constants/pipeline-stage-constants";

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

      const updatedPipeline = await pipelineRepository.updatePipeline(
        pipeline._id.toString(),
        {
          stageOrder: [...pipeline.stageOrder, createdPipelineStage._id],
        },
      );
      await session.commitTransaction();

      return { ...createdPipelineStage.toObject(), pipeline: updatedPipeline };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async createBulkPipelineStage(
    pipeline: PipelineDocument,
    workspaceId: string,
    tempId: string,
  ) {
    const existingPipeline = await Pipeline.findById(pipeline._id.toString());

    if (existingPipeline && existingPipeline.stageOrder.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.PIPELINE_STAGE.TEMPLATE_FAILED,
      );
    }

    const currentTemplateArray = STARTER_TEMPLATES.find((t) => t.id === tempId);
    if (!currentTemplateArray) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.PIPELINE_STAGE.TEMPLATE_NOT_FOUND,
      );
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const stagesToCreate = currentTemplateArray.stages.map((t) => ({
        pipelineId: pipeline._id,
        workspaceId: new Types.ObjectId(workspaceId),
        ...t,
      }));

      const createdStages = await pipelintStageRepository.bulkCreate(
        stagesToCreate,
        session,
      );
      if (!createdStages || createdStages.length === 0) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          errorMessages.PIPELINE_STAGE.CREATE_FAILED,
        );
      }

      await pipelineRepository.updatePipeline(pipeline._id.toString(), {
        stageOrder: createdStages.map((stage) => stage._id),
      });

      await session.commitTransaction();
      return createdStages;
    } catch (error: Error | any) {
      await session.abortTransaction();
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessages.PIPELINE_STAGE.TEMPLATE_FAILED,
      );
    } finally {
      session.endSession();
    }
  }

  async reorderPipelineStage(
    pipeline: PipelineDocument,
    data: ReorderPipelineStagesDto,
  ) {
    // first check the order sent from client
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
    pipeline: PipelineDocument,
    stageId: string,
    data: UpdatePipelineStageDto,
  ) {
    const existingStage = await pipelintStageRepository.findById(stageId);

    if (!existingStage) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.PIPELINE_STAGE.NOT_FOUND,
      );
    }

    if (data.name && data.name !== existingStage.name) {
      const existingStageWithName =
        await pipelintStageRepository.findPipelineStagesByPipelineIdandName(
          pipeline._id.toString(),
          data.name,
        );

      if (existingStageWithName) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          errorMessages.PIPELINE_STAGE.NAME_EXISTS,
        );
      }
    }
    const updatedPipelineStage =
      await pipelintStageRepository.updatePipelineStage(stageId, data);

    if (!updatedPipelineStage) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessages.PIPELINE_STAGE.UPDATE_FAILED,
      );
    }
    return updatedPipelineStage;
  }

  async deletePipelineStage(pipeline: PipelineDocument, stageId: string) {
    const existingStage = await pipelintStageRepository.findById(stageId);

    if (!existingStage) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.PIPELINE_STAGE.NOT_FOUND,
      );
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      await pipelintStageRepository.delete(stageId, session);

      const updatedStageOrder = pipeline.stageOrder.filter(
        (id) => id.toString() !== stageId,
      );

      await pipelineRepository.updatePipeline(pipeline._id.toString(), {
        stageOrder: updatedStageOrder,
      });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessages.PIPELINE_STAGE.DELETE_FAILED,
      );
    } finally {
      session.endSession();
    }
  }

}

export default PipelineStageService;
