import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import { StatusCodes } from "http-status-codes";
import { CreateWorkspaceDto, InvigationByEmailDto, updateWorkspaceDto } from "../dtos/workspace.dto";
import ApiError from "../exceptions/apiError";
import WorkspaceServices from "../services/workspace.services";
import errorMessages from "../constants/errorMessages";
import z from "zod";

const workspaceServices = new WorkspaceServices();

class WorkspaceController {
  createWorkspace = asyncHandler(async (req: Request, res: Response) => {

    const user = req.user!;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.USER.UNAUTHORIZED);
    }

    const parsedData = CreateWorkspaceDto.safeParse(req.body);
    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, parsedData.error.message);
    }

    const workspace = await workspaceServices.createWorkspace(user.id, parsedData.data);

    return res.json(
      new ApiResponse(StatusCodes.OK, "Workspace created successfully", { workspace })
    )
  })

  getAllWorkspaces = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.USER.UNAUTHORIZED);
    }
    const workspaces = await workspaceServices.getAllWorkspacesOfUser(user.id);
    return res.json(
      new ApiResponse(StatusCodes.OK, "Workspaces fetched successfully", { workspaces })
    );
  })

  updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    const user = req.user!;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.USER.UNAUTHORIZED);
    }

    const parsedData = updateWorkspaceDto.safeParse(req.body)
    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, parsedData.error.message)
    }

    const updatedWorkspace = await workspaceServices.updateWorkspaceById(workspaceId, user.id, parsedData.data);

    return res.json(
      new ApiResponse(StatusCodes.OK, "Workspace updated successfully", { updatedWorkspace })
    )
  })

  getInvitationLink = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const { workspaceId } = req.params;
    const inviteLink = await workspaceServices.getInvitationLink(workspaceId, user.id);
    return res.json(new ApiResponse(StatusCodes.OK, "Invitation link generated successfully", inviteLink))
  })

  getInvitationByEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const data = InvigationByEmailDto.safeParse(req.body);
    if (!data.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, z.prettifyError(data.error));
    }
    const { workspaceId } = req.params;
    const results = await workspaceServices.sendInvitationByEmail(workspaceId, user.id, data.data.email);
    return res.json(new ApiResponse(StatusCodes.OK, "Invitation email sent successfully", { results }))
  })
}

export default WorkspaceController;
