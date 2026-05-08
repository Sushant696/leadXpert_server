import { Router } from "express";
import WorkspaceController from "../controller/workspace.controller";
import { middlewares } from "../middlewares/isAuthenticated";

const workspaceRouter = Router()
const workspaceController = new WorkspaceController();

workspaceRouter.post("/", middlewares.isAuthenticated, workspaceController.createWorkspace)
workspaceRouter.patch("/:id", middlewares.isAuthenticated, workspaceController.updateWorkspace)

export default workspaceRouter;
