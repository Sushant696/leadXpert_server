import { z } from "zod";
import { StageType } from "./shared.types";

export const PipelineStageSchema = z.object({
  name: z.string().min(1).max(80).trim(),

  description: z
    .string()
    .max(300)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : (val ?? null))),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#3B82F6"),

  type: z.enum(Object.values(StageType)).default(StageType.OPEN),

  probability: z.number().min(0).max(100).default(20),
});

export type PipelineStageType = z.infer<typeof PipelineStageSchema>;
