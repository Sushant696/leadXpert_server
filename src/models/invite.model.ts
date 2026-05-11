import { HydratedDocument, Schema, Types, model } from "mongoose";

import { WorkspaceInviteType } from "../types/invite.types";
import { Roles, Role_Type } from "../constants/roles";

export interface IWorkspaceInvite extends Omit<
  WorkspaceInviteType,
  "workspaceId" | "invitedBy"
> {
  workspaceId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  token: string;
  type: "EMAIL" | "LINK";
  role: Role_Type;

  // Email invite specific
  email?: string;

  // Link invite specific
  maxUses?: number | null; // null = unlimited
  currentUses: number;

  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceInviteSchema = new Schema<IWorkspaceInvite>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["EMAIL", "LINK"],
      required: true,
    },
    role: {
      type: String,
      enum: Roles,
      default: Roles.AGENT,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: function(this: IWorkspaceInvite) {
        return this.type === "EMAIL";
      },
    },
    maxUses: {
      type: Number,
      default: 20,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

WorkspaceInviteSchema.index({ workspaceId: 1, email: 1 });
WorkspaceInviteSchema.index({ token: 1, status: 1 });

// TTL index to auto-delete expired invites
WorkspaceInviteSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
  // Delete when expiresAt is reached
);
export type WorkspaceInviteDocument = HydratedDocument<IWorkspaceInvite>;
export const WorkspaceInvite = model<IWorkspaceInvite>(
  "WorkspaceInvite",
  WorkspaceInviteSchema,
);
