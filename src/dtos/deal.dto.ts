import z from "zod";
import { DealSchema } from "../types/deal.types";

export const CreateDealDto = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
});

export type CreateDealDto = z.infer<typeof CreateDealDto>;

export const UpdateDealDto = DealSchema.partial().pick({
  title: true,
  value: true,
  currency: true,
  status: true,
  paymentType: true,
  advancePaid: true,
  amountReceived: true,
  serviceDescription: true,
  deliverables: true,
  startDate: true,
  expectedEndDate: true,
  actualEndDate: true,
  assignedTo: true,
});

export type UpdateDealDto = z.infer<typeof UpdateDealDto>;
