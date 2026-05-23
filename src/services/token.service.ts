import crypto from "crypto";
import { TokenType } from "../types/token.types";
import { TokenRepository } from "../repositories/token.repository";

interface TokenConfig {
  expiryMinutes: number;
  length?: number;
}

const TOKEN_CONFIGS: Record<TokenType, TokenConfig> = {
  [TokenType.EMAIL_VERIFICATION]: { expiryMinutes: 24 * 60, length: 6 },
  [TokenType.PASSWORD_RESET]: { expiryMinutes: 60, length: 6 },
  [TokenType.OTP]: { expiryMinutes: 10, length: 6 },
};

const tokenRepository = new TokenRepository();

export class TokenService {
  async generate(userId: string, type: TokenType): Promise<string> {
    const config = TOKEN_CONFIGS[type];
    await tokenRepository.deleteByUserAndType(userId, type);

    const plainToken = this.generateOTP(config.length || 6);

    const hashedToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    await tokenRepository.create({
      user_id: userId,
      token: hashedToken,
      type,
      expires_at: new Date(Date.now() + config.expiryMinutes * 60 * 1000),
    });

    return plainToken;
  }

  async verify(
    userId: string,
    plainToken: string,
    type: TokenType,
  ): Promise<boolean> {
    const tokenRecord = await tokenRepository.findByUserAndType(userId, type);

    if (!tokenRecord) return false;
    if (tokenRecord.used_at) return false;
    if (new Date() > tokenRecord.expires_at) {
      await tokenRepository.delete(tokenRecord._id);
      return false;
    }

    const hashedInput = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");
    const isValid = hashedInput === tokenRecord.token;

    if (!isValid) return false;

    await tokenRepository.markUsed(tokenRecord._id);
    return true;
  }

  async peekVerify(userId: string, code: string, type: TokenType): Promise<boolean> {
    const token = await tokenRepository.findByUserAndType(userId, type);
    if (!token) return false;
    if (token.used_at) return false;
    if (new Date() > token.expires_at) {
      await tokenRepository.delete(token._id);
      return false;
    }
    const hashedInput = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");
    const isValid = hashedInput === token.token;

    if (!isValid) return false;
    return true;
  }

  async checkValid(
    userId: string,
    plainToken: string,
    type: TokenType,
  ): Promise<boolean> {
    const tokenRecord = await tokenRepository.findByUserAndType(userId, type);

    if (!tokenRecord) return false;
    if (tokenRecord.used_at) return false;
    if (new Date() > tokenRecord.expires_at) return false;

    const hashedInput = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");
    return hashedInput === tokenRecord.token;
  }

  async deleteAllForUser(userId: string, type?: TokenType): Promise<void> {
    if (type) {
      await tokenRepository.deleteByUserAndType(userId, type);
    } else {
      await tokenRepository.deleteAllByUser(userId);
    }
  }

  private generateOTP(length: number): string {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    return otp;
  }
}

export const tokenService = new TokenService();
