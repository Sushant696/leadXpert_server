import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreateLeadDto, UpdateLeadDto } from "../dtos/lead.dto";
import { ILead } from "../models/lead.model";
import LeadRepository from "../repositories/lead.repository";
import PipelineRepository from "../repositories/pipeline.repository";

const leadRepository = new LeadRepository();
const pipelineRepository = new PipelineRepository();

class LeadService {
  async ensureLeadInPipeline(leadId: string, pipelineId: string) {
    const lead = await leadRepository.getLeadById(leadId);
    if (!lead) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.LEAD.NOT_FOUND);
    }

    if (lead.pipelineId.toString() !== pipelineId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    return lead;
  }

  async createLead(
    workspaceId: string,
    pipelineId: string,
    userId: string,
    leadData: CreateLeadDto,
  ) {
    const pipeline = await pipelineRepository.getPipelineById(pipelineId);
    if (!pipeline) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.PIPELINE.NOT_FOUND,
      );
    }

    const selectedStageId =
      leadData.stageId || pipeline.stageOrder?.[0]?.toString();
    if (!selectedStageId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Pipeline must have at least one stage",
      );
    }

    const lead = await leadRepository.createLead({
      workspaceId: new Types.ObjectId(workspaceId),
      pipelineId: new Types.ObjectId(pipelineId),
      stageId: new Types.ObjectId(selectedStageId),
      contactId: new Types.ObjectId(leadData.contactId),
      createdBy: new Types.ObjectId(userId),
      title: leadData.title,
      value: leadData.value,
      currency: leadData.currency,
      priority: leadData.priority,
      source: leadData.source,
      assignedTo: leadData.assignedTo
        ? new Types.ObjectId(leadData.assignedTo)
        : null,
      nextFollowUpAt: leadData.nextFollowUpAt,
      tags: leadData.tags,
      quickNote: leadData.quickNote,
    });

    return lead;
  }

  async getLeads(pipelineId: string, options?: any) {
    const leads = await leadRepository.getLeadsByPipelineId(
      pipelineId,
      options,
    );
    return leads;
  }

  async getLeadById(pipelineId: string, leadId: string) {
    return this.ensureLeadInPipeline(leadId, pipelineId);
  }

  async updateLead(pipelineId: string, leadId: string, data: UpdateLeadDto) {
    await this.ensureLeadInPipeline(leadId, pipelineId);

    const updatePayload: Partial<ILead> = {
      ...data,
      assignedTo: data.assignedTo
        ? new Types.ObjectId(data.assignedTo)
        : data.assignedTo === null
          ? null
          : undefined,
    };

    const updatedLead = await leadRepository.updateLead(leadId, updatePayload);
    return updatedLead;
  }
}

export default LeadService;
