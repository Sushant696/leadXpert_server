import { StatusCodes } from "http-status-codes";

import { bcryptUtil } from "../utils/bcrypt";
import ApiError from "../exceptions/apiError";
import GenerateTokens from "../utils/generateToken";
import errorMessages from "../constants/errorMessages";
import { CreateUserDTO, loginUserDTO } from "../dtos/auth.dto";
import { UserRepository } from "../repositories/user.repository";
import { System_Roles } from "../constants/roles";
import { logger } from "../infra/logger/pino";

const userRepository = new UserRepository()

export class AuthServices {

  async createUser(data: CreateUserDTO) {
    const existingUser = await userRepository.getUserByEmail(data.email);

    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.USER.EXIST);
    }

    const hashedPassword = await bcryptUtil.generate(data.password, 12);
    const { firstName, lastName } = data;
    const name = `${firstName} ${lastName}`;

    // hard coded roles as admin will be seeded and not created
    const user = await userRepository.createUser({
      ...data,
      name,
      role: System_Roles.USER,
      password: hashedPassword,
    });

    return user.toJSON();
  }

  async loginUser(data: loginUserDTO) {
    const existingUser = await userRepository.getUserWithPasswordByEmail(
      data.email,
    );
    if (!existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.USER.NOT_FOUND);
    }

    const validatedPassword = await bcryptUtil.compare(
      data.password,
      existingUser.password,
    );
    if (!validatedPassword) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        errorMessages.USER.INVALID_CREDENTIALS,
      );
    }
    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    };

    let userForResponse = existingUser;

    try {
      const updated = await userRepository.updateUserLastLoginAt(existingUser._id);
      if (updated) {
        userForResponse = updated;
      }
    } catch (err) {
      logger.warn(
        { userId: existingUser.name, err },
        'Failed to update lastLoginAt during login'
      );
    }

    const { password, ...user } = userForResponse.toJSON();
    const { accessToken, refreshToken } = GenerateTokens(payload);

    return { accessToken, refreshToken, user };
  }

  async refresh(id: string) {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.USER.NOT_FOUND);
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    };

    const { accessToken, refreshToken } = GenerateTokens(payload);
    return { accessToken, refreshToken };
  }

  async getCurrentUser(id: string) {
    const currentUser = await userRepository.getUserById(id);
    return currentUser;
  }

  async logout() { }
}
