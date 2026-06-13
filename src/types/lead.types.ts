import { z } from "zod";
import {
  LeadSource,
  LeadStatus,
  LeadPriority,
  Currency,
  LostReasonTag,
} from "./shared.types";


export const LeadSchema = z.object({
  title: z.string().min(1).max(200).trim(),

  contactId: z.string(),
  pipelineId: z.string(),
  stageId: z.string(),

  value: z.number().min(0).default(0),

  currency: z
    .enum(Object.values(Currency))
    .default(Currency.NPR),

  source: z.enum(Object.values(LeadSource)).optional().nullable(),

  priority: z
    .enum(Object.values(LeadPriority))
    .default(LeadPriority.MEDIUM),

  status: z
    .enum(Object.values(LeadStatus))
    .default(LeadStatus.OPEN),

  tags: z.string().max(40).trim().array().max(20).optional().default([]),

  quickNote: z
    .string()
    .max(500)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  nextFollowUpAt: z.coerce.date().optional().nullable(),

  assignedTo: z.string().optional().nullable(),

  // Lost reason fields
  lostReason: z
    .string()
    .max(500)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  lostReasonTag: z
    .enum(Object.values(LostReasonTag))
    .optional()
    .nullable(),
});

export type LeadType = z.infer<typeof LeadSchema>;
