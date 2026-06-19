import { StatusCodes } from "http-status-codes";

import { bcryptUtil } from "../utils/bcrypt";
import { logger } from "../infra/logger/pino";
import ApiError from "../exceptions/apiError";
import { TokenType } from "../types/token.types";
import { tokenService } from "./token.service";
import { System_Roles } from "../constants/roles";
import GenerateTokens from "../utils/generateToken";
import errorMessages from "../constants/errorMessages";
import { EmailService } from "../infra/email/service";
import { CreateUserDTO, loginUserDTO } from "../dtos/auth.dto";
import { UserRepository } from "../repositories/user.repository";

const emailService = new EmailService();
const userRepository = new UserRepository();

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

    emailService
      .sendWelcome({
        to: data.email,
        userName: name,
        userEmail: data.email,
      })
      .catch((err) => {
        console.error(
          `[email] failed to send welcome email to ${data.email}`,
          err,
        );
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
      tokenVersion: existingUser.tokenVersion ?? 0,
    };

    let userForResponse = existingUser;

    try {
      const updated = await userRepository.updateUserLastLoginAt(
        existingUser._id,
      );
      if (updated) {
        userForResponse = updated;
      }
    } catch (err) {
      logger.warn(
        { userId: existingUser.name, err },
        errorMessages.USER.LOGIN_TIME_UPDATE_FAILED,
      );
    }

    const { password, ...user } = userForResponse.toJSON();
    const { accessToken, refreshToken } = GenerateTokens(payload);

    return { accessToken, refreshToken, user };
  }

  async refresh(id: string, tokenVersion?: number) {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.NOT_FOUND,
      );
    }

    // Reject refresh tokens that were revoked (logout / password reset bumps
    // the user's tokenVersion). Default to 0 so tokens minted before this
    // field existed still validate.
    if ((tokenVersion ?? 0) !== (existingUser.tokenVersion ?? 0)) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.TOKEN.INVALID_REFRESH_TOKEN,
      );
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
      tokenVersion: existingUser.tokenVersion ?? 0,
    };

    const { accessToken, refreshToken } = GenerateTokens(payload);
    return { accessToken, refreshToken };
  }

  async getCurrentUser(id: string) {
    const currentUser = await userRepository.getUserById(id);
    return currentUser?.toJSON();
  }

  async verifyEmail(code: string, email: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.VERIFY_TOKEN.INVALID,
      );

    const isValid = await tokenService.verify(
      user._id.toString(),
      code,
      TokenType.EMAIL_VERIFICATION,
    );
    if (!isValid)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.VERIFY_TOKEN.INVALID,
      );

    await userRepository.verifyUserEmail(user._id.toString());
  }

  async sendVerification(email: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return;
    }
    if (user.isEmailVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email already verified");
    }

    const code = await tokenService.generate(
      user._id.toString(),
      TokenType.EMAIL_VERIFICATION,
    );

    emailService
      .sendVerificationCode({
        to: email,
        userName: user.name,
        code,
      })
      .catch((err: any) =>
        console.error("[email] verification send failed:", err),
      );
  }

  async forgotPassword(email: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return;
    }
    const code = await tokenService.generate(
      user._id.toString(),
      TokenType.PASSWORD_RESET,
    );
    emailService
      .sendPasswordResetCode({
        to: email,
        userName: user.name,
        code,
      })
      .catch((err: any) =>
        console.error("[email] password reset send failed:", err),
      );
  }

  async resetPassword(code: string, email: string, newPassword: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired code");

    const isValid = await tokenService.verify(
      user._id.toString(),
      code,
      TokenType.PASSWORD_RESET,
    );
    if (!isValid)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired code");

    const hashedPassword = await bcryptUtil.generate(newPassword, 12);
    await userRepository.updateUserPassword(
      user._id.toString(),
      hashedPassword,
    );

    // Invalidate all existing sessions after a password reset.
    await userRepository.incrementTokenVersion(user._id.toString());

    emailService
      .sendPasswordChangedEmail({
        to: email,
        userName: user.name,
      })
      .catch((err: any) =>
        console.error("[email] password changed send failed:", err),
      );
  }

  async verifyResetCode(code: string, email: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired code");
    const isValid = await tokenService.peekVerify(
      user._id.toString(),
      code,
      TokenType.PASSWORD_RESET,
    );
    if (!isValid)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired code");
  }

  // Revokes every token currently held by the user by bumping tokenVersion.
  async logout(userId: string) {
    await userRepository.incrementTokenVersion(userId);
  }
}
