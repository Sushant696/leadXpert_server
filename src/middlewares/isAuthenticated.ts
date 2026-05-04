import jwt from "jsonwebtoken"
import { StatusCodes } from "http-status-codes";
import { Response, Request, NextFunction } from "express";

import { env } from "../config/env";
import ApiError from "../exceptions/apiError";
import asyncHandler from "../utils/asyncHandler";
import errorMessages from "../constants/errorMessages";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository()

const isAuthenticated = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.USER.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.NOT_FOUND);
  }

  let decoded: Record<string, any>;

  try {
    decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as Record<string, any>;
  } catch (jwtError: any) {

    // Converting JWT error to ApiError with proper status
    if (jwtError.name === 'TokenExpiredError') {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.TOKEN.EXPIRED
      );
    }

    if (jwtError.name === 'JsonWebTokenError') {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.TOKEN.INVALID_TOKEN
      );
    }

    // Any other JWT error
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      errorMessages.TOKEN.INVALID_TOKEN
    );
  }

  if (!decoded || !decoded.id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.INVALID_TOKEN);
  }

  const user = await userRepository.getUserById(decoded.id);

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.TOKEN_USER_NOT_FOUND);
  }

  req.user = user;
  return next();
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.USER.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.NOT_FOUND);
  }

  let decoded: Record<string, any>;

  try {
    decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as Record<string, any>;
  } catch (jwtError: any) {

    if (jwtError.name === 'TokenExpiredError') {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.TOKEN.REFRESH_TOKEN_EXPIRED
      );
    }

    if (jwtError.name === 'JsonWebTokenError') {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.TOKEN.INVALID_REFRESH_TOKEN
      );
    }

    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      errorMessages.TOKEN.REFRESH_FAILED
    );
  }

  if (!decoded || !decoded.id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.INVALID_TOKEN);
  }

  req.user = { id: decoded.id };
  next();
});


export const middlewares = { isAuthenticated, refreshAccessToken }
