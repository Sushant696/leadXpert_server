import { Router } from "express";

import { checkWorkspaceMembership } from "../middlewares/hasPermission";
import { middlewares } from "../middlewares/isAuthenticated";
import ActivityController from "../controller/activity.controller";

const activityRouter = Router();
const activityController = new ActivityController();

// get activities for entity (timeline)
activityRouter.get(
  "/:workspaceId/activities/:entityType/:entityId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  activityController.getActivities,
);

export default activityRouter;
