import { Schema, Types, model, HydratedDocument } from "mongoose";
import { NoteType } from "../types/note.types";

export interface INote extends Omit<NoteType, "entityId"> {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;

  entityType: "LEAD" | "DEAL";
  entityId: Types.ObjectId;

  content: string;
  isPinned: boolean;
  isEdited: boolean;
  editedAt?: Date | null;
}

const NoteSchema = new Schema<INote>(
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

    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

// Indexes
NoteSchema.index({ entityType: 1, entityId: 1 });
NoteSchema.index({ entityType: 1, entityId: 1, isPinned: -1, createdAt: -1 });

export type NoteDocument = HydratedDocument<INote>;
export const Note = model<INote>("Note", NoteSchema);
