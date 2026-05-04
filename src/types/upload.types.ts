import z from "zod";

export const UploadImageSchema = z.object({
  folder: z.string().optional().default('leadxpert/uploads'),
  allowedTypes: z.array(z.string()).optional().default(['image/jpeg', 'image/png', 'image/webp'])
});

export const UploadPdfSchema = z.object({
  folder: z.string().optional().default('leadxpert/uploads'),
  allowedTypes: z.array(z.string()).optional().default(['image/jpeg', 'image/png', 'image/webp'])
});

export const DeleteImageSchema = z.object({
  publicId: z.string().min(1, "Public ID is required")
});

export type UploadPdfType = z.infer<typeof UploadPdfSchema>;
export type UploadImageType = z.infer<typeof UploadImageSchema>;
export type DeleteImageType = z.infer<typeof DeleteImageSchema>;

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}
