import { z } from "zod";

export const NoteSchema = z.object({
  content: z.string().min(1).max(10000).trim(),

  entityType: z.enum(["LEAD", "DEAL"]),
  entityId: z.string(),

  isPinned: z.boolean().default(false),
});

export type NoteType = z.infer<typeof NoteSchema>;
