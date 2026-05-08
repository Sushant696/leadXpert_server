import { ClientSession, Types } from "mongoose";
import { Workspace, WorkspaceDocument } from "../models/workspace.model";
import { WorkspaceType } from "../types/workspace.types";

interface IWorkspaceRepository {
  createWorkspace(workspaceData: Partial<WorkspaceType>, session: ClientSession): Promise<WorkspaceDocument>
  updateWorkspace(workspaceId: string, workspaceData: Partial<WorkspaceType>): Promise<WorkspaceDocument | null>
  findWorkspaceOfUserByName(name: string, userId: string): Promise<WorkspaceDocument | null>
}

class WorkspaceRepository implements IWorkspaceRepository {
  async createWorkspace(workspaceData: Partial<WorkspaceType>, session: ClientSession): Promise<WorkspaceDocument> {
    const convertedData = {
      ...workspaceData,
      members: workspaceData.members?.map(memberId => new Types.ObjectId(memberId))
    };
    const workspace = await Workspace.create(
      [convertedData],
      { session }
    );
    console.log(workspace)
    return workspace[0];
  }

  async updateWorkspace(workspaceId: string, workspaceData: Partial<WorkspaceType>): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findByIdAndUpdate(workspaceId, workspaceData, { new: true });
    return workspace;
  }

  // find workspace by name with same user id
  async findWorkspaceOfUserByName(name: string, userId: string): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findOne({ name, owner: userId });
    return workspace;
  }
}
export default WorkspaceRepository;
