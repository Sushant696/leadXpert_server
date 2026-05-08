import mongoose from "mongoose";
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

    // starting transaction for atomicity
    const session = await mongoose.startSession();
    try {

      session.startTransaction();
      // create workspace
      const workspace = await workspaceRepository.createWorkspace({
        name: data.name,
        businessType: data.businessType,
        teamSize: data.teamSize,
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

  async updateWorkspace(workspaceId: string, data: UpdateUserDTO) {
    // Logic to update a workspace
    return {};
  }
}

export default WorkspaceServices;
