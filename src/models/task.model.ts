import { Schema, Types, model, HydratedDocument } from "mongoose";

import { TaskTypeSchema } from "../types/task.types";
import { TaskType, TaskStatus, TaskPriority } from "../types/shared.types";

export interface ITask extends Omit<
  TaskTypeSchema,
  | "entityId" | "assignedTo"
  | "dueDate" | "reminderAt"
  | "description" | "entityType"
> {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;

  entityType: "LEAD" | "DEAL";
  entityId: Types.ObjectId;

  title: string;
  description?: string | null;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;

  dueDate?: Date | null;
  reminderAt?: Date | null;
  completedAt?: Date | null;
  completedBy?: Types.ObjectId | null;

  assignedTo?: Types.ObjectId | null;

  resultedInContact: boolean;
}

const TaskSchema = new Schema<ITask>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    entityType: {
      type: String,
      enum: ["LEAD", "DEAL"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: Object.values(TaskType),
      default: TaskType.FOLLOW_UP,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },

    dueDate: { type: Date, default: null },
    reminderAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resultedInContact: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

// Indexes
TaskSchema.index({ entityType: 1, entityId: 1, status: 1 });
TaskSchema.index({ workspaceId: 1, assignedTo: 1, status: 1 });
TaskSchema.index({ workspaceId: 1, dueDate: 1, status: 1 });

export type TaskDocument = HydratedDocument<ITask>;
export const Task = model<ITask>("Task", TaskSchema);
