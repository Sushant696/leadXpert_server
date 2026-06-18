import { z } from "zod";
import { ActivityType } from "./shared.types";

export const ActivitySchema = z.object({
  entityType: z.enum(["LEAD", "DEAL"]),
  entityId: z.string(),

  type: z.enum(Object.values(ActivityType)),

  description: z
    .string()
    .max(500)
    .trim()
    .optional()
    .nullable(),

  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type ActivityTypeSchema = z.infer<typeof ActivitySchema>;
