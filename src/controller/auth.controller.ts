import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import errorMessages from "../constants/errorMessages";
import { AuthServices } from "../services/auth.service";
import responseMessages from "../constants/responseMessages";
import { CreateUserDTO, LoginUserDTO } from "../dtos/auth.dto";

const authServices = new AuthServices();

export class AuthController {
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreateUserDTO.safeParse(req.body);

    if (!parsedData.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, parsedData.error.message);
    }
    const createdUser = await authServices.createUser(parsedData.data);

    return res.json(
      new ApiResponse(StatusCodes.CREATED, responseMessages.USER.CREATED, {
        ...createdUser,
      }),
    );
  });

  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = LoginUserDTO.safeParse(req.body);

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const { accessToken, refreshToken, user } = await authServices.loginUser(
      parsedData.data,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.USER.LOGGED_IN, {
        user: {
          id: user._id.toString(),
          ...user,
        },
        accessToken,
        refreshToken,
      }),
    );
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED,
      );
    }

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.USER.LOGGED_OUT, {}),
    );
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED,
      );
    }
    const { accessToken, refreshToken } = await authServices.refresh(
      req.user.id,
    );
    res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.USER.REFRESH, {
        accessToken,
        refreshToken,
        user: req.user
      }),
    );
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED,
      );
    }
    const user = await authServices.getCurrentUser(req.user.id);
    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.USER.RETRIEVED, user),
    );
  });
}
