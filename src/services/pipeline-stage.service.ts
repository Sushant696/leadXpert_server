import mongoose, { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreatePipelineStageDto } from "../dtos/pipeline-stage.dto";
import PipelineRepository from "../repositories/pipeline.repository";
import PipelineStageRepository from "../repositories/pipeline-stage.repository";

const pipelineRepository = new PipelineRepository();
const pipelintStageRepository = new PipelineStageRepository();

class PipelineStageService {
  async createPipelineStage(
    pipelineId: string,
    workspaceId: string,
    data: CreatePipelineStageDto,
  ) {
    const pipeline = await pipelineRepository.getPipelineById(pipelineId);

    const order = pipeline?.stageOrder.length || 0;

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const createdPipelineStage = await pipelintStageRepository.create(
        {
          pipelineId: new Types.ObjectId(pipelineId),
          workspaceId: new Types.ObjectId(workspaceId),
          order,
          ...data,
        },
        session,
      );
      if (!createdPipelineStage || !pipeline) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          errorMessages.PIPELINE_STAGE.CREATE_FAILED,
        );
      }

      await pipelineRepository.updatePipeline(pipelineId, {
        stageOrder: [...pipeline.stageOrder, createdPipelineStage._id],
      });
      await session.commitTransaction();
      return createdPipelineStage;
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
}

export default PipelineStageService;
