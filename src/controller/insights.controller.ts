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
    const pipelineId = req.query.pipelineId as string | undefined;
    const calibration = await insightsService.getScoreCalibration(
      workspaceId,
      pipelineId,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, {
        calibration,
      }),
    );
  });

  getConfusionMatrix = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const pipelineId = req.query.pipelineId as string | undefined;
    const matrix = await insightsService.getConfusionMatrix(
      workspaceId,
      pipelineId,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, matrix),
    );
  });

  getPriorityMismatch = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const pipelineId = req.query.pipelineId as string | undefined;
    const leads = await insightsService.getPriorityMismatch(
      workspaceId,
      pipelineId,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, {
        leads,
        total: leads.length,
      }),
    );
  });

  getAtRiskValue = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const pipelineId = req.query.pipelineId as string | undefined;
    const atRisk = await insightsService.getAtRiskValue(workspaceId, pipelineId);
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

  // Insights page "What actually drives a sale" — static, not pipeline-scoped.
  getDriverRanking = asyncHandler(async (_req: Request, res: Response) => {
    const drivers = insightsService.getDriverRanking();
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, drivers),
    );
  });

  getSourcePerformance = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const pipelineId = req.query.pipelineId as string | undefined;
    const sources = await insightsService.getSourcePerformance(
      workspaceId,
      pipelineId,
    );
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.INSIGHTS.RETRIEVED, {
        sources,
      }),
    );
  });

  // Insights page "Where deals fall apart" — pipeline-scoped.
  getLossStageBreakdown = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const pipelineId = req.query.pipelineId as string | undefined;
    const breakdown = await insightsService.getLossStageBreakdown(
      workspaceId,
      pipelineId,
    );
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.INSIGHTS.RETRIEVED,
        breakdown,
      ),
    );
  });
}

export default InsightsController;
