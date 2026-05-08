import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import { StatusCodes } from "http-status-codes";
import { CreateWorkspaceDto } from "../dtos/workspace.dto";
import ApiError from "../exceptions/apiError";
import WorkspaceServices from "../services/workspace.services";
import { UpdateUserDTO } from "../dtos/user.dto";
import errorMessages from "../constants/errorMessages";

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
    return res.json(new ApiResponse(StatusCodes.OK, "Workspace created successfully", { workspace }))
  })

  updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const parsedData = UpdateUserDTO.safeParse(req.body)
    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, parsedData.error.message)
    }

    const updatedWorkspace = await workspaceServices.updateWorkspace(workspaceId, parsedData.data);
    return res.json(new ApiResponse(StatusCodes.OK, "Workspace updated successfully", { updatedWorkspace }))
  })

}


export default WorkspaceController;
