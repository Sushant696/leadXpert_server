import { Types } from "mongoose";
import { Activity, ActivityDocument } from "../models/activity.model";
import { ActivityType } from "../types/shared.types";

interface CreateActivityData {
  workspaceId: string;
  performedBy: string;
  entityType: "LEAD" | "DEAL";
  entityId: string;
  type: ActivityType;
  description?: string | null;
  metadata?: Record<string, unknown>;
}

interface IActivityRepository {
  getActivitiesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<ActivityDocument[]>;
  createActivity(data: CreateActivityData): Promise<ActivityDocument>;
}

class ActivityRepository implements IActivityRepository {
  async getActivitiesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<ActivityDocument[]> {
    return await Activity.find({
      entityType,
      entityId: new Types.ObjectId(entityId),
    })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });
  }

  async createActivity(data: CreateActivityData): Promise<ActivityDocument> {
    return await Activity.create({
      workspaceId: new Types.ObjectId(data.workspaceId),
      performedBy: new Types.ObjectId(data.performedBy),
      entityType: data.entityType,
      entityId: new Types.ObjectId(data.entityId),
      type: data.type,
      description: data.description ?? null,
      metadata: data.metadata ?? {},
    });
  }
}

export default ActivityRepository;
