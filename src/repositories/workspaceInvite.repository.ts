import { IWorkspaceInvite, WorkspaceInvite, WorkspaceInviteDocument } from "../models/invite.model";
import { workspaceInviteStatus } from "../types/invite.types";

export interface IWorkspaceInviteRepository {
  createInvite(inviteData: Partial<IWorkspaceInvite>): Promise<WorkspaceInviteDocument>;
  findInviteByToken(token: string): Promise<IWorkspaceInvite | null>;
  updateInviteStatus(token: string, status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'): Promise<IWorkspaceInvite | null>;
  incrementInviteUsage(token: string): Promise<IWorkspaceInvite | null>;
  findInviteByWorkspaceId(workspaceId: string): Promise<IWorkspaceInvite | null>;
}

class WorkspaceInviteRepository implements IWorkspaceInviteRepository {
  async createInvite(inviteData: Partial<IWorkspaceInvite>): Promise<WorkspaceInviteDocument> {
    const invite = WorkspaceInvite.create(inviteData);
    return invite;
  }

  async findInviteByToken(token: string): Promise<IWorkspaceInvite | null> {
    throw new Error("Method not implemented.");
  }

  async updateInviteStatus(token: string, status: workspaceInviteStatus): Promise<IWorkspaceInvite | null> {
    throw new Error("Method not implemented.");
  }

  async incrementInviteUsage(token: string): Promise<IWorkspaceInvite | null> {
    throw new Error("Method not implemented.");
  }

  async findInviteByWorkspaceId(workspaceId: string): Promise<IWorkspaceInvite | null> {
    const token = await WorkspaceInvite.findOne({
      workspaceId,
      type: 'LINK',
      status: 'PENDING',
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    return token;
  }

  async findInviteByWorkspaceIdAndEmail(workspaceId: string, email: string): Promise<IWorkspaceInvite | null> {
    const token = await WorkspaceInvite.findOne({
      workspaceId,
      type: 'EMAIL',
      email,
      status: 'PENDING',
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    return token;
  }

  async revokeInvite(token: string): Promise<IWorkspaceInvite | null> {
    const revokeInvite = await WorkspaceInvite.findOneAndUpdate(
      { token },
      { status: 'REVOKED' },
      { new: true }
    );
    return revokeInvite;
  }
}

export default WorkspaceInviteRepository;
