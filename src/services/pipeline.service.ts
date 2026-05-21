import { StatusCodes } from "http-status-codes";

import { CreatePipelineDto } from "../dtos/pipeline.dto";
import ApiError from "../exceptions/apiError";
import responseMessages from "../constants/responseMessages";
import PipelineRepository from "../repositories/pipeline.repository";
import { Types } from "mongoose";

const pipelineRepository = new PipelineRepository();

class PipelineService {
  async createPipeline(workspaceId: string, userId: string, data: CreatePipelineDto) {
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
}

export default PipelineService;
