import { Schema, Types, model, HydratedDocument } from "mongoose";
import { ActivityTypeSchema } from "../types/activity.types";
import { ActivityType } from "../types/shared.types";

/**
 * Activity = system-generated, immutable, append-only audit log.
 * Never updated or deleted. No updatedAt field.
 */

export interface IActivity extends Omit<ActivityTypeSchema, "entityId"> {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  performedBy: Types.ObjectId;

  entityType: "LEAD" | "DEAL";
  entityId: Types.ObjectId;

  type: ActivityType;
  description?: string | null;
  metadata: Record<string, unknown>;
}

const ActivitySchema = new Schema<IActivity>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    entityType: {
      type: String,
      enum: ["LEAD", "DEAL"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: 500,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    // Only createdAt — immutable, no updatedAt
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

// Indexes
ActivitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
ActivitySchema.index({ workspaceId: 1, type: 1, createdAt: -1 });

export type ActivityDocument = HydratedDocument<IActivity>;
export const Activity = model<IActivity>("Activity", ActivitySchema);
