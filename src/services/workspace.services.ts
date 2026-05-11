import slugify from "slugify";
import mongoose, { Types } from "mongoose";
import { nanoid } from "nanoid";
import { StatusCodes } from "http-status-codes";

import {
  IPopulatedMembership,
} from "../models/membership.model";
import { env } from "../config/env";
import ApiError from "../exceptions/apiError";
import { Role_Type, Roles } from "../constants/roles";
import errorMessages from "../constants/errorMessages";
import generateRandomCode from "../utils/generatedRandomCode";
import WorkspaceRepository from "../repositories/workspace.repository";
import { MembershipRepository } from "../repositories/membership.repository";
import { CreateWorkspaceDto, UpdateWorkspaceDto } from "../dtos/workspace.dto";
import WorkspaceInviteRepository from "../repositories/workspaceInvite.repository";

const workspaceRepository = new WorkspaceRepository();
const membershipRespository = new MembershipRepository();
const inviteRepository = new WorkspaceInviteRepository();

class WorkspaceServices {
  async createWorkspace(userId: string, data: CreateWorkspaceDto) {
    const memberships = (await membershipRespository.findAllWorkspacesOfUser(
      userId,
    )) as IPopulatedMembership[];

    const doesNameExist = memberships.some((mem) => {
      return mem.workspaceId.name.trim().toLowerCase() === data.name.trim().toLowerCase() &&
        mem.workspaceId.owner.toString() === userId
    });

    if (doesNameExist) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.WORKSPACE.ALREADY_EXISTS,
      );
    }

    const baseSlug = slugify(data.name, { lower: true, strict: true });
    const slug = `${baseSlug}-${nanoid(4)}`;

    // starting transaction for atomicity
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      // create workspace
      const workspace = await workspaceRepository.createWorkspace(
        {
          slug,
          name: data.name,
          businessType: data.businessType,
          teamSize: data.teamSize,
          profilePicture: data.profilePicture,
          owner: new Types.ObjectId(userId),
        },
        session,
      );

      // create membership
      const membership = await membershipRespository.createRelation(
        {
          userId: new Types.ObjectId(userId),
          workspaceId: new Types.ObjectId(workspace._id),
          role: Roles.SUPER_ADMIN,
        },
        session,
      );

      // add membership to workspace
      workspace.members.push(membership._id);
      await workspace.save({ session });

      await session.commitTransaction();
      return {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
        role: membership.role,
        teamSize: workspace.teamSize,
        profilePicture: workspace.profilePicture,
        businessType: workspace.businessType,
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllWorkspacesOfUser(userId: string) {
    const memberships =
      await membershipRespository.findAllWorkspacesOfUser(userId);

    const workspaces = memberships.map((mem) => ({
      workspace: mem.workspaceId,
      role: mem.role,
    }));

    return workspaces ?? [];
  }

  async updateWorkspaceById(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceDto,
  ) {
    if (data.name && data.name !== "") {
      const memberships = (await membershipRespository.findAllWorkspacesOfUser(
        userId,
      )) as IPopulatedMembership[];

      const doesNameExist = memberships.some((mem) => {
        return (
          mem.workspaceId.name.trim().toLowerCase() === data.name!.trim().toLowerCase() &&
          mem.workspaceId._id.toString() !== workspaceId &&
          mem.workspaceId.owner.toString() === userId
        );
      });
      if (doesNameExist) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          errorMessages.WORKSPACE.ALREADY_EXISTS,
        );
      }
    }
    const updatedWorkspace = await workspaceRepository.updateWorkspaceById(
      workspaceId,
      data,
    );

    return {
      id: updatedWorkspace?._id,
      name: updatedWorkspace?.name,
      slug: updatedWorkspace?.slug,
      teamSize: updatedWorkspace?.teamSize,
      profilePicture: updatedWorkspace?.profilePicture,
      businessType: updatedWorkspace?.businessType,
    };
  }

  async deleteWorkspace(workspaceId: string) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      await membershipRespository.deleteMembershipsByWorkspaceId(
        workspaceId,
        session,
      );
      const res = await inviteRepository.deleteInvitesByWorkspaceId(
        workspaceId,
        session,
      );
      await workspaceRepository.deleteWorkspaceById(workspaceId, session);
      await session.commitTransaction();
      return res;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async joinWorkspaceByInviteToken(token: string, userId: string) {
    const invite = await inviteRepository.findInviteByToken(token);
    if (!invite) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.INVITE.INVALID);
    }

    if (invite.status === "REVOKED") {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.INVITE.REVOKED);
    }
    if (invite.expiresAt < new Date()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.INVITE.EXPIRED);
    }

    if (invite.type === "LINK" && invite.maxUses !== null) {
      const maxUses = invite.maxUses ?? 20;
      if (invite.currentUses >= maxUses) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          errorMessages.INVITE.MAX_USES_REACHED,
        );
      }
    }

    const existingMembership =
      await membershipRespository.findByUserAndWorkspace(
        userId,
        invite.workspaceId.toString(),
      );

    if (existingMembership) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.WORKSPACE_MEMBERSHIP.ALREADY_MEMBER,
      );
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const membership = await membershipRespository.createRelation(
        {
          userId: new Types.ObjectId(userId),
          workspaceId: invite.workspaceId,
          // if later the specific role is send from client than can set here directly
          role: Roles.AGENT,
        },
        session,
      );

      const ws = await workspaceRepository.addMemberToWorkspace(
        invite.workspaceId.toString(),
        membership._id.toString(),
        session,
      );
      await inviteRepository.incrementInviteUsage(invite.token, session);
      await session.commitTransaction();
      if (!ws) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          errorMessages.WORKSPACE.NOT_FOUND,
        );
      }

      return {
        id: ws?._id,
        name: ws?.name,
        slug: ws?.slug,
        role: membership.role,
        teamSize: ws?.teamSize,
        profilePicture: ws?.profilePicture,
        businessType: ws?.businessType,
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getInvitationLink(
    workspaceId: string,
    userId: string,
    expiresInDays = 10,
  ) {
    const existingInvite =
      await inviteRepository.findInviteOfTypeLinkByWorkspaceId(workspaceId);

    if (existingInvite) {
      const msRemaining = existingInvite.expiresAt.getTime() - Date.now();
      const hoursRemaining = msRemaining / (1000 * 60 * 60);

      if (hoursRemaining > env.INVITE_HOURS_TO_EXPIRE) {
        const inviteLink = `${process.env.FRONTEND_URL}/invite/${existingInvite.token}`;
        return {
          inviteLink,
          expiresAt: existingInvite.expiresAt,
          reused: !!existingInvite,
        };
      }
      inviteRepository.revokeInvite(existingInvite.token);
    }

    // create new token
    const token = generateRandomCode(12);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.INVITE_DAYS_TO_EXPIRE);

    const newInviteLink = await inviteRepository.createInvite({
      workspaceId: new Types.ObjectId(workspaceId),
      invitedBy: new Types.ObjectId(userId),
      token,
      type: "LINK",
      role: Roles.AGENT,
      expiresAt,
    });

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${newInviteLink.token}`;
    return { inviteLink, expiresInDays, expiresAt: newInviteLink.expiresAt };
  }

  async sendInvitationByEmail(
    workspaceId: string,
    userId: string,
    email: string,
  ) {
    const existingInvite =
      await inviteRepository.findInviteByWorkspaceIdAndEmail(
        workspaceId,
        email,
      );

    if (existingInvite) {
      const msRemaining = existingInvite.expiresAt.getTime() - Date.now();
      const hoursRemaining = msRemaining / (1000 * 60 * 60);

      if (hoursRemaining > env.INVITE_HOURS_TO_EXPIRE) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `An invitation has already been sent. With expiration time of ${Math.ceil(
            hoursRemaining,
          )} hours.`,
        );
      }
      return {
        email,
        expiresAt: existingInvite.expiresAt,
        reused: !!existingInvite,
      };
    }

    // if no valid token exist then create new token and send email
    const token = generateRandomCode(12);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.INVITE_DAYS_TO_EXPIRE);

    const newInviteCode = await inviteRepository.createInvite({
      workspaceId: new Types.ObjectId(workspaceId),
      invitedBy: new Types.ObjectId(userId),
      email,
      token,
      type: "EMAIL",
      role: Roles.AGENT,
      expiresAt,
    });

    // const inviteLink = `${process.env.FRONTEND_URL}/invite/${newInviteLink.token}`;
    // send an email

    return {
      reused: false,
      email,
      expiresAt,
    };
  }

  async revokeInvitation(inviteId: string) {
    const revoked = await inviteRepository.revokeInviteById(inviteId);
    return revoked;
  }

  async getActiveInvites(workspaceId: string) {
    const invites = await inviteRepository.findAllInvites(workspaceId);
    return invites;
  }

  async getWorkspaceMembers(workspaceId: string) {
    const result =
      await workspaceRepository.findAllMembersOfWorkspace(workspaceId);

    if (!result || result.length === 0) {
      return [];
    }
    return result[0].members;
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: Role_Type,
    membershipRole: Role_Type,
  ) {
    if (role === Roles.SUPER_ADMIN) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Only the owner can have super admin role",
      );
    }

    const membership = await membershipRespository.findByUserAndWorkspace(
      userId,
      workspaceId,
    );

    if (!membership) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "User is not a member of workspace",
      );
    }

    if (
      membershipRole === Roles.ADMIN &&
      membership.role === Roles.ADMIN &&
      role === Roles.AGENT
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Admin cannot demote another admin to agent",
      );
    }

    if (membership.role === role) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `User is already a ${role}`);
    }
    const updatedMember = await membershipRespository.updateMembershipRole(
      membership._id,
      role,
    );
    return updatedMember;
  }

  async removeMember(workspaceId: string, userId: string) {
    const membership = await membershipRespository.findByUserAndWorkspace(
      userId,
      workspaceId,
    );
    if (!membership) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "User is not a member of workspace",
      );
    }
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      // removing from both membership and workspace
      await membershipRespository.deleteOneMembershipsByWorkspaceId(
        workspaceId,
        userId,
        session,
      );
      await workspaceRepository.removeMemberFromWorkspace(
        workspaceId,
        membership._id.toString(),
        session,
      );
      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      throw new ApiError(StatusCodes.BAD_GATEWAY, "Failed to remove member from workspace");
    } finally {
      session.endSession();
    }
  }
}

export default WorkspaceServices;
