import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreateDealDto, UpdateDealDto } from "../dtos/deal.dto";
import { IDeal } from "../models/deal.model";
import DealRepository from "../repositories/deal.repository";
import LeadRepository from "../repositories/lead.repository";

const dealRepository = new DealRepository();
const leadRepository = new LeadRepository();

class DealService {
  async createDeal(
    workspaceId: string,
    userId: string,
    dealData: CreateDealDto,
  ) {
    const lead = await leadRepository.getLeadById(dealData.leadId);

    if (!lead) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.LEAD.NOT_FOUND);
    }

    if (lead.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    if (lead.isConverted) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lead has already been converted to a deal",
      );
    }

    const deal = await dealRepository.createDeal({
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(userId),
      leadId: new Types.ObjectId(dealData.leadId),
      contactId: lead.contactId,
      pipelineId: lead.pipelineId,
      title: lead.title,
      value: lead.value,
      currency: lead.currency,
      assignedTo: lead.assignedTo,
    });

    return deal;
  }

  async getDealsByWorkspaceId(workspaceId: string, options?: any) {
    const deals = await dealRepository.getDealsByWorkspaceId(
      workspaceId,
      options,
    );
    return deals;
  }

  async getDealById(workspaceId: string, dealId: string) {
    const deal = await dealRepository.getDealById(dealId);

    if (!deal) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.DEAL.NOT_FOUND);
    }

    if (deal.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    return deal;
  }

  async updateDeal(workspaceId: string, dealId: string, data: UpdateDealDto) {
    const deal = await dealRepository.getDealById(dealId);

    if (!deal) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.DEAL.NOT_FOUND);
    }

    if (deal.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    const updatePayload: Partial<IDeal> = {
      ...data,
      assignedTo: data.assignedTo
        ? new Types.ObjectId(data.assignedTo)
        : data.assignedTo === null
          ? null
          : undefined,
    };

    const updatedDeal = await dealRepository.updateDeal(dealId, updatePayload);
    return updatedDeal;
  }
}

export default DealService;
