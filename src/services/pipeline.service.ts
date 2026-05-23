import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreatePipelineDto, UpdatePipelineDto } from "../dtos/pipeline.dto";
import responseMessages from "../constants/responseMessages";
import PipelineRepository from "../repositories/pipeline.repository";

const pipelineRepository = new PipelineRepository();

class PipelineService {
  async createPipeline(
    workspaceId: string,
    userId: string,
    data: CreatePipelineDto,
  ) {
    const existingPipelines =
      await pipelineRepository.findPipelinesByWorkspaceIdAndName(
        workspaceId,
        data.name,
      );
    if (existingPipelines.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        responseMessages.PIPELINE.NAME_EXISTS,
      );
    }
    const pipeline = await pipelineRepository.createPipeline({
      workspaceId: new Types.ObjectId(workspaceId),
      ...data,
      createdBy: new Types.ObjectId(userId),
      memberIds: data.memberIds?.map((id) => new Types.ObjectId(id)),
    });
    return pipeline;
  }

  async updatePipeline(pipelineId: string, data: UpdatePipelineDto) {
    const pipeline = await pipelineRepository.getPipelineById(pipelineId);
    if (!pipeline) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.PIPELINE.NOT_FOUND,
      );
    }

    if (data.name && data.name !== pipeline.name) {
      const existingPipelines =
        await pipelineRepository.findPipelinesByWorkspaceIdAndName(
          pipeline.workspaceId.toString(),
          data.name,
          pipelineId,
        );
      if (existingPipelines.length > 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          responseMessages.PIPELINE.NAME_EXISTS,
        );
      }
    }
    const updatedPipeline = await pipelineRepository.updatePipeline(
      pipelineId,
      {
        ...data,
        memberIds: data.memberIds?.map((id) => new Types.ObjectId(id)),
      },
    );
    return updatedPipeline;
  }

  async getPipelinesSummariesByWorkspaceId(workspaceId: string) {
    const pipelines =
      await pipelineRepository.findPipelineSummariesByWorkspaceId(workspaceId);
    return pipelines;
  }

  async getSinglePipelineWithStages(workspaceId: string, pipelineId: string) {
    const pipeline = await pipelineRepository.getPipelineById(pipelineId);

    if (!pipeline || pipeline.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.PIPELINE.NOT_FOUND,
      );
    }
    const pipelineWithStages =
      await pipelineRepository.findPipelineWithStages(pipelineId);
    const pipelineObj = pipelineWithStages?.toObject();

    return {
      ...pipelineObj,
      stages: pipelineObj?.stageOrder,
      stageOrder: pipelineObj?.stageOrder.map((s: any) => s._id),
    };
  }

  async deletePipeline(pipelineId: string) {
    const pipeline = await pipelineRepository.getPipelineById(pipelineId);

    if (!pipeline) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.PIPELINE.NOT_FOUND,
      );
    }

    if (pipeline.stageOrder.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.PIPELINE_STAGE.PIPELINE_WITH_STAGES,
      );
    }

    await pipelineRepository.deletePipeline(pipelineId);
    return;
  }
}

export default PipelineService;
