import { Types } from 'mongoose';
import { Token, TokenDocument } from '../models/token.model';

interface TokenData {
  user_id: string;
  token: string;
  type: string;
  expires_at: Date;
}

export class TokenRepository {

  async create(data: TokenData): Promise<TokenDocument> {
    const token = new Token(data);
    return await token.save();
  }

  async findByUserAndType(userId: string, type: string): Promise<TokenDocument | null> {
    return await Token.findOne({
      user_id: userId,
      type,
      used_at: null,
    })
      .sort({ created_at: -1 })
      .exec();
  }

  async deleteByUserAndType(userId: string, type: string): Promise<void> {
    await Token.deleteMany({
      user_id: userId,
      type,
      used_at: null,
    });
  }

  async deleteAllByUser(userId: string): Promise<void> {
    await Token.deleteMany({ user_id: userId });
  }

  async markUsed(tokenId: Types.ObjectId): Promise<void> {
    await Token.findByIdAndUpdate(tokenId, {
      used_at: new Date(),
    });
  }

  async delete(tokenId: Types.ObjectId): Promise<void> {
    await Token.findByIdAndDelete(tokenId);
  }

  async cleanupExpired(): Promise<void> {
    // MongoDB TTL index handles this automatically
    // Manually clean if needed:
    await Token.deleteMany({
      expires_at: { $lt: new Date() },
    });
  }
}

export const tokenRepository = new TokenRepository();
