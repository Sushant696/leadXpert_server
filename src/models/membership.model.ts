import mongoose, { HydratedDocument, Types } from "mongoose";

import { Role_Type, Roles } from "../constants/roles";
import { MembershipType } from "../types/membership.types";
import { IWorkspace } from "./workspace.model";

// omiting the previous fields userId and workspaceId than adding them as types of objectId
export interface IMembership extends Omit<MembershipType, "userId" | "workspaceId"> {
  userId: string | Types.ObjectId;
  workspaceId: string | Types.ObjectId | IWorkspace;
  role: Role_Type
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
      ref: "Workspace",
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

export interface IPopulatedMembership extends Omit<IMembership, 'workspaceId'> {
  workspaceId: IWorkspace;
}
export type MembershipDocument = HydratedDocument<IMembership>
export const Membership = mongoose.model<IMembership>("Membership", membershipSchema)
