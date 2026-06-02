import z from "zod";
import { LeadSchema } from "../types/lead.types";

export const CreateLeadDto = LeadSchema.pick({
  title: true,
  contactId: true,
  pipelineId: true,
  stageId: true,
  value: true,
  currency: true,
  source: true,
  priority: true,
  tags: true,
  quickNote: true,
  nextFollowUpAt: true,
  assignedTo: true,
});

export type CreateLeadDto = z.infer<typeof CreateLeadDto>;

export const UpdateLeadDto = LeadSchema.partial().pick({
  title: true,
  value: true,
  currency: true,
  source: true,
  priority: true,
  status: true,
  tags: true,
  quickNote: true,
  nextFollowUpAt: true,
  assignedTo: true,
  lostReason: true,
  lostReasonTag: true,
});

export type UpdateLeadDto = z.infer<typeof UpdateLeadDto>;

export const MoveLeadDto = z.object({
  stageId: z.string().min(1),
});

export type MoveLeadDto = z.infer<typeof MoveLeadDto>;

export const ConvertLeadDto = z.object({
  dealTitle: z.string().min(1).max(200).trim().optional(),
});

export type ConvertLeadDto = z.infer<typeof ConvertLeadDto>;
