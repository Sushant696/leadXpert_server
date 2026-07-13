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

    // A lead can only ever have one deal — the Deal.leadId unique index is the
    // authoritative guard; this is the friendly pre-check.
    const existingDeal = await dealRepository.getDealByLeadId(dealData.leadId);
    if (existingDeal) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.DEAL.ALREADY_EXISTS,
      );
    }

    // contactId is optional now (mirrors Lead.contactId) — a deal can be made
    // from a lead that has no contact attached.
    const deal = await dealRepository.createDeal({
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(userId),
      leadId: new Types.ObjectId(dealData.leadId),
      contactId: lead.contactId ?? null,
      pipelineId: lead.pipelineId,
      title: lead.title,
      value: lead.value,
      currency: lead.currency,
      assignedTo: lead.assignedTo,
    });

    // Keep the lead's denormalized markers in sync.
    await leadRepository.updateLead(dealData.leadId, {
      hasDeal: true,
      isConverted: true,
      convertedAt: new Date(),
      convertedBy: new Types.ObjectId(userId),
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
