import { ClientSession } from "mongoose";
import { Membership } from "../models/membership.model";
import { MembershipType } from "../types/membership.types";

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
  async createRelation({ userId, workspaceId, role }: MembershipType, session: ClientSession) {
    const [membership] = await Membership.create(
      [
        {
          userId: userId,
          workspaceId: workspaceId,
          role,
        },
      ],
      { session }
    );
    return membership;
  }
}
