import { Router } from "express";

import {
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";
import { Roles } from "../constants/roles";
import { middlewares } from "../middlewares/isAuthenticated";
import TaskController from "../controller/task.controller";

const taskRouter = Router();
const taskController = new TaskController();

// create task
taskRouter.post(
  "/:workspaceId/tasks",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  taskController.createTask,
);

// get my tasks
taskRouter.get(
  "/:workspaceId/tasks",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  taskController.getTasks,
);

// update task
taskRouter.patch(
  "/:workspaceId/tasks/:taskId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  taskController.updateTask,
);

// complete task
taskRouter.patch(
  "/:workspaceId/tasks/:taskId/complete",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  taskController.completeTask,
);

// delete task
taskRouter.delete(
  "/:workspaceId/tasks/:taskId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  taskController.deleteTask,
);

export default taskRouter;
