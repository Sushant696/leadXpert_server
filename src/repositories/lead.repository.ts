import { Types } from "mongoose";
import { Lead, LeadDocument, ILead } from "../models/lead.model";
import { LeadStatus } from "../types/shared.types";

interface ILeadRepository {
  createLead(leadData: Partial<ILead>): Promise<LeadDocument>;
  getLeadById(leadId: string): Promise<LeadDocument | null>;
  getLeadsByPipelineId(
    pipelineId: string,
    options?: { stageId?: string; assignedTo?: string; search?: string },
  ): Promise<LeadDocument[]>;
  getLeadsByworkspaceId(
    workspaceId: string,
  ): Promise<LeadDocument[]>;
  updateLead(
    leadId: string,
    leadData: Partial<ILead>,
  ): Promise<LeadDocument | null>;
  moveLeadToStage(
    leadId: string,
    stageId: string,
    stageName: string
  ): Promise<LeadDocument | null>;
  assignLeadToUser(
    leadId: string,
    userId: string,
  ): Promise<LeadDocument | null>;
  convertLeadToDeal(
    leadId: string,
    userId: string,
  ): Promise<LeadDocument | null>;
  markLeadAsLost(
    leadId: string,
    lostReason?: string,
  ): Promise<LeadDocument | null>;
  deleteLead(leadId: string): Promise<void>;
}

class LeadRepository implements ILeadRepository {
  async createLead(leadData: Partial<ILead>): Promise<LeadDocument> {
    return await Lead.create(leadData);
  }

  async getLeadById(leadId: string): Promise<LeadDocument | null> {
    return await Lead.findById(leadId).populate(
      "contactId",
      "name email phone",
    );
  }

  async getLeadsByworkspaceId(
    workspaceId: string,
  ): Promise<LeadDocument[]> {
    return await Lead.find({ workspaceId })
  }

  async getLeadsByPipelineId(
    pipelineId: string,
    options?: { stageId?: string; assignedTo?: string; search?: string },
  ): Promise<LeadDocument[]> {
    const query: any = { pipelineId };

    if (options?.stageId) {
      query.stageId = new Types.ObjectId(options.stageId);
    }

    if (options?.assignedTo) {
      query.assignedTo = new Types.ObjectId(options.assignedTo);
    }

    if (options?.search) {
      query.$or = [
        { title: { $regex: options.search, $options: "i" } },
        { "contact.name": { $regex: options.search, $options: "i" } },
      ];
    }

    return await Lead.find(query)
      .populate("contactId", "name email phone")
      .populate("stageId", "name order")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
  }

  async updateLead(
    leadId: string,
    leadData: Partial<ILead>,
  ): Promise<LeadDocument | null> {
    return await Lead.findByIdAndUpdate(leadId, leadData, { new: true });
  }
  async moveLeadToStage(
    leadId: string,
    stageId: string,
    stageName: string
  ): Promise<LeadDocument | null> {
    const lead = await Lead.findById(leadId);
    if (!lead) return null;

    const now = new Date();
    const timeSpentMs = now.getTime() - new Date(lead.stageEnteredAt).getTime();

    lead.stageHistory.push({
      stageId: new Types.ObjectId(stageId),
      stageName: stageName,
      enteredAt: lead.stageEnteredAt,
      exitedAt: now,
      timeSpentMs,
      movedBy: lead.assignedTo,
    });

    lead.stageId = new Types.ObjectId(stageId);
    lead.stageEnteredAt = now;

    return await lead.save();
  }

  async assignLeadToUser(
    leadId: string,
    userId: string,
  ): Promise<LeadDocument | null> {
    return await Lead.findByIdAndUpdate(
      leadId,
      { assignedTo: new Types.ObjectId(userId) },
      { new: true },
    );
  }

  async convertLeadToDeal(
    leadId: string,
    userId: string,
  ): Promise<LeadDocument | null> {
    return await Lead.findByIdAndUpdate(
      leadId,
      {
        isConverted: true,
        convertedAt: new Date(),
        convertedBy: new Types.ObjectId(userId),
      },
      { new: true },
    );
  }

  async markLeadAsLost(
    leadId: string,
    lostReason?: string,
  ): Promise<LeadDocument | null> {
    return await Lead.findByIdAndUpdate(
      leadId,
      {
        status: LeadStatus.LOST,
        lostReason,
      },
      { new: true },
    );
  }

  async deleteLead(leadId: string): Promise<void> {
    await Lead.findByIdAndDelete(leadId);
  }
}

export default LeadRepository;
