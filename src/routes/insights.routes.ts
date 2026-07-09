import { Router } from "express";

import InsightsController from "../controller/insights.controller";
import { middlewares } from "../middlewares/isAuthenticated";
import {
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";
import { Roles } from "../constants/roles";

const insightsRouter = Router();
const insightsController = new InsightsController();

// DASHBOARD WIDGETS — visible to every workspace member (agent/admin/super admin)

insightsRouter.get(
  "/:workspaceId/hot-leads",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  insightsController.getHotLeadsToday,
);

insightsRouter.get(
  "/:workspaceId/stage-funnel",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  insightsController.getStageFunnel,
);

// ML EVALUATION INSIGHTS — super admin (workspace creator) only

insightsRouter.get(
  "/:workspaceId/score-calibration",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN]),
  insightsController.getScoreCalibration,
);

insightsRouter.get(
  "/:workspaceId/confusion-matrix",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN]),
  insightsController.getConfusionMatrix,
);

insightsRouter.get(
  "/:workspaceId/priority-mismatch",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN]),
  insightsController.getPriorityMismatch,
);

insightsRouter.get(
  "/:workspaceId/at-risk-value",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN]),
  insightsController.getAtRiskValue,
);

insightsRouter.get(
  "/:workspaceId/feature-importance",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN]),
  insightsController.getFeatureImportance,
);

insightsRouter.get(
  "/:workspaceId/source-performance",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN]),
  insightsController.getSourcePerformance,
);

export default insightsRouter;
