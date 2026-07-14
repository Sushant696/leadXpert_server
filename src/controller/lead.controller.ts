import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import LeadService from "../services/lead.service";
import responseMessages from "../constants/responseMessages";
import { CreateLeadDto, UpdateLeadDto, MoveLeadDto } from "../dtos/lead.dto";
import { eventBus, leadTopic, LeadEvent } from "../lib/eventBus";

const SSE_HEARTBEAT_MS = 20_000;
const SSE_MAX_CONNECTION_MS = 10 * 60 * 1000; // self-close well under the 15m access-token expiry

const leadService = new LeadService();

// Shape a single lead for the detail response: scoreHistory is returned as a
// lightweight { score, scoredAt } series for the trend chart — priority/features
// are omitted to keep the response small (the full entries stay in the DB).
function toLeadDetailResponse(lead: import("../models/lead.model").LeadDocument) {
  const leadObject = lead.toObject();
  leadObject.scoreHistory = (leadObject.scoreHistory ?? []).map(
    (entry: { score: number; scoredAt: Date }) => ({
      score: entry.score,
      scoredAt: entry.scoredAt,
    }),
  );
  return leadObject;
}

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
        lead: toLeadDetailResponse(lead),
      }),
    );
  });

  // Workspace-scoped single-lead fetch for the lead detail page (route carries
  // only workspaceId + leadId, no pipeline id).
  getLeadDetail = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const leadId = req.params.leadId;

    const lead = await leadService.getLeadByIdForWorkspace(workspaceId, leadId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.RETRIEVED, {
        lead: toLeadDetailResponse(lead),
      }),
    );
  });

  // Live updates for a lead (SSE). Kept lightweight: pushes { leadId, type }
  // only — the frontend refetches through its existing react-query hooks.
  streamLeadEvents = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;

    // Same check every other lead route relies on — checkPipelinesAccess only
    // proves the pipeline belongs to the workspace, not that this leadId
    // belongs to that pipeline.
    await leadService.ensureLeadInPipeline(leadId, pipelineId);

    res.writeHead(StatusCodes.OK, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();
    // Write an immediate byte so consumers that buffer until the first body
    // chunk (e.g. the Next.js SSE proxy route) don't stall waiting for the
    // first heartbeat tick.
    res.write(":\n\n");

    const onEvent = (event: LeadEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };
    eventBus.on(leadTopic(leadId), onEvent);

    const heartbeat = setInterval(() => {
      res.write(":\n\n");
    }, SSE_HEARTBEAT_MS);

    // Force-close periodically so the browser's native EventSource
    // reconnects on its own — the reconnect re-runs the frontend proxy,
    // which reads a (possibly refreshed by then) access token. Avoids any
    // manual token-refresh wiring on either side.
    const maxLifetime = setTimeout(() => {
      res.end();
    }, SSE_MAX_CONNECTION_MS);

    const cleanup = () => {
      clearInterval(heartbeat);
      clearTimeout(maxLifetime);
      eventBus.off(leadTopic(leadId), onEvent);
    };

    req.on("close", cleanup);
  });

  updateLead = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = UpdateLeadDto.safeParse(req.body);
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;
    const userId = req.user?.id;

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
      userId,
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
    const userId = req.user?.id;

    if (!req.body?.stageId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "stageId is required");
    }

    const parsedData = MoveLeadDto.safeParse(req.body);
    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const { stageId, dealDetails, lostReason, lostReasonTag } = parsedData.data;

    const lead = await leadService.moveLeadToStage(
      pipelineId,
      leadId,
      stageId,
      userId,
      { dealDetails, lostReason, lostReasonTag },
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.LEAD.STAGE_MOVED, {
        lead,
      }),
    );
  });

  assignLeadToUser = asyncHandler(async (req: Request, res: Response) => {
    const pipelineId = req.params.pipelineId;
    const leadId = req.params.leadId;
    const actorId = req.user?.id;
    const { userId } = req.body;

    if (!userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "userId is required");
    }

    const lead = await leadService.assignLeadToUser(pipelineId, leadId, userId, actorId);

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
    const userId = req.user?.id;
    const { lostReason } = req.body;

    const lead = await leadService.markLeadAsLost(
      pipelineId,
      leadId,
      lostReason,
      userId,
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
