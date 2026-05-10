import { Router } from "express";
import WorkspaceController from "../controller/workspace.controller";
import { middlewares } from "../middlewares/isAuthenticated";
import { checkWorkspaceMembership, requiredCompanyRole } from "../middlewares/hasPermission";
import { Roles } from "../constants/roles";

const workspaceRouter = Router()
const workspaceController = new WorkspaceController();

workspaceRouter.post("/", middlewares.isAuthenticated, workspaceController.createWorkspace)
workspaceRouter.get("/", middlewares.isAuthenticated, workspaceController.getAllWorkspaces)
workspaceRouter.patch("/:workspaceId", middlewares.isAuthenticated, workspaceController.updateWorkspace)

workspaceRouter.post("/:workspaceId/invite/link",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.ADMIN, Roles.SUPER_ADMIN]),
  workspaceController.getInvitationLink
)

workspaceRouter.post("/:workspaceId/invite/email",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.ADMIN, Roles.SUPER_ADMIN]),
  workspaceController.getInvitationByEmail
)

workspaceRouter.post("/", middlewares.isAuthenticated, workspaceController.updateWorkspace)

export default workspaceRouter;
