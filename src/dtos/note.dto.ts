import z from "zod";
import { NoteSchema } from "../types/note.types";

export const CreateNoteDto = NoteSchema.pick({
  content: true,
  entityType: true,
  entityId: true,
  isPinned: true,
});

export type CreateNoteDto = z.infer<typeof CreateNoteDto>;

export const UpdateNoteDto = NoteSchema.partial().pick({
  content: true,
  isPinned: true,
});

export type UpdateNoteDto = z.infer<typeof UpdateNoteDto>;
