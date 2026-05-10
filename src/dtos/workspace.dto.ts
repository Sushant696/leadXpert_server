import z from "zod";
import { WorkspaceSchema } from "../types/workspace.types";

// only the name is required
export const CreateWorkspaceDto = WorkspaceSchema.pick({
  name: true,
  businessType: true,
  teamSize: true,
}).partial().extend({
  name: WorkspaceSchema.shape.name,
});

export const updateWorkspaceDto = WorkspaceSchema.pick({
  name: true,
  businessType: true,
  teamSize: true,
}).partial();

export const InvigationByEmailDto = z.object({
  email: z.string().email("Invalid email address"),
})

export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceDto>;
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceDto>; 
