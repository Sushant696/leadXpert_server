import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import asyncHandler from "../utils/asyncHandler";
import { CreatePipelineDto } from "../dtos/pipeline.dto";
import PipelineService from "../services/pipeline.service";
import ApiResponse from "../utils/apiResponse";
import responseMessages from "../constants/responseMessages";

const pipelineService = new PipelineService();

class PipelineController {
  createPipeline = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreatePipelineDto.safeParse(req.body);
    const userId = req.user?.id;
    const workpaceId = req.params.workspaceId;
    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, z.prettifyError(parsedData.error));
    }
    const createdPipeline = await pipelineService.createPipeline(workpaceId, userId, parsedData.data);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.PIPELINE.CREATED,
        { pipeline: createdPipeline }
      )
    )
  })
}

export default PipelineController;
