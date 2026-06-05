import { Schema, Types, model, HydratedDocument } from "mongoose";
import { ContactType } from "../types/contact.types";
import { LeadSource } from "../types/shared.types";

export interface IContact extends Omit<
  ContactType,
  | "source"
  | "address"
  | "email"
  | "phone"
  | "whatsappNumber"
  | "companyName"
  | "designation"
> {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;

  name: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  designation?: string | null;

  address?: {
    district?: string | null;
    city?: string | null;
  } | null;

  source?: LeadSource | null;
  tags: string[];
}

const ContactSchema = new Schema<IContact>(
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

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      maxlength: 20,
    },
    companyName: {
      type: String,
      default: null,
      trim: true,
      maxlength: 150,
    },
    designation: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },

    address: {
      district: { type: String, default: null, maxlength: 60 },
      city: { type: String, default: null, maxlength: 60 },
    },

    source: {
      type: String,
      enum: Object.values(LeadSource),
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

// Indexes
ContactSchema.index({ workspaceId: 1, email: 1 });
ContactSchema.index({ workspaceId: 1, phone: 1 });
ContactSchema.index({ workspaceId: 1, name: "text", companyName: "text" });

export type ContactDocument = HydratedDocument<IContact>;
export const Contact = model<IContact>("Contact", ContactSchema);
