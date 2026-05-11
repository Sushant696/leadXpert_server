import { StatusCodes } from "http-status-codes"
import { NextFunction, Response, Request } from "express"

import ApiError from "../exceptions/apiError"
import errorMessages from "../constants/errorMessages"
import asyncHandler from "../utils/asyncHandler"
import { Role_Type } from "../constants/roles"
import { MembershipRepository } from "../repositories/membership.repository"

const memRepository = new MembershipRepository();

export const systemLevelAccessCheck = (allowedRoles: String[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION)
    }
    next()
  }
}

export const checkWorkspaceMembership = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  const userId = req.user?.id
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.USER.NOT_FOUND)
  }

  const workspaceId = req.params.workspaceId || req.body.workspaceId
  if (!workspaceId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.WORKSPACE.NOT_MEMBER)
  }

  const existingMembership = await memRepository.findByUserAndWorkspace(userId, workspaceId);
  if (!existingMembership) {
    throw new ApiError(StatusCodes.CONFLICT, errorMessages.WORKSPACE.NOT_MEMBER)
  }
  req.membership = existingMembership;
  next();
})

export const requiredCompanyRole = (allowedRoles: readonly Role_Type[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    if (!req.membership) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessages.MEMBERSHIP.NOT_LOADED);
    }

    const userRole = req.membership?.role
    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(StatusCodes.FORBIDDEN, errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION);
    }
    next();
  })
}
