import { Router } from "express";

import { Roles } from "../constants/roles";
import { middlewares } from "../middlewares/isAuthenticated";
import PipelineController from "../controller/pipeline.controller";
import {
  checkPipelinesAccess,
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";

const pipelineRouter = Router();
const pipelineController = new PipelineController();

// create new pipeline
pipelineRouter.post(
  "/:workspaceId/create",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  pipelineController.createPipeline,
);
// update pipeline
pipelineRouter.patch(
  "/:workspaceId/pipelines/:pipelineId/update",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  pipelineController.updatePipeline,
);

// delete pipeline (archive)
pipelineRouter.delete(
  "/:workspaceId/pipelines/:pipelineId/delete",
  middlewares.isAuthenticated,
  pipelineController.deletePipeline,
);

// pipelines list for sidebar
pipelineRouter.get(
  "/:workspaceId/all",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  pipelineController.getPipelines,
);

// single pipeline + stages
pipelineRouter.get(
  "/:workspaceId/pipeline/:pipelineId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  pipelineController.getSinglePipelineWithStages,
);

export default pipelineRouter;
