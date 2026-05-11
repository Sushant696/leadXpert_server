import z from 'zod';
import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { UpdateUserDTO } from '../dtos/user.dto';
import UserServices from '../services/user.services';
import errorMessages from '../constants/errorMessages';
import responseMessages from "../constants/responseMessages";

const userServices = new UserServices();

class UserController {

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = UpdateUserDTO.safeParse(req.body);
    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const updatedUser = await userServices.UpdateUser(
      req.user?.id,
      parsedData.data,
    );
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.USER.UPDATED,
        updatedUser,
      ),
    );
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1)
    const limit = Math.min(
      parseInt(req.query.limit as string) || 10,
      100
    );

    const result = await userServices.getAllUsers({ page, limit });
    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.USER.RETRIEVED, result))
  })

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await userServices.getUserById(userId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER.NOT_FOUND);
    }

    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.USER.RETRIEVED, { user }))
  })

  deleteUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await userServices.deleteUserById(userId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER.NOT_FOUND);
    }

    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.USER.DELETED, {}))
  })

  softDeleteUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await userServices.softDeleteUserById(userId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER.NOT_FOUND);
    }

    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.USER.DELETED, {}))
  })

}

export default UserController
