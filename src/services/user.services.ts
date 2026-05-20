import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import { UpdateUserDTO } from "../dtos/user.dto";
import errorMessages from "../constants/errorMessages";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

class UserServices {
  async UpdateUser(id: string, data: UpdateUserDTO) {
    const updatedUser = await userRepository.findByIdAndUpdateUser(id, data);
    if (!updatedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER.NOT_FOUND);
    }
    return updatedUser.toJSON();
  }

  async getAllUsers({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      userRepository.getAllUsers({ skip, limit }),
      userRepository.countUsers(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    return user;
  }

  async softDeleteUserById(userId: string) {
    const user = await userRepository.softDeleteUserById(userId);
    return user;
  }

  async deleteUserById(userId: string) {
    const user = await userRepository.deleteUserById(userId);
    return user;
  }
}

export default UserServices;
