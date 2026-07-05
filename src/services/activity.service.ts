import ActivityRepository from "../repositories/activity.repository";
import { ActivityType } from "../types/shared.types";
import { emitLeadEvent } from "../lib/eventBus";

const activityRepository = new ActivityRepository();

interface LogActivityData {
  workspaceId: string;
  performedBy: string;
  entityType: "LEAD" | "DEAL";
  entityId: string;
  type: ActivityType;
  description?: string | null;
  metadata?: Record<string, unknown>;
}

class ActivityService {
  async getActivitiesByEntity(entityType: string, entityId: string) {
    const activities = await activityRepository.getActivitiesByEntity(
      entityType,
      entityId,
    );
    return activities;
  }

  async logActivity(data: LogActivityData) {
    const activity = await activityRepository.createActivity(data);

    if (data.entityType === "LEAD") {
      emitLeadEvent(data.entityId, "activity");
    }

    return activity;
  }
}

export default ActivityService;
