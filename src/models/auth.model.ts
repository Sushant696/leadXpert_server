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
}, { timestamps: true })

// index for fast lookup of non-deleted users
userSchema.index({ isDeleted: 1 });

// overriding toJSON method to exclude sensitive fields
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.isDeleted;
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
