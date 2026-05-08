import slugify from "slugify";
import mongoose, { HydratedDocument, Types } from "mongoose";

import { WorkspaceType } from "../types/workspace.types";

interface IWorkspace extends Omit<WorkspaceType, "members" | "businessType" | "teamSize"> {
  name: string;
  businessType?: string | null;
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
      unique: true,
      index: true,
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
      required: false,
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

// create slug from name before validation
WorkspaceModel.pre("validate", function() {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

WorkspaceModel.index({ name: "text", businessType: "text" });

export type WorkspaceDocument = HydratedDocument<IWorkspace>;
export const Workspace = mongoose.model<WorkspaceDocument>("Workspace", WorkspaceModel);
