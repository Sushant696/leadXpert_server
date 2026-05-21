import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import responseMessages from "../constants/responseMessages";
import { CreatePipelineStageDto } from "../dtos/pipeline-stage.dto";
import PipelineStageService from "../services/pipeline-stage.service";

const pipelineStageService = new PipelineStageService();

class PipelineStageController {
  createPipeline = asyncHandler(async (req: Request, res: Response) => {
    const { pipelineId, workspaceId } = req.params;
    const parsedData = CreatePipelineStageDto.safeParse(req.body);
    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }
    const createdPipelineStage = await pipelineStageService.createPipelineStage(
      pipelineId,
      workspaceId,
      parsedData.data,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.PIPELINE_STAGE.CREATED, {
        pipelineStage: createdPipelineStage,
      }),
    );
  });
}

export default PipelineStageController;
