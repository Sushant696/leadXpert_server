import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreateLeadDto, UpdateLeadDto } from "../dtos/lead.dto";
import { ILead, LeadDocument } from "../models/lead.model";
import LeadRepository from "../repositories/lead.repository";
import PipelineRepository from "../repositories/pipeline.repository";
import PipelineStageRepository from "../repositories/pipeline-stage.repository";
import ActivityService from "../services/activity.service";
import { ActivityType } from "../types/shared.types";

const leadRepository = new LeadRepository();
const pipelineRepository = new PipelineRepository();
const pipelineStageRepository = new PipelineStageRepository()
const activityService = new ActivityService();

// contactId/stageId/assignedTo may arrive either as raw ObjectIds or as
// populated documents (getLeadById populates them) — this normalizes both
// shapes to a plain id string for comparison/logging purposes.
function extractId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

class LeadService {
  private async logActivity(
    workspaceId: string,
    performedBy: string,
    leadId: string,
    type: ActivityType,
    description?: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      await activityService.logActivity({
        workspaceId,
        performedBy,
        entityType: "LEAD",
        entityId: leadId,
        type,
        description,
        metadata,
      });
      await leadRepository.incrementActivityCount(leadId);
    } catch (err) {
      // Activity logging must never break the underlying lead operation.
      console.error("[LeadService] failed to log activity:", err);
    }
  }

  private async logLeadUpdateActivities(
    oldLead: LeadDocument,
    newLead: LeadDocument,
    userId: string,
  ) {
    const workspaceId = extractId(oldLead.workspaceId)!;
    const leadId = extractId(newLead._id)!;

    let loggedSomething = false;

    if (oldLead.status !== newLead.status) {
      loggedSomething = true;
      await this.logActivity(
        workspaceId,
        userId,
        leadId,
        ActivityType.STATUS_CHANGED,
        `Status changed from ${oldLead.status} to ${newLead.status}`,
        { from: oldLead.status, to: newLead.status },
      );
    }

    if (oldLead.priority !== newLead.priority) {
      loggedSomething = true;
      await this.logActivity(
        workspaceId,
        userId,
        leadId,
        ActivityType.PRIORITY_CHANGED,
        `Priority changed from ${oldLead.priority} to ${newLead.priority}`,
        { from: oldLead.priority, to: newLead.priority },
      );
    }

    const oldAssignedTo = extractId(oldLead.assignedTo);
    const newAssignedTo = extractId(newLead.assignedTo);
    if (oldAssignedTo !== newAssignedTo) {
      loggedSomething = true;
      await this.logActivity(
        workspaceId,
        userId,
        leadId,
        newAssignedTo ? ActivityType.ASSIGNED : ActivityType.UNASSIGNED,
        newAssignedTo ? "Lead assigned" : "Lead unassigned",
        { from: oldAssignedTo, to: newAssignedTo },
      );
    }

    const oldTags = new Set(oldLead.tags);
    const newTags = new Set(newLead.tags);
    const addedTags = newLead.tags.filter((t) => !oldTags.has(t));
    const removedTags = oldLead.tags.filter((t) => !newTags.has(t));
    if (addedTags.length) {
      loggedSomething = true;
      await this.logActivity(
        workspaceId,
        userId,
        leadId,
        ActivityType.TAG_ADDED,
        `Tag(s) added: ${addedTags.join(", ")}`,
        { tags: addedTags },
      );
    }
    if (removedTags.length) {
      loggedSomething = true;
      await this.logActivity(
        workspaceId,
        userId,
        leadId,
        ActivityType.TAG_REMOVED,
        `Tag(s) removed: ${removedTags.join(", ")}`,
        { tags: removedTags },
      );
    }

    if (!loggedSomething) {
      await this.logActivity(
        workspaceId,
        userId,
        leadId,
        ActivityType.LEAD_UPDATED,
        "Lead details updated",
      );
    }
  }

  async ensureLeadInPipeline(leadId: string, pipelineId: string) {
    const lead = await leadRepository.getLeadById(leadId);
    if (!lead) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.LEAD.NOT_FOUND);
    }

    if (lead.pipelineId.toString() !== pipelineId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    return lead;
  }

  async createLead(
    workspaceId: string,
    pipelineId: string,
    userId: string,
    leadData: CreateLeadDto,
  ) {
    const pipeline = await pipelineRepository.getPipelineById(pipelineId);
    if (!pipeline) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.PIPELINE.NOT_FOUND,
      );
    }

    // Use explicit stage from payload or fallback to first stage in stageOrder
    const selectedStageId =
      leadData.stageId || pipeline.stageOrder?.[0]?.toString();
    if (!selectedStageId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Pipeline must have at least one stage",
      );
    }

    const lead = await leadRepository.createLead({
      workspaceId: new Types.ObjectId(workspaceId),
      pipelineId: new Types.ObjectId(pipelineId),
      stageId: new Types.ObjectId(selectedStageId),
      contactId: leadData.contactId ? new Types.ObjectId(leadData.contactId) : null,
      createdBy: new Types.ObjectId(userId),
      title: leadData.title,
      value: leadData.value,
      currency: leadData.currency,
      priority: leadData.priority,
      source: leadData.source,
      assignedTo: leadData.assignedTo
        ? new Types.ObjectId(leadData.assignedTo)
        : null,
      nextFollowUpAt: leadData.nextFollowUpAt,
      tags: leadData.tags,
      quickNote: leadData.quickNote,
    });

    await pipelineRepository.syncPipelineStats(pipelineId);
    await this.logActivity(
      workspaceId,
      userId,
      extractId(lead._id)!,
      ActivityType.LEAD_CREATED,
      `Lead "${lead.title}" created`,
    );
    return lead;
  }

  async getLeadsByWorkspace(workspaceId: string) {
    const leads = await leadRepository.getLeadsByworkspaceId(
      workspaceId
    );
    return leads;
  }

  async getLeads(pipelineId: string, options?: any) {
    const leads = await leadRepository.getLeadsByPipelineId(
      pipelineId,
      options,
    );
    return leads;
  }

  async getLeadById(pipelineId: string, leadId: string) {
    return this.ensureLeadInPipeline(leadId, pipelineId);
  }

  async updateLead(
    pipelineId: string,
    leadId: string,
    data: UpdateLeadDto,
    userId: string,
  ) {
    const existingLead = await this.ensureLeadInPipeline(leadId, pipelineId);

    const updatePayload: Partial<ILead> = {
      ...data,
      assignedTo: data.assignedTo
        ? new Types.ObjectId(data.assignedTo)
        : data.assignedTo === null
          ? null
          : undefined,
    };

    const updatedLead = await leadRepository.updateLead(leadId, updatePayload);
    await pipelineRepository.syncPipelineStats(pipelineId);
    if (updatedLead) {
      await this.logLeadUpdateActivities(existingLead, updatedLead, userId);
    }
    return updatedLead;
  }

  async moveLeadToStage(
    pipelineId: string,
    leadId: string,
    stageId: string,
    userId: string,
  ) {
    const existingLead = await this.ensureLeadInPipeline(leadId, pipelineId);
    const [oldStage, newStage] = await Promise.all([
      pipelineStageRepository.findById(extractId(existingLead.stageId)!),
      pipelineStageRepository.findById(stageId),
    ]);
    const updatedLead = await leadRepository.moveLeadToStage(leadId, stageId, newStage?.name ?? "stage name");
    if (updatedLead) {
      await this.logActivity(
        extractId(existingLead.workspaceId)!,
        userId,
        leadId,
        ActivityType.STAGE_CHANGED,
        `Moved from ${oldStage?.name ?? "previous stage"} to ${newStage?.name ?? "new stage"}`,
        { fromStageId: extractId(existingLead.stageId), toStageId: stageId },
      );
    }
    return updatedLead;
  }

  async assignLeadToUser(
    pipelineId: string,
    leadId: string,
    assigneeId: string,
    actorId: string,
  ) {
    const existingLead = await this.ensureLeadInPipeline(leadId, pipelineId);

    const updatedLead = await leadRepository.assignLeadToUser(leadId, assigneeId);
    if (updatedLead) {
      await this.logActivity(
        extractId(existingLead.workspaceId)!,
        actorId,
        leadId,
        ActivityType.ASSIGNED,
        "Lead assigned",
        { assignedTo: assigneeId },
      );
    }
    return updatedLead;
  }

  async convertLeadToDeal(pipelineId: string, leadId: string, userId: string) {
    const existingLead = await this.ensureLeadInPipeline(leadId, pipelineId);

    const updatedLead = await leadRepository.convertLeadToDeal(leadId, userId);
    await pipelineRepository.syncPipelineStats(pipelineId);
    if (updatedLead) {
      await this.logActivity(
        extractId(existingLead.workspaceId)!,
        userId,
        leadId,
        ActivityType.LEAD_CONVERTED,
        "Lead converted to deal",
      );
    }
    return updatedLead;
  }

  async markLeadAsLost(
    pipelineId: string,
    leadId: string,
    lostReason: string | undefined,
    userId: string,
  ) {
    const existingLead = await this.ensureLeadInPipeline(leadId, pipelineId);

    const updatedLead = await leadRepository.markLeadAsLost(leadId, lostReason);
    await pipelineRepository.syncPipelineStats(pipelineId);
    if (updatedLead) {
      await this.logActivity(
        extractId(existingLead.workspaceId)!,
        userId,
        leadId,
        ActivityType.LEAD_LOST,
        lostReason ? `Lead marked as lost: ${lostReason}` : "Lead marked as lost",
        { lostReason },
      );
    }
    return updatedLead;
  }

  async archiveLead(pipelineId: string, leadId: string) {
    await this.ensureLeadInPipeline(leadId, pipelineId);

    await leadRepository.deleteLead(leadId);
    await pipelineRepository.syncPipelineStats(pipelineId);
  }
}

export default LeadService;
