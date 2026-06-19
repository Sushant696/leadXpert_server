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

    return res.status(StatusCodes.CREATED).json(
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
        user,
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

    // Revoke all tokens for this user server-side (bumps tokenVersion).
    await authServices.logout(req.user.id);

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
      req.user.tokenVersion,
    );
    res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.USER.REFRESH, {
        accessToken,
        refreshToken,
        user: req.user,
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

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const user = req.user;
    await authServices.verifyEmail(code, user?.email);

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, responseMessages.VERIFICATION.EMAIL_VERIFIED, {}),
    );
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authServices.forgotPassword(email);
    res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, responseMessages.USER.FORGOT_PASSWORD, {}));
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { code, email, newPassword } = req.body;

    await authServices.resetPassword(code, email, newPassword);

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, responseMessages.USER.RESET_PASSWORD, {}),
    );
  });

  sendVerification = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    await authServices.sendVerification(user?.email);

    res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, responseMessages.VERIFICATION.VERIFICATION_CODE, {}));
  });

  verifyResetCode = asyncHandler(async (req: Request, res: Response) => {
    const { code, email } = req.body;
    await authServices.verifyResetCode(code, email);
    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Code verified successfully", {})
    );
  });
}
