import mongoose, { HydratedDocument, Query } from "mongoose";

import { UserType } from "../types/user.types";
import { System_Roles } from "../constants/roles";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    index: true,
  },
  role: {
    type: String,
    enum: System_Roles,
    default: 'user',
  },
  password: {
    type: String,
    select: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
  },
  isActive: {
    type: Boolean, default: true,
  },
  isDeleted: {
    type: Boolean,
    select: false,
    default: false,
  },
  lastLoginAt: Date,
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  // Bumped to invalidate all previously issued access/refresh tokens for this
  // user (logout, password reset). Tokens carry the version they were minted
  // with; a mismatch against this value means the token has been revoked.
  // Not `select: false` so auth middleware can read it on every getUserById;
  // it is stripped from API responses in toJSON below.
  tokenVersion: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

// index for fast lookup of non-deleted users
userSchema.index({ isDeleted: 1 });

// overriding toJSON method to exclude sensitive fields
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  user.id = user._id.toString()
  delete user._id;
  delete user.password;
  delete user.__v;
  delete user.isDeleted;
  delete user.tokenVersion;
  return user;
};

// middleware to exclude soft-deleted users from find queries
userSchema.pre(
  /^(find|findOne|findOneAndUpdate|update|updateOne)/,
  function(this: Query<any, any>) {
    this.where({ isDeleted: false });
  }
);

export type UserDocument = HydratedDocument<UserType>;
export const User = mongoose.model<UserDocument>("User", userSchema)
