import { Schema, Types, model, HydratedDocument } from "mongoose";
import { DealType } from "../types/deal.types";
import { Currency, DealStatus, PaymentType } from "../types/shared.types";

export interface IDeal extends Omit<
  DealType,
  | "leadId" | "contactId" | "pipelineId"
  | "assignedTo" | "startDate" | "expectedEndDate" | "actualEndDate"
  | "serviceDescription" | "value" | "currency" | "status"
  | "paymentType" | "advancePaid" | "amountReceived" | "deliverables"
> {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  leadId: Types.ObjectId;
  contactId?: Types.ObjectId;
  pipelineId: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;

  title: string;
  value: number;
  currency: Currency;
  status: DealStatus;
  paymentType: PaymentType;

  advancePaid: number;
  amountReceived: number;
  amountPending: number;

  serviceDescription?: string | null;
  deliverables: string[];

  startDate?: Date | null;
  expectedEndDate?: Date | null;
  actualEndDate?: Date | null;

  // Denormalized counters
  taskCount: number;
  noteCount: number;
  activityCount: number;
}

const DealSchema = new Schema<IDeal>(
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
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: "Pipeline",
      required: true,
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
    status: {
      type: String,
      enum: Object.values(DealStatus),
      default: DealStatus.ACTIVE,
    },
    paymentType: {
      type: String,
      enum: Object.values(PaymentType),
      default: PaymentType.INSTALLMENT,
    },
    advancePaid: { type: Number, default: 0, min: 0 },
    amountReceived: { type: Number, default: 0, min: 0 },
    amountPending: { type: Number, default: 0, min: 0 },
    serviceDescription: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    deliverables: {
      type: [String],
      default: [],
    },
    startDate: { type: Date, default: null },
    expectedEndDate: { type: Date, default: null },
    actualEndDate: { type: Date, default: null },

    taskCount: { type: Number, default: 0 },
    noteCount: { type: Number, default: 0 },
    activityCount: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

// Auto-compute amountPending before save
DealSchema.pre("save", function() {
  this.amountPending = Math.max(0, this.value - this.amountReceived);
});

// Indexes
DealSchema.index({ workspaceId: 1, status: 1 });
DealSchema.index({ leadId: 1 }, { unique: true });
DealSchema.index({ contactId: 1 });

export type DealDocument = HydratedDocument<IDeal>;
export const Deal = model<IDeal>("Deal", DealSchema);
