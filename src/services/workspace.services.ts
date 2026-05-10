import slugify from "slugify";
import mongoose, { Types } from "mongoose";
import { nanoid } from "nanoid";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import { UpdateUserDTO } from "../dtos/user.dto";
import { CreateWorkspaceDto, UpdateWorkspaceDto } from "../dtos/workspace.dto";
import WorkspaceRepository from "../repositories/workspace.repository";
import { MembershipRepository } from "../repositories/membership.repository";
import { Roles } from "../constants/roles";
import { IPopulatedMembership } from "../models/membership.model";
import WorkspaceInviteRepository from "../repositories/workspaceInvite.repository";
import generateRandomCode from "../utils/generatedRandomCode";
import { env } from "../config/env";

const workspaceRepository = new WorkspaceRepository();
const membershipRespository = new MembershipRepository();
const inviteRepository = new WorkspaceInviteRepository();

class WorkspaceServices {
  async createWorkspace(userId: string, data: CreateWorkspaceDto) {
    // checking if workspace already exist
    const existingWorkspace =
      await workspaceRepository.findWorkspaceOfUserByName(data.name, userId);
    if (existingWorkspace) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Workspace with the same name already exists.",
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
      return workspace;
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
      workspace: mem.workspaceId, // this will be populated workspace document
      role: mem.role,
    }));

    return workspaces ?? [];
  }

  async updateWorkspace(workspaceId: string, data: UpdateUserDTO) {
    const updatedWorkspace = await workspaceRepository.updateWorkspaceById(
      workspaceId,
      data,
    );
    return updatedWorkspace ?? null;
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
          mem.workspaceId.name === data.name &&
          mem.workspaceId._id.toString() !== workspaceId
        );
      });

      if (doesNameExist) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Workspace with the same name already exists.",
        );
      }
    }
    const updatedWorkspace = await workspaceRepository.updateWorkspaceById(
      workspaceId,
      data,
    );
    return updatedWorkspace ?? null;
  }

  async getInvitationLink(
    workspaceId: string,
    userId: string,
    expiresInDays = 10,
  ) {
    const existingInvite =
      await inviteRepository.findInviteByWorkspaceId(workspaceId);

    if (existingInvite) {
      const msRemaining = existingInvite.expiresAt.getTime() - Date.now()
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
      role: "MEMBER",
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
      role: "MEMBER",
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
}

export default WorkspaceServices;
