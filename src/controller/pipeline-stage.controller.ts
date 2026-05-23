import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import responseMessages from "../constants/responseMessages";
import {
  BulkCreatePipelineStagesDto,
  CreatePipelineStageDto,
  ReorderPipelineStagesDto,
  UpdatePipelineStageDto,
} from "../dtos/pipeline-stage.dto";
import PipelineStageService from "../services/pipeline-stage.service";

const pipelineStageService = new PipelineStageService();

class PipelineStageController {
  createPipelineStage = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const pipeline = req.pipeline!;
    const parsedData = CreatePipelineStageDto.safeParse(req.body);
    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }
    const createdPipelineStage = await pipelineStageService.createPipelineStage(
      pipeline,
      workspaceId,
      parsedData.data,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.PIPELINE_STAGE.CREATED, {
        pipelineStage: createdPipelineStage,
      }),
    );
  });

  createBulkPipelineStage = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const pipeline = req.pipeline!;
    const parsedData = BulkCreatePipelineStagesDto.safeParse(req.body);
    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }
    const createdPipelineStages = await pipelineStageService.createBulkPipelineStage(
      pipeline,
      workspaceId,
      parsedData.data.id,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.PIPELINE_STAGE.BULK_CREATED, {
        pipelineStage: createdPipelineStages,
      }),
    );
  });

  reorderPipelineStage = asyncHandler(async (req: Request, res: Response) => {
    const pipeline = req.pipeline!;
    const parsedData = ReorderPipelineStagesDto.safeParse(req.body);

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const reorderedStages = await pipelineStageService.reorderPipelineStage(
      pipeline,
      parsedData.data,
    );

    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.PIPELINE_STAGE.REORDERED,
        reorderedStages,
      ),
    );
  });

  updatePipelineStage = asyncHandler(async (req: Request, res: Response) => {
    const pipeline = req.pipeline!;
    const stageId = req.params.stageId;
    const parsedData = UpdatePipelineStageDto.safeParse(req.body);

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }
    const updatePipilineStage = await pipelineStageService.updatePipilineStage(
      pipeline,
      stageId,
      parsedData.data,
    );

    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.PIPELINE_STAGE.UPDATED,
        updatePipilineStage,
      ),
    );
  });

  deletePipelineStage = asyncHandler(async (req: Request, res: Response) => {
    const pipeline = req.pipeline!;
    const stageId = req.params.stageId;

    await pipelineStageService.deletePipelineStage(pipeline, stageId);

    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.PIPELINE_STAGE.DELETED,
      ),
    );
  })

}

export default PipelineStageController;
