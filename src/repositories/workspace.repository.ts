import { ClientSession, Types } from "mongoose";

import { IWorkspace, Workspace, WorkspaceDocument } from "../models/workspace.model";
import { WorkspaceType } from "../types/workspace.types";

interface IWorkspaceRepository {
  createWorkspace(workspaceData: Partial<IWorkspace>, session: ClientSession): Promise<WorkspaceDocument>
  updateWorkspace(workspaceId: string, workspaceData: Partial<WorkspaceType>): Promise<WorkspaceDocument | null>
  findWorkspaceOfUserByName(name: string, userId: string): Promise<WorkspaceDocument | null>
}

class WorkspaceRepository implements IWorkspaceRepository {
  async createWorkspace(workspaceData: Partial<IWorkspace>, session: ClientSession): Promise<WorkspaceDocument> {
    const workspace = await Workspace.create([workspaceData], { session });
    return workspace[0];
  }

  async updateWorkspace(workspaceId: string, workspaceData: Partial<WorkspaceType>): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findByIdAndUpdate(workspaceId, workspaceData, { new: true });
    return workspace;
  }

  // find workspace by name with same user id
  async findWorkspaceOfUserByName(name: string, userId: string): Promise<WorkspaceDocument | null> {
    return await Workspace.findOne({
      name,
      owner: new Types.ObjectId(userId),
    });
  }
}
export default WorkspaceRepository;
