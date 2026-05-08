import mongoose, { HydratedDocument } from "mongoose";
import { WorkspaceType } from "../types/workspace.types";

const WorkspaceModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      required: true,
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
      },
    ],

    /*
    // to be implemented later 
        pipelines: [
          {
            type: Types.ObjectId,
            ref: "Pipeline",
          },
        ],
        contacts: [
          {
            type: Types.ObjectId,
            ref: "Contact",
          },
        ],
        activities: [
          {
            type: Types.ObjectId,
            ref: "Activity",
          },
        ],
        tasks: [
          {
            type: Types.ObjectId,
            ref: "Task",
          },
        ],
      */
  }, {
  timestamps: true,
  versionKey: false,
}
)

export type WorkspaceDocument = HydratedDocument<WorkspaceType>;
export const Workspace = mongoose.model<WorkspaceDocument>("Workspace", WorkspaceModel);
