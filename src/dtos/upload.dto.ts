import z from "zod";

export const UploadImageDTO = z.object({
  folder: z.string().optional(),
  allowedTypes: z.array(z.string()).optional()
});

export const DeleteImageDTO = z.object({
  publicId: z.string().min(1, "Public ID is required")
});

export type UploadImageDTO = z.infer<typeof UploadImageDTO>;
export type DeleteImageDTO = z.infer<typeof DeleteImageDTO>;
