import ActivityRepository from "../repositories/activity.repository";

const activityRepository = new ActivityRepository();

class ActivityService {
  async getActivitiesByEntity(entityType: string, entityId: string) {
    const activities = await activityRepository.getActivitiesByEntity(
      entityType,
      entityId,
    );
    return activities;
  }
}

export default ActivityService;
