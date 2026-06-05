import { Request, Response } from "express";
import z from "zod";
import { StatusCodes } from "http-status-codes";

import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import TaskService from "../services/task.service";
import responseMessages from "../constants/responseMessages";

const taskService = new TaskService();

class TaskController {
  createTask = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreateTaskDto.safeParse(req.body);
    const userId = req.user?.id;
    const workspaceId = req.params.workspaceId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const task = await taskService.createTask(
      workspaceId,
      userId,
      parsedData.data,
    );

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, responseMessages.TASK.CREATED, {
        task,
      }),
    );
  });

  getTasks = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const { entityType, entityId, status, assignedTo } = req.query;

    const options = {
      entityType: entityType as string | undefined,
      entityId: entityId as string | undefined,
      status: status as string | undefined,
      assignedTo: assignedTo === "me" ? req.user?.id : (assignedTo as string | undefined),
    };

    const tasks = await taskService.getTasksByWorkspaceId(workspaceId, options);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.TASK.RETRIEVED, {
        tasks,
      }),
    );
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = UpdateTaskDto.safeParse(req.body);
    const workspaceId = req.params.workspaceId;
    const taskId = req.params.taskId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const task = await taskService.updateTask(
      workspaceId,
      taskId,
      parsedData.data,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.TASK.UPDATED, {
        task,
      }),
    );
  });

  completeTask = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const taskId = req.params.taskId;
    const userId = req.user?.id;

    const task = await taskService.completeTask(workspaceId, taskId, userId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.TASK.COMPLETED, {
        task,
      }),
    );
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const taskId = req.params.taskId;

    await taskService.deleteTask(workspaceId, taskId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.TASK.DELETED),
    );
  });
}

export default TaskController;
