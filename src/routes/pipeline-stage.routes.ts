import { Router } from "express";
import { middlewares } from "../middlewares/isAuthenticated";
import {
  checkPipelinesAccess,
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";
import { Roles } from "../constants/roles";
import PipelineStageController from "../controller/pipeline-stage.controller";

const pipelineStageRouter = Router();
const pipelineStageController = new PipelineStageController();

// create pipeline stage
pipelineStageRouter.post(
  "/:workspaceId/pipelines/:pipelineId/stages",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  pipelineStageController.createPipelineStage,
);

// reorder pipeline stage
pipelineStageRouter.patch(
  "/:workspaceId/pipelines/:pipelineId/stages/reorder",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  pipelineStageController.reorderPipelineStage,
);

// update pipeline stage
pipelineStageRouter.patch(
  "/:workspaceId/pipelines/:pipelineId/stages/:stageId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  pipelineStageController.updatePipelineStage,
);

pipelineStageRouter.delete(
  "/:workspaceId/pipelines/:pipelineId/stages/:stageId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  pipelineStageController.updatePipelineStage,
);

export default pipelineStageRouter;
