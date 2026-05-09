import mongoose, { HydratedDocument, Types } from "mongoose";

import { WorkspaceType } from "../types/workspace.types";

export interface IWorkspace extends Omit<WorkspaceType, "members" | "businessType" | "teamSize"> {
  name: string;
  businessType?: string | null;
  owner: Types.ObjectId;
  slug: string;
  teamSize?: number | null;
  inviteCode?: string;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessType: {
      type: String,
      required: false,
      default: null,
    },
    teamSize: {
      type: Number,
      default: null,
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
      },
    ],
  }, {
  timestamps: true,
  versionKey: false,
}
)

WorkspaceModel.index({ slug: 1 }, { unique: true });
WorkspaceModel.index({ name: "text", businessType: "text" });
WorkspaceModel.index({ owner: 1, name: 1 }, { unique: true });

export type WorkspaceDocument = HydratedDocument<IWorkspace>;
export const Workspace = mongoose.model<WorkspaceDocument>("Workspace", WorkspaceModel);
