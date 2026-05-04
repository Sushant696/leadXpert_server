
import { z } from "zod";
import { MembershipSchema } from "../types/membership.types";

export const MembershipRelationDTO = MembershipSchema.pick({
  userId: true,
  workspaceId: true,
  role: true,
});

export type MembershipRelationDTO = z.infer<typeof MembershipRelationDTO>;
