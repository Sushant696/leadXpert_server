import { ClientSession } from "mongoose";
import { Membership } from "../models/membership.model";
import { MembershipType } from "../types/membership.types";

export class MembershipRepository {
  async findByUserAndWorkspace(userId: string, workspaceId: string) {
    return Membership.findOne({
      userId: userId,
      workspaceId: workspaceId,
    });
  }

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
