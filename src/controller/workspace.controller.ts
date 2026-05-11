import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import { StatusCodes } from "http-status-codes";
import {
  CreateWorkspaceDto,
  InvigationByEmailDto,
  updateWorkspaceDto,
} from "../dtos/workspace.dto";
import ApiError from "../exceptions/apiError";
import WorkspaceServices from "../services/workspace.services";
import errorMessages from "../constants/errorMessages";
import z from "zod";
import responseMessages from "../constants/responseMessages";

const workspaceServices = new WorkspaceServices();

class WorkspaceController {
  createWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED,
      );
    }
    const parsedData = CreateWorkspaceDto.safeParse(req.body);

    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, z.prettifyError(parsedData.error));
    }
    const workspace = await workspaceServices.createWorkspace(
      user.id,
      parsedData.data,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.WORKSPACE.CREATED, {
        workspace
      }),
    );
  });

  getAllWorkspaces = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED,
      );
    }
    const workspaces = await workspaceServices.getAllWorkspacesOfUser(user.id);
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.WORKSPACE.ALLRETRIEVED, {
        workspaces,
      }),
    );
  });

  updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    const user = req.user!;
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED,
      );
    }

    const parsedData = updateWorkspaceDto.safeParse(req.body);

    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, z.prettifyError(parsedData.error));
    }

    const updatedWorkspace = await workspaceServices.updateWorkspaceById(
      workspaceId,
      user.id,
      parsedData.data,
    );

    const responseData = {
      role: req.membership?.role,
      ...updatedWorkspace,
    }

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.WORKSPACE.UPDATED, {
        workspace: responseData
      }),
    );
  });

  deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    const result = await workspaceServices.deleteWorkspace(workspaceId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.WORKSPACE.DELETED, {
        result,
      }),
    );
  });

  // ------------------------ Invite to workspace -------------------

  joinWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const { token } = req.params;
    const joinedWorkspace = await workspaceServices.joinWorkspaceByInviteToken(token, user.id);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.WORKSPACE.JOINED, {
        workspace: joinedWorkspace,
      }),
    );
  });

  getInvitationLink = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const { workspaceId } = req.params;
    const inviteLink = await workspaceServices.getInvitationLink(
      workspaceId,
      user.id,
    );
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.WORKSPACE.INVITATION_LINK_GENERATED,
        inviteLink,
      ),
    );
  });

  getInvitationByEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const data = InvigationByEmailDto.safeParse(req.body);
    if (!data.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, z.prettifyError(data.error));
    }
    const { workspaceId } = req.params;
    const results = await workspaceServices.sendInvitationByEmail(
      workspaceId,
      user.id,
      data.data.email,
    );
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.WORKSPACE.EMAIL_INVITATION_SENT,
        { results },
      ),
    );
  });

  getActiveInvites = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const invities = await workspaceServices.getActiveInvites(workspaceId);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.WORKSPACE.INVITATION_LINKS_RETRIEVED,
        { invities },
      ),
    );
  });

  revokeInvite = asyncHandler(async (req: Request, res: Response) => {
    const { inviteId } = req.params;
    await workspaceServices.revokeInvitation(inviteId);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.WORKSPACE.INVITATION_LINK_REVOKED,
      ),
    );
  });

  getWorkspaceMembers = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const members = await workspaceServices.getWorkspaceMembers(workspaceId);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.WORKSPACE.MEMBERS_RETRIEVED,
        members,
      ),
    )
  });

  updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
    const { role, userId } = req.body;
    const { workspaceId } = req.params;
    const membershipRole = req.membership
    const updatedMember = await workspaceServices.updateMemberRole(workspaceId, userId, role, membershipRole?.role);

    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.MEMBERSHIP.UPDATED,
        updatedMember,
      ),
    );
  });

  removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;
    const { workspaceId } = req.params;
    const removeMember = await workspaceServices.removeMember(workspaceId, userId);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.MEMBERSHIP.DELETED,
        removeMember
      ),
    );
  });

}

export default WorkspaceController;
