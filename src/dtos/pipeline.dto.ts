import z from "zod";
import { PipelineSchema } from "../types/pipeline.types";


export const CreatePipelineSchema = PipelineSchema.pick({
  name: true,
  description: true,
  color: true,
  icon: true,
  vertical: true,
  currency: true,
  visibility: true,
  templateId: true,
  memberIds: true,
})

export type CreatePipelineDto = z.infer<typeof CreatePipelineSchema>

export const UpdatePipelineSchema = PipelineSchema.partial().pick({
  name: true,
  description: true,
  color: true,
  icon: true,
  vertical: true,
  currency: true,
  visibility: true,
  templateId: true,
  memberIds: true,
})

export type UpdatePipelineDto = z.infer<typeof UpdatePipelineSchema>
