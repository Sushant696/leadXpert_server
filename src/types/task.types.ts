import { z } from "zod";
import { TaskType, TaskStatus, TaskPriority } from "./shared.types";

export const TaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),

  description: z
    .string()
    .max(2000)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  entityType: z.enum(["LEAD", "DEAL"]),
  entityId: z.string(),

  type: z
    .enum(Object.values(TaskType))
    .default(TaskType.FOLLOW_UP),

  priority: z
    .enum(Object.values(TaskPriority))
    .default(TaskPriority.MEDIUM),

  status: z
    .enum(Object.values(TaskStatus))
    .default(TaskStatus.PENDING),

  dueDate: z.coerce.date().optional().nullable(),
  reminderAt: z.coerce.date().optional().nullable(),

  assignedTo: z.string().optional().nullable(),

  resultedInContact: z.boolean().default(false),
});

export type TaskTypeSchema = z.infer<typeof TaskSchema>;
