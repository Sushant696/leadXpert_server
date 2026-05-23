import z from "zod";
import { PipelineStageSchema } from "../types/pipeline-stage.types";

export const CreatePipelineStageDto = PipelineStageSchema.pick({
  name: true,
  description: true,
  color: true,
  type: true,
  probability: true,
});

export type CreatePipelineStageDto = z.infer<typeof CreatePipelineStageDto>;

export const UpdatePipelineStageDto = PipelineStageSchema.partial().pick({
  name: true,
  description: true,
  color: true,
  type: true,
  probability: true,
});

export type UpdatePipelineStageDto = z.infer<typeof UpdatePipelineStageDto>;

export const ReorderPipelineStagesDto = z.object({
  stageIds: z.string().array().min(1, "At least one stage ID is required"),
});

export type ReorderPipelineStagesDto = z.infer<typeof ReorderPipelineStagesDto>;


export const BulkCreatePipelineStagesDto = z.object({
  id: z.string(),
});

export type BulkCreatePipelineStagesDto = z.infer<typeof BulkCreatePipelineStagesDto>;
