import z from "zod";

export const WorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  businessType: z.string().min(1).max(100).optional(),
  teamSize: z.number().min(1).optional(),
  members: z.string().array().optional(),
  inviteCode: z.string().min(1).max(50).optional(),
})

export type WorkspaceType = z.infer<typeof WorkspaceSchema>
