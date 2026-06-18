import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { ITask } from "../models/task.model";
import TaskRepository from "../repositories/task.repository";
import { Lead } from "../models/lead.model";

const taskRepository = new TaskRepository();

class TaskService {
  async createTask(
    workspaceId: string,
    userId: string,
    taskData: CreateTaskDto,
  ) {
    const task = await taskRepository.createTask({
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(userId),
      entityType: taskData.entityType,
      entityId: new Types.ObjectId(taskData.entityId),
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      reminderAt: taskData.reminderAt,
      assignedTo: taskData.assignedTo
        ? new Types.ObjectId(taskData.assignedTo)
        : null,
    });

    // Increment taskCount on the parent entity
    if (taskData.entityType === "LEAD") {
      await Lead.findByIdAndUpdate(taskData.entityId, { $inc: { taskCount: 1 } });
    }

    return task;
  }

  async getTasksByWorkspaceId(workspaceId: string, options?: any) {
    const tasks = await taskRepository.getTasksByWorkspaceId(
      workspaceId,
      options,
    );
    return tasks;
  }

  async getTaskById(workspaceId: string, taskId: string) {
    const task = await taskRepository.getTaskById(taskId);

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.TASK.NOT_FOUND);
    }

    if (task.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    return task;
  }

  async updateTask(workspaceId: string, taskId: string, data: UpdateTaskDto) {
    const task = await taskRepository.getTaskById(taskId);

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.TASK.NOT_FOUND);
    }

    if (task.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    const updatePayload: Partial<ITask> = {
      ...data,
      assignedTo: data.assignedTo
        ? new Types.ObjectId(data.assignedTo)
        : data.assignedTo === null
          ? null
          : undefined,
    };

    const updatedTask = await taskRepository.updateTask(taskId, updatePayload);
    return updatedTask;
  }

  async completeTask(workspaceId: string, taskId: string, userId: string) {
    const task = await taskRepository.getTaskById(taskId);

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.TASK.NOT_FOUND);
    }

    if (task.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    const completedTask = await taskRepository.completeTask(taskId, userId);
    return completedTask;
  }

  async deleteTask(workspaceId: string, taskId: string) {
    const task = await taskRepository.getTaskById(taskId);

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.TASK.NOT_FOUND);
    }

    if (task.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    // Decrement taskCount on the parent entity
    if (task.entityType === "LEAD") {
      await Lead.findByIdAndUpdate(task.entityId, { $inc: { taskCount: -1 } });
    }

    await taskRepository.deleteTask(taskId);
  }
}

export default TaskService;
