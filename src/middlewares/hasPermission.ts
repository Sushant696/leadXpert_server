import { StatusCodes } from "http-status-codes"
import { NextFunction, Response, Request } from "express"

import ApiError from "../exceptions/apiError"
import errorMessages from "../constants/errorMessages"

export const systemLevelAccessCheck = (allowedRoles: String[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION)
    }
    next()
  }
}
