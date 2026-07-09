import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import responseMessages from "../constants/responseMessages";
import InsightsService from "../services/insights.service";

const insightsService = new InsightsService();

class InsightsController {
  // Dashboard widgets (all roles)

  getHotLeadsToday = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const days = req.query.days ? Number(req.query.days) : 3;
    const leads = await insightsService.getHotLeadsToday(
      workspaceId,
      Number.isFinite(days) && days > 0 ? days : 3,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, {
        leads,
      }),
    );
  });

  getStageFunnel = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const pipelineId = req.query.pipelineId as string | undefined;
    const funnel = await insightsService.getStageFunnel(workspaceId, pipelineId);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.INSIGHTS.RETRIEVED,
        funnel,
      ),
    );
  });

  // Insights page (super admin only)

  getScoreCalibration = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const calibration = await insightsService.getScoreCalibration(workspaceId);
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, {
        calibration,
      }),
    );
  });

  getConfusionMatrix = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const matrix = await insightsService.getConfusionMatrix(workspaceId);
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, matrix),
    );
  });

  getPriorityMismatch = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const leads = await insightsService.getPriorityMismatch(workspaceId);
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, {
        leads,
        total: leads.length,
      }),
    );
  });

  getAtRiskValue = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const atRisk = await insightsService.getAtRiskValue(workspaceId);
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, atRisk),
    );
  });

  getFeatureImportance = asyncHandler(async (_req: Request, res: Response) => {
    const importance = insightsService.getFeatureImportance();
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.INSIGHTS.RETRIEVED,
        importance,
      ),
    );
  });

  getSourcePerformance = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const sources = await insightsService.getSourcePerformance(workspaceId);
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, {
        sources,
      }),
    );
  });
}

export default InsightsController;
