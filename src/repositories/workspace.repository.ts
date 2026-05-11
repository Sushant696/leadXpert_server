import { ClientSession, Types } from "mongoose";

import {
  IWorkspace,
  Workspace,
  WorkspaceDocument,
} from "../models/workspace.model";
import { WorkspaceType } from "../types/workspace.types";
import ApiError from "../exceptions/apiError";
import { StatusCodes } from "http-status-codes";

interface IWorkspaceRepository {
  createWorkspace(
    workspaceData: Partial<IWorkspace>,
    session: ClientSession,
  ): Promise<WorkspaceDocument>;
  updateWorkspaceById(
    workspaceId: string,
    workspaceData: Partial<WorkspaceType>,
  ): Promise<WorkspaceDocument | null>;
  findWorkspaceOfUserByName(
    name: string,
    userId: string,
  ): Promise<WorkspaceDocument | null>;
  addMemberToWorkspace(
    workspaceId: string,
    userId: string,
    session: ClientSession,
  ): Promise<WorkspaceDocument | null>;
  findWorkspaceByWorkspaceAndOwnerId(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceDocument | null>;
  findWorkspaceById(workspaceId: string): Promise<WorkspaceDocument | null>;
  deleteWorkspaceById(
    workspaceId: string,
    session: ClientSession,
  ): Promise<void>;
  findAllMembersOfWorkspace(workspaceId: string): Promise<any>;
  removeMemberFromWorkspace(
    workspaceId: string,
    membershipId: string,
    session: ClientSession,
  ): Promise<WorkspaceDocument | null>;
}

class WorkspaceRepository implements IWorkspaceRepository {
  async createWorkspace(
    workspaceData: Partial<IWorkspace>,
    session: ClientSession,
  ): Promise<WorkspaceDocument> {
    const workspace = await Workspace.create([workspaceData], { session });
    return workspace[0];
  }

  async findWorkspaceById(
    workspaceId: string,
  ): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findById(workspaceId);
    return workspace;
  }

  async updateWorkspaceById(
    workspaceId: string,
    workspaceData: Partial<WorkspaceType>,
  ): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      workspaceData,
      { new: true },
    );
    return workspace;
  }

  // find workspace by name with same user id
  async findWorkspaceOfUserByName(
    name: string,
    userId: string,
  ): Promise<WorkspaceDocument | null> {
    return await Workspace.findOne({
      name,
      owner: new Types.ObjectId(userId),
    });
  }

  // find workspace by workspaceId and userId
  async findWorkspaceByWorkspaceAndOwnerId(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceDocument | null> {
    return await Workspace.findOne({
      _id: new Types.ObjectId(workspaceId),
      owner: new Types.ObjectId(userId),
    });
  }

  async deleteWorkspaceById(
    workspaceId: string,
    session: ClientSession,
  ): Promise<void> {
    await Workspace.deleteOne({ _id: workspaceId }, { session });
    return;
  }

  async addMemberToWorkspace(
    workspaceId: string,
    membershipId: string,
    session: ClientSession,
  ): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $addToSet: { members: new Types.ObjectId(membershipId) } },
      { new: true, session },
    );
    return workspace;
  }

  async findAllMembersOfWorkspace(workspaceId: string) {
    const workspaceMembers = await Workspace.aggregate([
      { $match: { _id: new Types.ObjectId(workspaceId) } },
      {
        $lookup: {
          from: "memberships",
          localField: "members",
          foreignField: "_id",
          as: "memberDetails",
        },
      },
      { $unwind: "$memberDetails" },
      {
        $lookup: {
          from: "users",
          localField: "memberDetails.userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          members: {
            $push: {
              role: "$memberDetails.role",
              membershipId: "$memberDetails._id",
              joinedAt: "$memberDetails.createdAt",
              workspaceId: "$memberDetails.workspaceId",
              user: {
                id: "$userData._id",
                name: "$userData.name",
                email: "$userData.email",
                profilePicture: "$userData.profilePicture",
              },
            },
          },
        },
      },
    ]);
    return workspaceMembers;
  }

  async removeMemberFromWorkspace(
    workspaceId: string,
    membershipId: string,
    session: ClientSession,
  ) {
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      // pulling out the occurance of the membership id from the members field of workspace doc
      { $pull: { members: new Types.ObjectId(membershipId) } },
      { new: true, session },
    );
    if (!workspace) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Workspace ${workspaceId} not found`);
    }
    return workspace;
  }
}

export default WorkspaceRepository;
