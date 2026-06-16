import { Types } from "mongoose";
import { Activity, ActivityDocument } from "../models/activity.model";

interface IActivityRepository {
  getActivitiesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<ActivityDocument[]>;
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
}

export default ActivityRepository;
