import mongoose, { HydratedDocument, Types } from "mongoose";

import { Role_Type, Roles } from "../constants/roles";
import { MembershipType } from "../types/membership.types";

// omiting the previous fields userId and workspaceId than adding them as types of objectId
export interface IMembership extends Omit<MembershipType, "userId" | "workspaceId"> {
  userId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  role: Role_Type
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    role: {
      type: String,
      enum: Roles,
      required: true,
    },
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export type MembershipDocument = HydratedDocument<IMembership>
export const Membership = mongoose.model<IMembership>("Membership", membershipSchema)
