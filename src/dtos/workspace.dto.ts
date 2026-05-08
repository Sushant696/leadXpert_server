import { WorkspaceSchema } from "../types/workspace.types";

export const CreateWorkspaceDto = WorkspaceSchema.pick({
  name: true,
  businessType: true,
  teamSize: true,
});

export const updateWorkspaceDto = WorkspaceSchema.pick({
  name: true,
  businessType: true,
  teamSize: true,
});
