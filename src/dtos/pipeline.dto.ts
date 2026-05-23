import z from "zod";
import { PipelineSchema } from "../types/pipeline.types";

export const CreatePipelineDto = PipelineSchema.pick({
  name: true,
  description: true,
  color: true,
  icon: true,
  vertical: true,
  currency: true,
  visibility: true,
  memberIds: true,
});

export type CreatePipelineDto = z.infer<typeof CreatePipelineDto>;

export const UpdatePipelineDto = PipelineSchema.partial().pick({
  name: true,
  description: true,
  color: true,
  icon: true,
  vertical: true,
  currency: true,
  visibility: true,
  memberIds: true,
});

export type UpdatePipelineDto = z.infer<typeof UpdatePipelineDto>;
