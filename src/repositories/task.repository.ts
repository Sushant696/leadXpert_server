import { Types } from "mongoose";
import { Task, TaskDocument, ITask } from "../models/task.model";

interface ITaskRepository {
  createTask(taskData: Partial<ITask>): Promise<TaskDocument>;
  getTaskById(taskId: string): Promise<TaskDocument | null>;
  getTasksByWorkspaceId(
    workspaceId: string,
    options?: { entityType?: string; entityId?: string; status?: string; assignedTo?: string },
  ): Promise<TaskDocument[]>;
  updateTask(taskId: string, taskData: Partial<ITask>): Promise<TaskDocument | null>;
  completeTask(taskId: string, userId: string): Promise<TaskDocument | null>;
  deleteTask(taskId: string): Promise<void>;
}

class TaskRepository implements ITaskRepository {
  async createTask(taskData: Partial<ITask>): Promise<TaskDocument> {
    return await Task.create(taskData);
  }

  async getTaskById(taskId: string): Promise<TaskDocument | null> {
    return await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("completedBy", "name email");
  }

  async getTasksByWorkspaceId(
    workspaceId: string,
    options?: { entityType?: string; entityId?: string; status?: string; assignedTo?: string },
  ): Promise<TaskDocument[]> {
    const query: any = { workspaceId };

    if (options?.assignedTo) {
      query.assignedTo = new Types.ObjectId(options.assignedTo);
    }

    if (options?.entityType) {
      query.entityType = options.entityType;
    }

    if (options?.entityId) {
      query.entityId = new Types.ObjectId(options.entityId);
    }

    if (options?.status) {
      query.status = options.status;
    }

    return await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("completedBy", "name email")
      .sort({ dueDate: 1, createdAt: -1 });
  }

  async updateTask(
    taskId: string,
    taskData: Partial<ITask>,
  ): Promise<TaskDocument | null> {
    return await Task.findByIdAndUpdate(taskId, taskData, { new: true });
  }

  async completeTask(taskId: string, userId: string): Promise<TaskDocument | null> {
    return await Task.findByIdAndUpdate(
      taskId,
      {
        status: "COMPLETED",
        completedAt: new Date(),
        completedBy: new Types.ObjectId(userId),
      },
      { new: true },
    );
  }

  async deleteTask(taskId: string): Promise<void> {
    await Task.findByIdAndDelete(taskId);
  }
}

export default TaskRepository;
