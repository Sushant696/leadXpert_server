import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { CreatePipelineDto, UpdatePipelineDto } from "../dtos/pipeline.dto";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import PipelineService from "../services/pipeline.service";
import responseMessages from "../constants/responseMessages";

const pipelineService = new PipelineService();

class PipelineController {
  createPipeline = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreatePipelineDto.safeParse(req.body);
    const userId = req.user?.id;
    const workpaceId = req.params.workspaceId;
    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }
    const createdPipeline = await pipelineService.createPipeline(
      workpaceId,
      userId,
      parsedData.data,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.PIPELINE.CREATED, {
        pipeline: createdPipeline,
      }),
    );
  });

  updatePipeline = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = UpdatePipelineDto.safeParse(req.body);
    const pipelineId = req.params.pipelineId;
    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }
    const updatedPipeline = await pipelineService.updatePipeline(
      pipelineId,
      parsedData.data,
    );
    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, responseMessages.PIPELINE.UPDATED, {
        pipeline: updatedPipeline,
      }),
    );
  });

  getPipelines = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const pipelines =
      await pipelineService.getPipelinesSummariesByWorkspaceId(workspaceId);
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.PIPELINE.RETRIEVED, {
        pipelines,
      }),
    );
  });

  getSinglePipelineWithStages = asyncHandler(
    async (req: Request, res: Response) => {
      const workspaceId = req.params.workspaceId;
      const pipelineId = req.params.pipelineId;
      const pipelineWithStages =
        await pipelineService.getSinglePipelineWithStages(
          workspaceId,
          pipelineId,
        );
      return res.json(
        new ApiResponse(
          StatusCodes.OK,
          responseMessages.PIPELINE.SINGLE_RETRIEVED,
          {
            pipeline: pipelineWithStages,
          },
        ),
      );
    },
  );
}

export default PipelineController;
