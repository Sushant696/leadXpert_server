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
import { PipelineStage } from "../models/pipeline-stage.model";
import PipelineRepository from "../repositories/pipeline.repository";
import PipelineStageRepository from "../repositories/pipeline-stage.repository";
import {
  STARTER_TEMPLATES,
  TemplateIdLookup,
} from "../constants/pipeline-stage-constants";
import { StageType } from "../types/shared.types";

const pipelineRepository = new PipelineRepository();
const pipelintStageRepository = new PipelineStageRepository();

// A pipeline can have only one WON and one LOST stage. This guards the
// create/update paths with a friendly error before the DB unique index would
// otherwise reject the write with an opaque duplicate-key error.
const TERMINAL_TYPE_ERRORS: Partial<Record<StageType, string>> = {
  [StageType.WON]: errorMessages.PIPELINE_STAGE.WON_TYPE_EXISTS,
  [StageType.LOST]: errorMessages.PIPELINE_STAGE.LOST_TYPE_EXISTS,
};

class PipelineStageService {
  /**
   * Throws if the pipeline already has a terminal (WON/LOST) stage of the given
   * type, excluding `excludeStageId` (used on update so a stage doesn't clash
   * with itself).
   */
  private async assertTerminalTypeAvailable(
    pipelineId: string,
    type: StageType | undefined,
    excludeStageId?: string,
  ) {
    if (type !== StageType.WON && type !== StageType.LOST) return;

    const query: Record<string, unknown> = { pipelineId, type };
    if (excludeStageId) {
      query._id = { $ne: excludeStageId };
    }

    const clashing = await PipelineStage.findOne(query);
    if (clashing) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        TERMINAL_TYPE_ERRORS[type] as string,
      );
    }
  }

  /**
   * Part 2 — surfaces a non-blocking warning when a pipeline is missing a WON
   * and/or LOST stage. Leads can never be won or lost without the matching
   * terminal stage, so the UI nudges the user to add one. Returns an array of
   * human-readable warning strings (empty when both terminal stages exist).
   */
  async getMissingTerminalStageWarnings(pipelineId: string): Promise<string[]> {
    const stages = await pipelintStageRepository.findAll(pipelineId);
    const types = new Set(stages.map((s) => s.type));
    const warnings: string[] = [];

    if (!types.has(StageType.WON)) {
      warnings.push(
        "This pipeline has no Won stage — leads cannot be converted to deals until you add one.",
      );
    }
    if (!types.has(StageType.LOST)) {
      warnings.push(
        "This pipeline has no Lost stage — leads cannot be marked as lost until you add one.",
      );
    }

    return warnings;
  }

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

    // Only one WON and one LOST stage allowed per pipeline.
    await this.assertTerminalTypeAvailable(pipeline._id.toString(), data.type);

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

      const warnings = await this.getMissingTerminalStageWarnings(
        pipeline._id.toString(),
      );

      return {
        ...createdPipelineStage.toObject(),
        pipeline: updatedPipeline,
        warnings,
      };
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

    // Changing a stage's type into WON/LOST must not collide with an existing
    // terminal stage of the same type (excluding this stage itself).
    if (data.type && data.type !== existingStage.type) {
      await this.assertTerminalTypeAvailable(
        pipeline._id.toString(),
        data.type,
        stageId,
      );
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
