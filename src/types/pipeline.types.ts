import { z } from "zod";
import {
  BusinessVertical,
  PipelineVisibility,
  Currency,
} from "./shared.types";

export const PipelineSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .trim(),

  description: z
    .string()
    .max(500)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#3B82F6"),

  icon: z
    .string()
    .max(10)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  currency: z
    .enum(Object.values(Currency))
    .default(Currency.NPR),

  vertical: z
    .enum(Object.values(BusinessVertical))
    .default(BusinessVertical.GENERAL),

  visibility: z
    .enum(Object.values(PipelineVisibility))
    .default(PipelineVisibility.WORKSPACE),

  isArchived: z
    .boolean()
    .default(false),

  memberIds: z
    .string()
    .array()
    .optional(),

  templateId: z
    .string()
    .optional(),
});

const Pipeline = PipelineSchema.pick({
  name: true
}).extend({
  id: z.string(),
  workspaceId: z.string()
})

export type Pipeline = z.infer<typeof Pipeline>
export type PipelineType = z.infer<typeof PipelineSchema>;
