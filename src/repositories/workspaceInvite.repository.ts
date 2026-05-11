import { ClientSession } from "mongoose";
import {
  IWorkspaceInvite,
  WorkspaceInvite,
  WorkspaceInviteDocument,
} from "../models/invite.model";

export interface IWorkspaceInviteRepository {
  createInvite(
    inviteData: Partial<IWorkspaceInvite>,
  ): Promise<WorkspaceInviteDocument>;
  findInviteByToken(token: string): Promise<IWorkspaceInvite | null>;
  incrementInviteUsage(
    token: string,
    session: ClientSession,
  ): Promise<IWorkspaceInvite | null>;
  findInviteOfTypeLinkByWorkspaceId(
    workspaceId: string,
  ): Promise<IWorkspaceInvite | null>;
  findAllInvites(workspaceId: string): Promise<IWorkspaceInvite[] | null>;
  findInviteByWorkspaceIdAndEmail(
    workspaceId: string,
    email: string,
  ): Promise<IWorkspaceInvite | null>;
  revokeInvite(token: string): Promise<IWorkspaceInvite | null>;
  revokeInviteById(id: string): Promise<IWorkspaceInvite | null>;
  deleteInvitesByWorkspaceId(
    workspaceId: string,
    session: ClientSession,
  ): Promise<void>;
}

class WorkspaceInviteRepository implements IWorkspaceInviteRepository {
  async createInvite(
    inviteData: Partial<IWorkspaceInvite>,
  ): Promise<WorkspaceInviteDocument> {
    const invite = WorkspaceInvite.create(inviteData);
    return invite;
  }

  async findInviteByToken(token: string): Promise<IWorkspaceInvite | null> {
    const invite = await WorkspaceInvite.findOne({ token });
    return invite;
  }

  async incrementInviteUsage(
    token: string,
    session: ClientSession,
  ): Promise<IWorkspaceInvite | null> {
    const updatedInvite = await WorkspaceInvite.findOneAndUpdate(
      {
        token,
      },
      {
        $inc: { usageCount: 1 },
      },
      {
        session,
        new: true,
      },
    );
    return updatedInvite;
  }

  async findInviteOfTypeLinkByWorkspaceId(
    workspaceId: string,
  ): Promise<IWorkspaceInvite | null> {
    const token = await WorkspaceInvite.findOne({
      workspaceId,
      type: "LINK",
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    return token;
  }

  async findAllInvites(
    workspaceId: string,
  ): Promise<IWorkspaceInvite[] | null> {
    const token = await WorkspaceInvite.find({
      workspaceId,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    return token;
  }

  async findInviteByWorkspaceIdAndEmail(
    workspaceId: string,
    email: string,
  ): Promise<IWorkspaceInvite | null> {
    const token = await WorkspaceInvite.findOne({
      workspaceId,
      type: "EMAIL",
      email,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    return token;
  }

  async revokeInvite(token: string): Promise<IWorkspaceInvite | null> {
    const revokeInvite = await WorkspaceInvite.findOneAndUpdate(
      { token },
      { status: "REVOKED" },
      { new: true },
    );
    return revokeInvite;
  }

  async revokeInviteById(id: string): Promise<IWorkspaceInvite | null> {
    const revokeInvite = await WorkspaceInvite.findOneAndUpdate(
      { _id: id },
      { status: "REVOKED" },
      { new: true },
    );
    return revokeInvite;
  }

  async deleteInvitesByWorkspaceId(
    workspaceId: string,
    session: ClientSession,
  ): Promise<void> {
    await WorkspaceInvite.deleteMany({ workspaceId }, { session });
    return;
  }
}

export default WorkspaceInviteRepository;
