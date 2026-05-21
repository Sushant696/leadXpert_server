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
  pipelineStageController.createPipeline,
);

export default pipelineStageRouter;
