import { StatusCodes } from "http-status-codes";

import { bcryptUtil } from "../utils/bcrypt";
import ApiError from "../exceptions/apiError";
import GenerateTokens from "../utils/generateToken";
import errorMessages from "../constants/errorMessages";
import { CreateUserDTO, loginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository()

export class UserServices {

  async createUser(data: CreateUserDTO) {
    const existingUser = await userRepository.getUserByEmail(data.email);

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, errorMessages.USER.EXIST)
    }

    const hashedPassword = await bcryptUtil.generate(data.password, 12);
    const { firstName, lastName } = data;
    const name = `${firstName},${lastName}`
    const user = await userRepository.createUser({
      ...data,
      name,
      password: hashedPassword
    })

    return {
      id: user._id,
      email: user.email,
      name: user.name
    }
  }

  async loginUser(data: loginUserDTO) {
    const existingUser = await userRepository.getUserWithPasswordByEmail(data.email)

    if (!existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.USER.NOT_FOUND)
    }
    const validatedPassword = await bcryptUtil.compare(data.password, existingUser.password);

    if (!validatedPassword) {
      throw new ApiError(StatusCodes.CONFLICT, errorMessages.USER.INVALID_CREDENTIALS)
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role
    };

    const userObj = existingUser.toObject();
    const { password, ...safeUser } = userObj;
    const { accessToken, refreshToken } = GenerateTokens(payload);

    return { accessToken, refreshToken, user: safeUser }
  }

  async getCurrentUser(id: string) {
    const currentUser = await userRepository.getUserById(id)
    return currentUser
  }
}
