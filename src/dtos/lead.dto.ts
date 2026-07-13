import z from "zod";
import { LeadSchema } from "../types/lead.types";
import { Currency, PaymentType, LostReasonTag } from "../types/shared.types";

export const CreateLeadDto = LeadSchema.pick({
  title: true,
  stageId: true,
  value: true,
  currency: true,
  source: true,
  priority: true,
  tags: true,
  quickNote: true,
  nextFollowUpAt: true,
  assignedTo: true,
}).extend({
  contactId: z.string().optional().nullable(),
  stageId: z.string().optional().nullable(),
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

// Deal details captured by the frontend Won dialog and forwarded on the
// stage-move request when the target stage is a WON-type stage. Mirrors the
// dealDetails shape in the central moveLeadToStage service.
export const DealDetailsDto = z.object({
  title: z.string().min(1).max(200).trim(),
  value: z.number().min(0),
  currency: z.enum(Object.values(Currency)),
  paymentType: z.enum(Object.values(PaymentType)),
  advancePaid: z.number().min(0).optional(),
  amountReceived: z.number().min(0).optional(),
  serviceDescription: z.string().max(2000).trim().optional().nullable(),
  deliverables: z.string().max(300).trim().array().max(30).optional(),
  startDate: z.coerce.date().optional().nullable(),
  expectedEndDate: z.coerce.date().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
});

export type DealDetailsDto = z.infer<typeof DealDetailsDto>;

// The stage-move endpoint is the single entry point for OPEN/WON/LOST moves.
// `dealDetails` is required by the service when the target stage is WON;
// `lostReason` + `lostReasonTag` are required when it is LOST. Validation of
// which fields are required for a given target lives in the service, since it
// depends on the target stage's type.
export const MoveLeadDto = z.object({
  stageId: z.string().min(1),
  dealDetails: DealDetailsDto.optional(),
  lostReason: z.string().max(500).trim().optional().nullable(),
  lostReasonTag: z.enum(Object.values(LostReasonTag)).optional().nullable(),
});

export type MoveLeadDto = z.infer<typeof MoveLeadDto>;

export const ConvertLeadDto = z.object({
  dealTitle: z.string().min(1).max(200).trim().optional(),
});

export type ConvertLeadDto = z.infer<typeof ConvertLeadDto>;
