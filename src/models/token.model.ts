import mongoose, { HydratedDocument, Schema } from "mongoose";

import { CreateTokenType, TokenType } from "../types/token.types";

interface IToken extends Omit<CreateTokenType, "user_id"> {
  user_id: mongoose.Types.ObjectId;
  token: string;
  type: "email_verification" | "password_reset" | "otp";
  expires_at: Date;
  used_at?: Date | null;
}

const tokenSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: TokenType,
      index: true,
    },

    expires_at: {
      type: Date,
      required: true,
    },

    used_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

tokenSchema.index({ user_id: 1, type: 1 });
tokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export type TokenDocument = HydratedDocument<IToken>;
export const Token = mongoose.model("Token", tokenSchema);
