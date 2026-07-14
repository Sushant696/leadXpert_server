import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreateLeadDto, UpdateLeadDto, MoveLeadDto } from "../dtos/lead.dto";
import { ILead, LeadDocument } from "../models/lead.model";
import LeadRepository from "../repositories/lead.repository";
import DealRepository from "../repositories/deal.repository";
import PipelineRepository from "../repositories/pipeline.repository";
import PipelineStageRepository from "../repositories/pipeline-stage.repository";
import ActivityService from "../services/activity.service";
import { ActivityType, LeadStatus, StageType } from "../types/shared.types";

const leadRepository = new LeadRepository();
const dealRepository = new DealRepository();
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

  // Workspace-scoped single-lead fetch for the lead detail page, which only
  // knows the workspace + lead id (no pipeline id in its route). Verifies the
  // lead belongs to the caller's workspace rather than to a specific pipeline.
  async getLeadByIdForWorkspace(workspaceId: string, leadId: string) {
    const lead = await leadRepository.getLeadById(leadId);
    if (!lead) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.LEAD.NOT_FOUND);
    }

    if (lead.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    return lead;
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

  /**
   * Central stage-move service. Branches on the TARGET stage's type:
   *
   *  - WON:  the lead can only be converted once. If a Deal already exists for
   *          the lead we throw immediately (this is also what permanently blocks
   *          a reopened-then-re-won lead). Otherwise a Deal is created from the
   *          supplied dealDetails and the lead is marked converted/won.
   *  - LOST: requires a lost reason + tag; sets status to LOST (isConverted
   *          stays false).
   *  - OPEN: a reopen. If the lead was previously WON/LOST its conversion and
   *          lost fields are reset and status returns to OPEN. Any existing Deal
   *          is left untouched as a historical record — which is exactly why a
   *          reopened lead can never be won again through this flow.
   *
   * Stage history, the save, and the scoring hook are handled by the repository
   * in a single save() regardless of branch.
   */
  async moveLeadToStage(
    pipelineId: string,
    leadId: string,
    stageId: string,
    userId: string,
    options?: {
      lostReason?: string | null;
      lostReasonTag?: MoveLeadDto["lostReasonTag"];
      dealDetails?: MoveLeadDto["dealDetails"];
    },
  ) {
    const existingLead = await this.ensureLeadInPipeline(leadId, pipelineId);
    const [oldStage, newStage] = await Promise.all([
      pipelineStageRepository.findById(extractId(existingLead.stageId)!),
      pipelineStageRepository.findById(stageId),
    ]);

    if (!newStage) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.LEAD.STAGE_NOT_FOUND,
      );
    }

    const workspaceId = extractId(existingLead.workspaceId)!;
    const updates: Partial<ILead> = {};

    if (newStage.type === StageType.WON) {
      // 1. A lead may only ever have one deal. If one exists (including on a
      //    reopened-then-re-won lead) block the conversion outright.
      const existingDeal = await dealRepository.getDealByLeadId(leadId);
      if (existingDeal) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          errorMessages.DEAL.ALREADY_EXISTS,
        );
      }

      // 2. dealDetails are mandatory for a WON move.
      const dealDetails = options?.dealDetails;
      if (!dealDetails) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          errorMessages.DEAL.DETAILS_REQUIRED,
        );
      }

      // Create the Deal FIRST so that if the unique leadId index rejects a
      // concurrent insert, the lead is left untouched (clean revert) rather
      // than being marked won without a deal.
      // Respect an explicit choice from the dialog (including an explicit
      // "unassigned" → null); only fall back to the lead's assignee when the
      // field was omitted entirely.
      const assignedToId =
        dealDetails.assignedTo !== undefined
          ? dealDetails.assignedTo
          : extractId(existingLead.assignedTo);
      try {
        await dealRepository.createDeal({
          workspaceId: new Types.ObjectId(workspaceId),
          createdBy: new Types.ObjectId(userId),
          leadId: new Types.ObjectId(leadId),
          contactId: existingLead.contactId
            ? new Types.ObjectId(extractId(existingLead.contactId)!)
            : null,
          pipelineId: existingLead.pipelineId,
          title: dealDetails.title,
          value: dealDetails.value,
          currency: dealDetails.currency,
          paymentType: dealDetails.paymentType,
          advancePaid: dealDetails.advancePaid ?? 0,
          amountReceived: dealDetails.amountReceived ?? 0,
          serviceDescription: dealDetails.serviceDescription ?? null,
          deliverables: dealDetails.deliverables ?? [],
          startDate: dealDetails.startDate ?? null,
          expectedEndDate: dealDetails.expectedEndDate ?? null,
          assignedTo: assignedToId ? new Types.ObjectId(assignedToId) : null,
        });
      } catch (err: any) {
        // Duplicate key on the unique leadId index — a deal was created by a
        // concurrent request between our check and this insert.
        if (err?.code === 11000) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            errorMessages.DEAL.ALREADY_EXISTS,
          );
        }
        throw err;
      }

      // 3-6. Mark the lead converted/won and clear any prior lost reason.
      updates.isConverted = true;
      updates.convertedAt = new Date();
      updates.convertedBy = new Types.ObjectId(userId);
      updates.status = LeadStatus.WON;
      updates.hasDeal = true;
      updates.lostReason = null;
      updates.lostReasonTag = null;
    } else if (newStage.type === StageType.LOST) {
      // A lost reason and tag are mandatory for a LOST move.
      if (!options?.lostReason || !options?.lostReasonTag) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          errorMessages.LEAD.LOST_DETAILS_REQUIRED,
        );
      }
      updates.status = LeadStatus.LOST;
      updates.lostReason = options.lostReason;
      updates.lostReasonTag = options.lostReasonTag;
      // isConverted intentionally left unchanged.
    } else {
      // OPEN (reopen). Only reset if the lead was in a terminal state.
      if (
        existingLead.status === LeadStatus.WON ||
        existingLead.status === LeadStatus.LOST
      ) {
        updates.status = LeadStatus.OPEN;
        updates.isConverted = false;
        updates.convertedAt = null;
        updates.convertedBy = null;
        updates.lostReason = null;
        updates.lostReasonTag = null;
        // NOTE: hasDeal and any existing Deal are deliberately preserved.
      }
    }

    const updatedLead = await leadRepository.moveLeadToStage(
      leadId,
      stageId,
      newStage.name,
      updates,
    );

    await pipelineRepository.syncPipelineStats(pipelineId);

    if (updatedLead) {
      await this.logActivity(
        workspaceId,
        userId,
        leadId,
        ActivityType.STAGE_CHANGED,
        `Moved from ${oldStage?.name ?? "previous stage"} to ${newStage.name}`,
        { fromStageId: extractId(existingLead.stageId), toStageId: stageId },
      );

      // Surface the semantic transition as its own activity entry too.
      if (newStage.type === StageType.WON) {
        await this.logActivity(
          workspaceId,
          userId,
          leadId,
          ActivityType.LEAD_CONVERTED,
          "Lead converted to deal",
        );
      } else if (newStage.type === StageType.LOST) {
        await this.logActivity(
          workspaceId,
          userId,
          leadId,
          ActivityType.LEAD_LOST,
          options?.lostReason
            ? `Lead marked as lost: ${options.lostReason}`
            : "Lead marked as lost",
          { lostReason: options?.lostReason, lostReasonTag: options?.lostReasonTag },
        );
      }
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
