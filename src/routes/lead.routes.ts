import { Router } from "express";

import {
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";
import { Roles } from "../constants/roles";
import { middlewares } from "../middlewares/isAuthenticated";
import LeadController from "../controller/lead.controller";

const leadRouter = Router();
const leadController = new LeadController();

// create lead
leadRouter.post(
  "/:workspaceId/pipelines/:pipelineId/leads",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  leadController.createLead,
);



export default leadRouter;
