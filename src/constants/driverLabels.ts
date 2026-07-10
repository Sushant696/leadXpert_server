/**
 * Plain-English labels for the model's technical feature names, used by the
 * Insights page "What actually drives a sale" card (driver-ranking). The
 * translation is done server-side so no raw feature name ever reaches the UI.
 *
 * Keep in sync with the feature set in
 * leadXpert_ml_service/training/model_comparison.json → feature_importances.
 */
export const DRIVER_LABELS: Record<string, string> = {
  lead_source: "Where the lead came from",
  activity_count: "How much you've followed up",
  is_rotten: "How long it's been sitting idle",
  stage_probability: "How far along it is",
  stage_index: "Which stage it's in",
  days_since_last_contact: "How recently you've been in touch",
  task_count: "Follow-up tasks scheduled",
  days_in_pipeline: "How long it's been open",
  note_count: "Notes and context logged",
  lead_value: "Deal size",
  time_in_current_stage: "Time stuck in this stage",
  human_priority: "Your team's own priority rating",
  has_upcoming_task: "Whether a follow-up is scheduled",
  business_vertical: "Type of business",
};
