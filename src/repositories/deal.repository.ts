import { Types } from "mongoose";
import { Deal, DealDocument, IDeal } from "../models/deal.model";

interface IDealRepository {
  createDeal(dealData: Partial<IDeal>): Promise<DealDocument>;
  getDealById(dealId: string): Promise<DealDocument | null>;
  getDealByLeadId(leadId: string): Promise<DealDocument | null>;
  getDealsByWorkspaceId(
    workspaceId: string,
    options?: { assignedTo?: string; search?: string; status?: string },
  ): Promise<DealDocument[]>;
  updateDeal(dealId: string, dealData: Partial<IDeal>): Promise<DealDocument | null>;
  deleteDeal(dealId: string): Promise<void>;
}

class DealRepository implements IDealRepository {
  async createDeal(dealData: Partial<IDeal>): Promise<DealDocument> {
    return await Deal.create(dealData);
  }

  async getDealById(dealId: string): Promise<DealDocument | null> {
    return await Deal.findById(dealId)
      .populate("contactId", "name email phone")
      .populate("assignedTo", "name email");
  }

  // Deal.leadId carries a unique index, so at most one deal exists per lead.
  async getDealByLeadId(leadId: string): Promise<DealDocument | null> {
    return await Deal.findOne({ leadId });
  }

  async getDealsByWorkspaceId(
    workspaceId: string,
    options?: { assignedTo?: string; search?: string; status?: string },
  ): Promise<DealDocument[]> {
    const query: any = { workspaceId };

    if (options?.status) {
      query.status = options.status;
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

    return await Deal.find(query)
      .populate("contactId", "name email phone")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  }

  async updateDeal(
    dealId: string,
    dealData: Partial<IDeal>,
  ): Promise<DealDocument | null> {
    return await Deal.findByIdAndUpdate(dealId, dealData, { new: true });
  }

  async deleteDeal(dealId: string): Promise<void> {
    await Deal.findByIdAndDelete(dealId);
  }
}

export default DealRepository;
