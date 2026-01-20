import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import errorMessages from "../constants/errorMessages";
import { UserServices } from "../services/auth.service";
import responseMessages from "../constants/responseMessages";
import { CreateUserDTO, loginUserDTO } from "../dtos/user.dto";

const userServices = new UserServices();

export class AuthController {

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreateUserDTO.safeParse(req.body);

    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, parsedData.error.message)
    }
    const createdUser = await userServices.createUser(parsedData.data)

    return res.json(new ApiResponse(StatusCodes.CREATED, responseMessages.USER.CREATED, { ...createdUser }));
  })

  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = loginUserDTO.safeParse(req.body);

    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, z.prettifyError(parsedData.error))
    }

    const { accessToken, refreshToken, user } = await userServices.loginUser(parsedData.data);

    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.USER.LOGGED_IN, { user, accessToken, refreshToken }));
  })

  logout = asyncHandler(async (req: Request, res: Response) => {

    if (!req.user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED
      );
    }

    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.USER.LOGGED_OUT, {}));
  })

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    console.log("failed to get user")
    if (!req.user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED
      );
    }
    const currentUser = await userServices.getCurrentUser(req.user.id);
    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.USER.RETRIEVED, currentUser));
  })
}
