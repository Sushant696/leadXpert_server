import { Request, Response } from "express";
import z from "zod";
import { StatusCodes } from "http-status-codes";

import { CreateLeadDto, UpdateLeadDto } from "../dtos/lead.dto";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import LeadService from "../services/lead.service";
import responseMessages from "../constants/responseMessages";

const leadService = new LeadService();

class LeadController {
  createLead = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreateLeadDto.safeParse(req.body);
    const userId = req.user?.id;
    const workspaceId = req.params.workspaceId;
    const pipelineId = req.params.pipelineId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const lead = await leadService.createLead(
      workspaceId,
      pipelineId,
      userId,
      parsedData.data,
    );

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, responseMessages.LEAD.CREATED, {
        lead,
      }),
    );
  });

  getLeads = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const { stageId, assignedTo, search, view, page, limit } = req.query;

    const options = {
      stageId: stageId as string | undefined,
      assignedTo: assignedTo as string | undefined,
      search: search as string | undefined,
      view: (view as "kanban" | "list") || "kanban",
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    };

    const leads = await leadService.getLeads(pipelineId, options);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.RETRIEVED, {
        leads,
      }),
    );
  });

  getLeadById = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;

    const lead = await leadService.getLeadById(pipelineId, leadId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.RETRIEVED, {
        lead,
      }),
    );
  });

  updateLead = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = UpdateLeadDto.safeParse(req.body);
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const lead = await leadService.updateLead(
      pipelineId,
      leadId,
      parsedData.data,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.UPDATED, {
        lead,
      }),
    );
  });
}

export default LeadController;
