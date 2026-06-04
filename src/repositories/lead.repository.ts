import { Types } from "mongoose";
import { Lead, LeadDocument, ILead } from "../models/lead.model";

interface ILeadRepository {
  createLead(leadData: Partial<ILead>): Promise<LeadDocument>;
  getLeadById(leadId: string): Promise<LeadDocument | null>;
  getLeadsByPipelineId(
    pipelineId: string,
    options?: { stageId?: string; assignedTo?: string; search?: string },
  ): Promise<LeadDocument[]>;
  updateLead(
    leadId: string,
    leadData: Partial<ILead>,
  ): Promise<LeadDocument | null>;
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
}

export default LeadRepository;
