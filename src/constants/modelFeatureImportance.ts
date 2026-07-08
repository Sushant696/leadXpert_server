/**
 * Static snapshot of the trained model's evaluation results.
 * Source: leadXpert_ml_service/training/model_comparison.json (Random Forest,
 * the model currently loaded by the Flask service — see ml-service/models/best_model.pkl).
 *
 * This is intentionally static, not computed at request time. Regenerate by
 * re-running training/train_model.py and copying the new `feature_importances`
 * and `results["Random Forest"]` values in here.
 */

export const MODEL_NAME = "Random Forest";

export const MODEL_METRICS = {
  accuracy: 0.6372,
  precision: 0.4785,
  recall: 0.5663,
  f1: 0.5187,
  aucRoc: 0.6767,
};

export const FEATURE_IMPORTANCE: { feature: string; importance: number }[] = [
  { feature: "lead_source", importance: 0.2814 },
  { feature: "activity_count", importance: 0.1571 },
  { feature: "is_rotten", importance: 0.1041 },
  { feature: "stage_probability", importance: 0.0942 },
  { feature: "stage_index", importance: 0.0909 },
  { feature: "days_since_last_contact", importance: 0.0642 },
  { feature: "task_count", importance: 0.0473 },
  { feature: "days_in_pipeline", importance: 0.0369 },
  { feature: "note_count", importance: 0.025 },
  { feature: "lead_value", importance: 0.024 },
  { feature: "time_in_current_stage", importance: 0.0228 },
  { feature: "human_priority", importance: 0.0222 },
  { feature: "has_upcoming_task", importance: 0.015 },
  { feature: "business_vertical", importance: 0.0149 },
];
