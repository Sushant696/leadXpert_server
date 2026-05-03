import { Membership } from "../models/membership.model";

export class MembershipRepository {
  async findByUserAndWorkspace(userId: string, workspaceId: string) {
    return Membership.findOne({
      userId: userId,
      workspaceId: workspaceId,
    });
  }

  async createRelation(userId: string, workspaceId: string, role: string) {
    return Membership.create({
      userId: userId,
      workspaceId: workspaceId,
      role,
    });
  }
}
