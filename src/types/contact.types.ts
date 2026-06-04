import { z } from "zod";
import { LeadSource } from "./shared.types";

export const ContactSchema = z.object({
  name: z.string().min(1).max(120).trim(),

  email: z
    .string()
    .email()
    .max(200)
    .trim()
    .toLowerCase()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  phone: z
    .string()
    .max(20)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),


  companyName: z
    .string()
    .max(150)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  designation: z
    .string()
    .max(100)
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),

  address: z
    .object({
      district: z.string().max(60).trim().optional().nullable(),
      city: z.string().max(60).trim().optional().nullable(),
    })
    .optional()
    .nullable(),

  source: z.enum(Object.values(LeadSource)).optional().nullable(),

  tags: z.string().max(40).trim().array().max(20).optional().default([]),
});

export type ContactType = z.infer<typeof ContactSchema>;
