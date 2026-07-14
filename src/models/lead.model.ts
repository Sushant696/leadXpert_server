import { Schema, Types, model, HydratedDocument } from "mongoose";
import { registerLeadScoringHook } from "../hooks/lead.scoring.hook";
import {
  LeadType,
} from "../types/lead.types";
import {
  LeadSource,
  LeadStatus,
  LeadPriority,
  Currency,
  LostReasonTag,
} from "../types/shared.types";

interface StageHistoryEntry {
  stageId: Types.ObjectId
  stageName: string
  enteredAt: Date
  exitedAt?: Date | null
  timeSpentMs: number
  movedBy?: Types.ObjectId | null
}

interface ScoreFeatures {
  timeInCurrentStage?: number
  daysSinceLastContact?: number
  totalInteractions?: number
  stageProbability?: number
  leadValue?: number
  hasUpcomingTask?: boolean
  sourceWeight?: number
  [key: string]: unknown
}

// Append-only record of every score this lead has received. The newest entry
// is mirrored into the flat mlScore/mlPriority/lastScoredAt/scoreFeatures fields
// below (which keep the existing sort/filter indexes working on plain values).
interface ScoreHistoryEntry {
  score: number
  priority?: LeadPriority | null
  scoredAt: Date
  features?: ScoreFeatures | null
}

export interface ILead extends Omit<
  LeadType,
  | "contactId"
  | "pipelineId"
  | "stageId"
  | "assignedTo"
  | "source"
  | "lostReasonTag"
  | "quickNote"
  | "lostReason"
> {
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  contactId?: Types.ObjectId | null;
  pipelineId: Types.ObjectId;
  stageId: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;

  title: string;
  value: number;
  currency: Currency;
  source?: LeadSource | null;
  priority: LeadPriority;
  status: LeadStatus;
  tags: string[];
  quickNote?: string | null;

  nextFollowUpAt?: Date | null;
  lastContactedAt?: Date | null;

  // Rotten lead detection
  isRotten: boolean;
  stageEnteredAt: Date;

  // Stage history (append-only ML feature)
  stageHistory: StageHistoryEntry[];

  // Conversion tracking
  isConverted: boolean;
  convertedAt?: Date | null;
  convertedBy?: Types.ObjectId | null;

  // Denormalized "this lead has a Deal" flag. Set true when a Deal is created
  // for the lead and NEVER reset — even if the lead is later reopened. This is
  // the permanent, read-side marker the frontend uses to block a second
  // conversion; the Deal.leadId unique index is the authoritative backstop.
  hasDeal: boolean;

  // Lost reason
  lostReason?: string | null;
  lostReasonTag?: LostReasonTag | null;

  // Denormalized counters (updated by hooks)
  taskCount: number;
  noteCount: number;
  activityCount: number;

  // ─── ML Fields
  // mlScore/mlPriority/lastScoredAt/scoreFeatures are the denormalized "current
  // value" fields — always the newest score, kept flat so indexed sort/filter
  // queries (e.g. { workspaceId: 1, mlScore: -1 }) run on a plain number.
  mlScore: number;
  mlPriority?: LeadPriority | null;
  lastScoredAt?: Date | null;
  scoreFeatures?: ScoreFeatures | null;

  // Full history of every score, appended on each rescore (see scoring.service).
  scoreHistory: ScoreHistoryEntry[];
}

const StageHistoryEntrySchema = new Schema(
  {
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "PipelineStage",
      required: true,
    },
    stageName: { type: String, required: true },
    enteredAt: { type: Date, required: true },
    exitedAt: { type: Date, default: null },
    timeSpentMs: { type: Number, default: 0 },
    movedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false },
);

const ScoreHistoryEntrySchema = new Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    priority: {
      type: String,
      enum: Object.values(LeadPriority),
      default: null,
    },
    scoredAt: { type: Date, required: true },
    features: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const LeadSchema = new Schema<ILead>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: false,
      default: null,
      index: true,
    },
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: "Pipeline",
      required: true,
      index: true,
    },
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "PipelineStage",
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.NPR,
    },
    source: {
      type: String,
      enum: Object.values(LeadSource),
      default: null,
    },
    priority: {
      type: String,
      enum: Object.values(LeadPriority),
      default: LeadPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.OPEN,
    },
    tags: {
      type: [String],
      default: [],
    },
    quickNote: {
      type: String,
      default: null,
      maxlength: 500,
    },

    nextFollowUpAt: { type: Date, default: null },
    lastContactedAt: { type: Date, default: null },

    isRotten: { type: Boolean, default: false, index: true },
    stageEnteredAt: { type: Date, default: Date.now },

    stageHistory: {
      type: [StageHistoryEntrySchema],
      default: [],
    },

    isConverted: { type: Boolean, default: false, index: true },
    convertedAt: { type: Date, default: null },
    convertedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    hasDeal: { type: Boolean, default: false },

    lostReason: { type: String, default: null, maxlength: 500 },
    lostReasonTag: {
      type: String,
      enum: Object.values(LostReasonTag),
      default: null,
    },

    // Denormalized counters
    taskCount: { type: Number, default: 0 },
    noteCount: { type: Number, default: 0 },
    activityCount: { type: Number, default: 0 },

    // ML fields
    mlScore: { type: Number, default: 0, min: 0, max: 100 },
    mlPriority: {
      type: String,
      enum: Object.values(LeadPriority),
      default: null,
    },
    lastScoredAt: { type: Date, default: null },
    scoreFeatures: {
      type: Schema.Types.Mixed,
      default: null,
    },
    scoreHistory: {
      type: [ScoreHistoryEntrySchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

LeadSchema.index({ pipelineId: 1, stageId: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, assignedTo: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, priority: 1 });
LeadSchema.index({ workspaceId: 1, mlScore: -1 });
LeadSchema.index({ contactId: 1 });

// Auto-score leads on create/save and on scoring-relevant updates.
// Must run before the model is compiled.
registerLeadScoringHook(LeadSchema);

export type LeadDocument = HydratedDocument<ILead>;
export const Lead = model<ILead>("Lead", LeadSchema);
