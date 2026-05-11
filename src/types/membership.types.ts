import { z } from "zod";
import { Roles } from "../constants/roles";

export const MembershipSchema = z.object({
  userId: z.string().min(1),
  workspaceId: z.string().min(1),
  role: z.enum(Roles),
});

export type MembershipType = z.infer<typeof MembershipSchema>
