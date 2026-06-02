import z from "zod";
import { DealSchema } from "../types/deal.types";

export const CreateDealDto = DealSchema.pick({
  title: true,
  leadId: true,
  contactId: true,
  pipelineId: true,
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
  assignedTo: true,
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
