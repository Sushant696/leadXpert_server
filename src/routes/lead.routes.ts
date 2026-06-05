import { Router } from "express";

import {
  checkWorkspaceMembership,
  requiredCompanyRole,
  checkPipelinesAccess,
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
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  leadController.createLead,
);

// get all leads by workspace
leadRouter.get(
  "/:workspaceId/all",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  leadController.getLeadsByWorkspace,
);

// get all leads (kanban + list view)
leadRouter.get(
  "/:workspaceId/pipelines/:pipelineId/leads",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  leadController.getLeads,
);

// get single lead with contact
leadRouter.get(
  "/:workspaceId/pipelines/:pipelineId/leads/:leadId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  leadController.getLeadById,
);

// update lead
leadRouter.patch(
  "/:workspaceId/pipelines/:pipelineId/leads/:leadId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  leadController.updateLead,
);

// move lead to stage
leadRouter.patch(
  "/:workspaceId/pipelines/:pipelineId/leads/:leadId/stage",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  leadController.moveLeadToStage,
);

// assign lead to user
leadRouter.patch(
  "/:workspaceId/pipelines/:pipelineId/leads/:leadId/assign",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  leadController.assignLeadToUser,
);

// convert lead to deal
leadRouter.patch(
  "/:workspaceId/pipelines/:pipelineId/leads/:leadId/convert",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  leadController.convertLeadToDeal,
);

// mark lead as lost
leadRouter.patch(
  "/:workspaceId/pipelines/:pipelineId/leads/:leadId/lost",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  leadController.markLeadAsLost,
);

// archive lead
leadRouter.delete(
  "/:workspaceId/pipelines/:pipelineId/leads/:leadId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  checkPipelinesAccess,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  leadController.archiveLead,
);

export default leadRouter;
