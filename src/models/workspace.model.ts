import mongoose, { HydratedDocument, Types } from "mongoose";

import { WorkspaceType } from "../types/workspace.types";

export interface IWorkspace extends Omit<
  WorkspaceType,
  "members" | "businessType" | "teamSize" | "profilePicture"
> {
  _id: Types.ObjectId;
  name: string;
  businessType?: string | null;
  slug: string;
  profilePicture?: string | null;
  owner: Types.ObjectId;
  teamSize?: number | null;
  members: Types.ObjectId[];
}

const WorkspaceSchema = new mongoose.Schema(
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
    profilePicture: {
      type: String,
      required: false,
      default: null,
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
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

WorkspaceSchema.index({ slug: 1 }, { unique: true });
WorkspaceSchema.index({ name: "text", businessType: "text" });
WorkspaceSchema.index(
  { owner: 1, name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

export type WorkspaceDocument = HydratedDocument<IWorkspace>;
export const Workspace = mongoose.model<WorkspaceDocument>(
  "Workspace",
  WorkspaceSchema,
);
