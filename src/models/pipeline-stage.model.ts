import { Schema, Types, model, HydratedDocument } from "mongoose";
import { StageType } from "../types/shared.types";
import { PipelineStageType } from "../types/pipeline-stage.types";

/**
 * A PipelineStage = one Kanban column.
 * Fully user-defined. Users create, rename, reorder, delete stages freely.
 */

export interface IPipelineStage extends Omit<
  PipelineStageType,
  "pipelineId" | "workspaceId" | "description"
> {
  _id: Types.ObjectId;
  pipelineId: Types.ObjectId;
  workspaceId: Types.ObjectId;

  name: string;
  description?: string | null;
  color: string;
  type: StageType;
 
  /**
   * probability: estimated win likelihood at this stage (0–100).
   * Used for forecasting: forecasted_revenue = Σ(lead.value × probability/100)
   * Later fed as a feature into the ML lead scoring model.
   */

  probability: number;

  // Denormalized counters (updated by Lead hooks)
  leadCount: number;
  totalValue: number;
}

const PipelineStageSchema = new Schema<IPipelineStage>(
  {
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: "Pipeline",
      required: true,
      index: true,
    },
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
      maxlength: 80,
    },
    description: {
      type: String,
      default: null,
      maxlength: 300,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    type: {
      type: String,
      enum: Object.values(StageType),
      default: StageType.OPEN,
    },
    probability: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    leadCount: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

PipelineStageSchema.index({ pipelineId: 1, order: 1 });
PipelineStageSchema.index({ pipelineId: 1, type: 1 });
PipelineStageSchema.index(
  { pipelineId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

export type PipelineStageDocument = HydratedDocument<IPipelineStage>;
export const PipelineStage = model<IPipelineStage>(
  "PipelineStage",
  PipelineStageSchema,
);
