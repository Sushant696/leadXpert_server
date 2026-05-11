import z from "zod";

export const WorkspaceSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  members: z.string().array().optional(),
  inviteCode: z.string().min(1).max(50).optional(),
  businessType: z
    .string()
    .min(1)
    .max(100)
    .trim()
    .optional()
    .nullable()
    .transform(val => val === '' ? undefined : val),
  teamSize: z
    .number()
    .min(1)
    .optional()
    .nullable()
    .transform(val => val === null ? undefined : val),
  profilePicture: z
    .string()
    .url()
    .optional()
    .nullable()
    .transform(val => val === '' ? undefined : val),

})

export type WorkspaceType = z.infer<typeof WorkspaceSchema>
