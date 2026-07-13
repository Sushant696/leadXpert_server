import { z } from "zod";
import { Currency, DealStatus, PaymentType } from "./shared.types";

export const DealSchema = z.object({
  title: z.string().min(1).max(200).trim(),

  leadId: z.string(),
  contactId: z.string().optional().nullable(),
  pipelineId: z.string(),

  value: z.number().min(0).default(0),

  currency: z
    .enum(Object.values(Currency))
    .default(Currency.NPR),

  status: z
    .enum(Object.values(DealStatus))
    .default(DealStatus.ACTIVE),

  paymentType: z
    .enum(Object.values(PaymentType))
    .default(PaymentType.INSTALLMENT),

  advancePaid: z.number().min(0).default(0),
  amountReceived: z.number().min(0).default(0),

  serviceDescription: z
    .string()
    .max(2000)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  deliverables: z
    .string()
    .max(300)
    .trim()
    .array()
    .max(30)
    .optional()
    .default([]),

  startDate: z.coerce.date().optional().nullable(),
  expectedEndDate: z.coerce.date().optional().nullable(),
  actualEndDate: z.coerce.date().optional().nullable(),

  assignedTo: z.string().optional().nullable(),
});

export type DealType = z.infer<typeof DealSchema>;
