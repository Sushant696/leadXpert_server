import z from "zod";
import { TaskSchema } from "../types/task.types";

export const CreateTaskDto = TaskSchema.pick({
  title: true,
  description: true,
  entityType: true,
  entityId: true,
  type: true,
  priority: true,
  dueDate: true,
  reminderAt: true,
  assignedTo: true,
});

export type CreateTaskDto = z.infer<typeof CreateTaskDto>;

export const UpdateTaskDto = TaskSchema.partial().pick({
  title: true,
  description: true,
  type: true,
  priority: true,
  status: true,
  dueDate: true,
  reminderAt: true,
  assignedTo: true,
  resultedInContact: true,
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskDto>;
