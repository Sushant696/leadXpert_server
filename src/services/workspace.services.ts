import slugify from "slugify";
import mongoose, { Types } from "mongoose";
import { nanoid } from "nanoid";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import { UpdateUserDTO } from "../dtos/user.dto";
import { CreateWorkspaceDto } from "../dtos/workspace.dto";
import WorkspaceRepository from "../repositories/workspace.repository";
import { MembershipRepository } from "../repositories/membership.repository";
import { Roles } from "../constants/roles";

const workspaceRepository = new WorkspaceRepository();
const membershipRespository = new MembershipRepository();

class WorkspaceServices {
  async createWorkspace(userId: string, data: CreateWorkspaceDto) {

    // checking if workspace already exist
    const existingWorkspace = await workspaceRepository.findWorkspaceOfUserByName(data.name, userId);
    if (existingWorkspace) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Workspace with the same name already exists.');
    }

    const baseSlug = slugify(data.name, { lower: true, strict: true });
    const slug = `${baseSlug}-${nanoid(4)}`;

    // starting transaction for atomicity
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      // create workspace
      const workspace = await workspaceRepository.createWorkspace({
        slug,
        name: data.name,
        businessType: data.businessType,
        teamSize: data.teamSize,
        owner: new Types.ObjectId(userId),
      }, session);

      // create membership
      const membership = await membershipRespository.createRelation({
        userId: userId,
        workspaceId: workspace._id.toString(),
        role: Roles.SUPER_ADMIN,
      }, session)

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
    const memberships = await membershipRespository.findAllWorkspacesOfUser(userId);

    const workspaces = memberships.map((mem) => ({
      workspace: mem.workspaceId,// this will be populated workspace document
      role: mem.role,
    }))

    return workspaces ?? [];
  }

  async updateWorkspace(workspaceId: string, data: UpdateUserDTO) {
    // Logic to update a workspace
    return {};
  }
}

export default WorkspaceServices;
