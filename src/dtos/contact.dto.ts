import z from "zod";
import { ContactSchema } from "../types/contact.types";

export const CreateContactDto = ContactSchema.pick({
  name: true,
  email: true,
  phone: true,
  companyName: true,
  designation: true,
  address: true,
  source: true,
  tags: true,
});

export type CreateContactDto = z.infer<typeof CreateContactDto>;

export const UpdateContactDto = ContactSchema.partial().pick({
  name: true,
  email: true,
  phone: true,
  companyName: true,
  designation: true,
  address: true,
  source: true,
  tags: true,
});

export type UpdateContactDto = z.infer<typeof UpdateContactDto>;
