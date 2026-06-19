/**
 * Lead Scoring Hook
 * ==================
 * Registers Mongoose hooks on the Lead schema that trigger ML scoring
 * automatically after:
 *   - Lead creation / save
 *   - Stage change / counter increment (findOneAndUpdate)
 *
 * Wiring: call registerLeadScoringHook(LeadSchema) inside lead.model.ts,
 * BEFORE the model is compiled (see the bottom of lead.model.ts).
 *
 * The hooks are fire-and-forget — they never block the API response, and
 * scoreLead() is imported lazily to avoid a circular dependency with
 * lead.model.ts (scoring.service imports the Lead model).
 */

import type { Schema } from "mongoose";

// Fields that should trigger a re-score when changed
const SCORING_TRIGGER_FIELDS = new Set([
  "stageId",
  "source",
  "priority",
  "value",
  "activityCount",
  "taskCount",
  "noteCount",
  "isRotten",
  "nextFollowUpAt",
  "lastContactedAt",
  "stageEnteredAt",
]);

/**
 * Registers the scoring hooks on the Lead schema.
 * Call this after the schema is defined and before model compilation.
 */
export function registerLeadScoringHook(schema: Schema): void {
  // ── Post-save: fires after create OR save
  schema.post("save", function (doc) {
    // Fire-and-forget — don't await so the API response isn't blocked.
    import("../services/scoring.service")
      .then(({ scoreLead }) => scoreLead(doc as never))
      .catch((err) => console.error("[LeadScoringHook] post-save error:", err));
  });

  // ── Post-findOneAndUpdate: fires after stage changes, counter increments etc.
  schema.post("findOneAndUpdate", function (doc) {
    if (!doc) return;

    // Only re-score when a scoring-relevant field actually changed.
    const update = (this.getUpdate() ?? {}) as Record<string, unknown>;
    const setFields = Object.keys((update.$set as object) ?? {});
    const incFields = Object.keys((update.$inc as object) ?? {});
    const changedFields = [...setFields, ...incFields];

    if (!changedFields.some((f) => SCORING_TRIGGER_FIELDS.has(f))) return;

    // Re-fetch the full document via the query's own model (avoids importing
    // the Lead model here and the circular dependency that would create).
    const model = this.model;
    model
      .findById(doc._id)
      .then((fresh) => {
        if (!fresh) return;
        return import("../services/scoring.service").then(({ scoreLead }) =>
          scoreLead(fresh as never)
        );
      })
      .catch((err) =>
        console.error("[LeadScoringHook] findOneAndUpdate error:", err)
      );
  });
}
