import { z } from "zod";

export const WorkspaceInviteSchema = z.object({
  workspaceId: z.string(),
  invitedBy: z.string(),
  token: z.string(),

  type: z.enum(["EMAIL", "LINK"]),
  role: z.enum(["ADMIN", "MEMBER"]),

  // Email invite specific
  email: z.string().email().optional(),

  // Link invite specific
  maxUses: z.number().int().positive().nullable().optional(),

  currentUses: z.number().int().nonnegative(),

  status: z.enum(["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"]),
});


export type workspaceInviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type WorkspaceInviteType = z.infer<typeof WorkspaceInviteSchema>;

