import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import ActivityService from "../services/activity.service";
import responseMessages from "../constants/responseMessages";

const activityService = new ActivityService();

class ActivityController {
  getActivities = asyncHandler(async (req: Request, res: Response) => {
    const entityType = req.params.entityType;
    const entityId = req.params.entityId;

    const activities = await activityService.getActivitiesByEntity(
      entityType,
      entityId,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.ACTIVITY.RETRIEVED, {
        activities,
      }),
    );
  });
}

export default ActivityController;
