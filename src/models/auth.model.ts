import mongoose, { HydratedDocument } from "mongoose";
import { UserType } from "../types/user.types";
import { System_Roles } from "../constants/roles";

const userSchema = new mongoose.Schema<UserType>({
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
    default: System_Roles.USER,
  },
  password: {
    type: String,
    select: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean, default: true,
  },

  lastLoginAt: Date,

  deletedAt: Date,

  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true })

export type UserDocument = HydratedDocument<UserType>;

export const User = mongoose.model<UserType>("User", userSchema)
