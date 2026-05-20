import { Schema, Types, model, HydratedDocument } from "mongoose";

import { BusinessVertical, Currency, PipelineVisibility } from "../types/shared.types";
import { PipelineType } from "../types/pipeline.types";

export interface IPipeline extends Omit<
  PipelineType,
  "workspaceId" | "createdBy" | "memberIds" |
  "stageOrder" | "stats" | "description" | "icon"
> {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  currency: Currency;
  vertical: BusinessVertical;
  visibility: PipelineVisibility;
  isArchived: boolean;
  isDefault: boolean;
  createdBy: Types.ObjectId;

  memberIds: Types.ObjectId[];

  /**
   * stageOrder: the ordered array of PipelineStage ObjectIds.
   * This is the column order on the Kanban like board.
   * Drag to reorder → update this array.
   * PipelineStage.order is a denormalized copy for single-doc reads.
   */
  stageOrder: Types.ObjectId[];

  stats: {
    totalLeads: number;
    openLeads: number;
    wonLeads: number;
    lostLeads: number;
    totalValue: number;
    wonValue: number;
  };
}

const PipelineSchema = new Schema<IPipeline>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: null,
      maxlength: 500,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    icon: {
      type: String,
      default: null,
      maxlength: 10,
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.NPR,
      uppercase: true,
    },
    vertical: {
      type: String,
      enum: Object.values(BusinessVertical),
      default: BusinessVertical.GENERAL,
    },
    visibility: {
      type: String,
      enum: Object.values(PipelineVisibility),
      default: PipelineVisibility.WORKSPACE,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    stageOrder: [{ type: Schema.Types.ObjectId, ref: "PipelineStage" }],

    stats: {
      totalLeads: { type: Number, default: 0 },
      openLeads: { type: Number, default: 0 },
      wonLeads: { type: Number, default: 0 },
      lostLeads: { type: Number, default: 0 },
      totalValue: { type: Number, default: 0 },
      wonValue: { type: Number, default: 0 },
    },
  },
  { timestamps: true, versionKey: false }
);

PipelineSchema.index({ workspaceId: 1, isArchived: 1 });
PipelineSchema.index(
  { workspaceId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export type PipelineDocument = HydratedDocument<IPipeline>;
export const Pipeline = model<IPipeline>("Pipeline", PipelineSchema);
