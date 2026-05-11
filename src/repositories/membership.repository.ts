import { ClientSession, Types } from "mongoose";
import { IMembership, Membership } from "../models/membership.model";
import { Role_Type } from "../constants/roles";
export class MembershipRepository {
  // check if user is member of workspace
  async findByUserAndWorkspace(userId: string, workspaceId: string) {
    return Membership.findOne({
      userId: userId,
      workspaceId: workspaceId,
    });
  }

  // find all workspaces of user
  async findAllWorkspacesOfUser(userId: string) {
    return Membership.find({
      userId: userId,
    }).populate("workspaceId");
  }

  // create membership relation between user and workspace
  async createRelation(
    { userId, workspaceId, role }: IMembership,
    session: ClientSession,
  ) {
    const [membership] = await Membership.create(
      [
        {
          userId: userId,
          workspaceId: workspaceId,
          role,
        },
      ],
      { session },
    );
    return membership;
  }

  async deleteOneMembershipsByWorkspaceId(
    workspaceId: string,
    userId: string,
    session: ClientSession,
  ) {
    return await Membership.deleteOne({ workspaceId, userId }, { session });
  }

  async deleteMembershipsByWorkspaceId(
    workspaceId: string,
    session: ClientSession,
  ) {
    return await Membership.deleteMany({ workspaceId }, { session });
  }

  async updateMembershipRole(memberShipId: Types.ObjectId, role: Role_Type) {
    const updatedMembership = await Membership.findByIdAndUpdate(
      { _id: memberShipId },
      { role },
      { new: true },
    );
    return updatedMembership;
  }
}
