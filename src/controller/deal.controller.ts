import { Request, Response } from "express";
import z from "zod";
import { StatusCodes } from "http-status-codes";

import { CreateDealDto, UpdateDealDto } from "../dtos/deal.dto";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import DealService from "../services/deal.service";
import responseMessages from "../constants/responseMessages";

const dealService = new DealService();

class DealController {
  createDeal = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreateDealDto.safeParse(req.body);
    const userId = req.user?.id;
    const workspaceId = req.params.workspaceId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const deal = await dealService.createDeal(
      workspaceId,
      userId,
      parsedData.data,
    );

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, responseMessages.DEAL.CREATED, {
        deal,
      }),
    );
  });

  getDeals = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const { assignedTo, search, status } = req.query;

    const options = {
      assignedTo: assignedTo as string | undefined,
      search: search as string | undefined,
      status: status as string | undefined,
    };

    const deals = await dealService.getDealsByWorkspaceId(workspaceId, options);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.DEAL.RETRIEVED, {
        deals,
      }),
    );
  });

  getDealById = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const dealId = req.params.dealId;

    const deal = await dealService.getDealById(workspaceId, dealId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.DEAL.RETRIEVED, {
        deal,
      }),
    );
  });

  updateDeal = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = UpdateDealDto.safeParse(req.body);
    const workspaceId = req.params.workspaceId;
    const dealId = req.params.dealId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const deal = await dealService.updateDeal(
      workspaceId,
      dealId,
      parsedData.data,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.DEAL.UPDATED, {
        deal,
      }),
    );
  });
}

export default DealController;