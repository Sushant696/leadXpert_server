import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import LeadService from "../services/lead.service";
import responseMessages from "../constants/responseMessages";
import { CreateLeadDto, UpdateLeadDto } from "../dtos/lead.dto";

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

  getLeadsByWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const leads = await leadService.getLeadsByWorkspace(workspaceId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.RETRIEVED, {
        leads,
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

  moveLeadToStage = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;
    const { stageId } = req.body;
    if (!stageId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "stageId is required");
    }

    const lead = await leadService.moveLeadToStage(pipelineId, leadId, stageId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.STAGE_MOVED, {
        lead,
      }),
    );
  });

  assignLeadToUser = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;
    const { userId } = req.body;

    if (!userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "userId is required");
    }

    const lead = await leadService.assignLeadToUser(pipelineId, leadId, userId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.ASSIGNED, {
        lead,
      }),
    );
  });

  convertLeadToDeal = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;
    const userId = req.user?.id;

    const lead = await leadService.convertLeadToDeal(
      pipelineId,
      leadId,
      userId,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.CONVERTED, {
        lead,
      }),
    );
  });

  markLeadAsLost = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;
    const { lostReason } = req.body;

    const lead = await leadService.markLeadAsLost(
      pipelineId,
      leadId,
      lostReason,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.MARKED_LOST, {
        lead,
      }),
    );
  });

  archiveLead = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;

    await leadService.archiveLead(pipelineId, leadId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.ARCHIVED),
    );
  });
}

export default LeadController;
