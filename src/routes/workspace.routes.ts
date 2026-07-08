import { Router } from "express";
import WorkspaceController from "../controller/workspace.controller";
import { middlewares } from "../middlewares/isAuthenticated";
import {
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";
import { Roles } from "../constants/roles";

const workspaceRouter = Router();
const workspaceController = new WorkspaceController();

// WORKSPACE MANAGEMENT

workspaceRouter.post(
  "/",
  middlewares.isAuthenticated,
  workspaceController.createWorkspace,
);
workspaceRouter.get(
  "/",
  middlewares.isAuthenticated,
  workspaceController.getAllWorkspaces,
);
workspaceRouter.patch(
  "/:workspaceId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  workspaceController.updateWorkspace,
);
workspaceRouter.delete(
  "/:workspaceId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN]),
  workspaceController.deleteWorkspace,
);

// DASHBOARD STATS
workspaceRouter.get(
  "/:workspaceId/dashboard/stats",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  workspaceController.getDashboardStats,
);

// INVITE MANAGEMENT

workspaceRouter.post(
  "/:workspaceId/invite/link",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.ADMIN, Roles.SUPER_ADMIN]),
  workspaceController.getInvitationLink,
);

workspaceRouter.post(
  "/:workspaceId/invite/email",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.ADMIN, Roles.SUPER_ADMIN]),
  workspaceController.getInvitationByEmail,
);

workspaceRouter.post(
  "/join/:token",
  middlewares.isAuthenticated,
  workspaceController.joinWorkspace,
);

workspaceRouter.get(
  "/:workspaceId/invites",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.ADMIN, Roles.SUPER_ADMIN]),
  workspaceController.getActiveInvites,
);

workspaceRouter.delete(
  "/:workspaceId/invites/:inviteId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.ADMIN, Roles.SUPER_ADMIN]),
  workspaceController.revokeInvite,
);

// MEMBER MANAGEMENT
workspaceRouter.get(
  "/:workspaceId/members",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  workspaceController.getWorkspaceMembers
);

workspaceRouter.patch(
  "/:workspaceId/members/",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  workspaceController.updateMemberRole
);

workspaceRouter.delete(
  "/:workspaceId/members/",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.ADMIN, Roles.SUPER_ADMIN]),
  workspaceController.removeMember
);

export default workspaceRouter;
