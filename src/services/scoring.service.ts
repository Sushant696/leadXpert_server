/**
 * LeadXpert ML Scoring Service
 * ==============================
 * Bridges the Node.js backend and the Python Flask ML microservice.
 * Extracts scoreFeatures from a Lead document, calls /score,
 * and writes mlScore + mlPriority + scoreFeatures back to MongoDB.
 *
 * Usage:
 *   import { scoreLead, batchScoreLeads } from "@/services/ml/scoring.service";
 *
 *   // Single lead (called from Mongoose hook or API route)
 *   const result = await scoreLead(lead);
 *
 *   // Bulk re-score (admin trigger or cron job)
 *   await batchScoreLeads(workspaceId);
 */

import axios, { AxiosError } from "axios";
import { Types } from "mongoose";
import { Lead, LeadDocument } from "../models/lead.model";
import { PipelineStage } from "../models/pipeline-stage.model";
import { Pipeline } from "../models/pipeline.model";
import { env } from "../config/env";
import { emitLeadEvent } from "../lib/eventBus";

// ── Flask microservice URL (internal only)
const ML_SERVICE_URL = env.ML_SERVICE_URL;
const ML_TIMEOUT_MS  = 5000; // 5s max — fast enough for sync scoring

// ── Scoring thresholds (must match app.py)
const SCORE_HIGH_THRESHOLD   = 65;
const SCORE_MEDIUM_THRESHOLD = 35;

// ── Types
export interface ScoreResult {
  mlScore:               number;
  mlPriority:            "HIGH" | "MEDIUM" | "LOW";
  conversionProbability: number;
  model:                 string;
  topFeatures:           Array<{ feature: string; importance: number }>;
  scoredAt:              string;
}

export interface ScoreFeatureVector {
  lead_source:             string;
  business_vertical:       string;
  human_priority:          string;
  lead_value:              number;
  days_in_pipeline:        number;
  time_in_current_stage:   number;
  days_since_last_contact: number;
  activity_count:          number;
  task_count:              number;
  note_count:              number;
  stage_index:             number;
  stage_probability:       number;
  is_rotten:               0 | 1;
  has_upcoming_task:       0 | 1;
}

// ══════════════════════════════════════════════
// FEATURE EXTRACTION
// ══════════════════════════════════════════════

/**
 * Extracts the 14-feature vector from a Lead document.
 * Looks up stage_probability from PipelineStage.
 * This vector is both sent to Flask AND stored as Lead.scoreFeatures.
 */
async function extractFeatures(lead: LeadDocument): Promise<ScoreFeatureVector> {
  const now = new Date();

  // ── Pipeline lookup (for business_vertical + real stage_index position)
  let pipelineVertical = "GENERAL";
  let stageOrderIds: string[] = [];
  try {
    const pipeline = await Pipeline.findById(lead.pipelineId)
      .select("vertical stageOrder")
      .lean();
    if (pipeline) {
      pipelineVertical = (pipeline.vertical ?? "GENERAL").toUpperCase();
      stageOrderIds = (pipeline.stageOrder ?? []).map(String);
    }
  } catch {
    // Non-fatal — fall back to GENERAL / proxy stage index
  }

  // ── stage_probability: look up from PipelineStage
  let stageProbability = 20; // default if not found
  try {
    const stage = await PipelineStage.findById(lead.stageId).select("probability").lean();
    if (stage) {
      stageProbability = stage.probability ?? 20;
    }
  } catch {
    // Non-fatal — use default
  }

  // ── stage_index: real position in the pipeline's stage order.
  // WON = 5, LOST = -1, otherwise the 0-based column index (clamped 0-4 to
  // match the open-stage range the model was trained on).
  let stageIndex = 0;
  if (lead.isConverted || lead.status === "WON") {
    stageIndex = 5;
  } else if (lead.status === "LOST") {
    stageIndex = -1;
  } else {
    const idx = stageOrderIds.indexOf(String(lead.stageId));
    stageIndex = idx === -1
      ? Math.min(lead.stageHistory?.length ?? 0, 4) // fallback to proxy
      : Math.min(idx, 4);
  }

  // ── days_in_pipeline
  const createdAt = (lead as any).createdAt ?? now;
  const daysInPipeline = Math.max(
    0,
    Math.floor((now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  // ── time_in_current_stage
  const timeInCurrentStage = Math.max(
    0,
    Math.floor((now.getTime() - new Date(lead.stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  // ── days_since_last_contact
  const daysSinceLastContact = lead.lastContactedAt
    ? Math.max(0, Math.floor((now.getTime() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : daysInPipeline; // never contacted = treat as pipeline age

  // ── has_upcoming_task
  const hasUpcomingTask: 0 | 1 =
    lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) > now ? 1 : 0;

  // ── Normalize lead_source and priority to match training enum values
  const leadSource = (lead.source ?? "OTHER").toUpperCase();
  const humanPriority = (lead.priority ?? "MEDIUM").toUpperCase();

  // ── business_vertical: read from the lead's Pipeline (looked up above)
  const businessVertical = pipelineVertical;

  return {
    lead_source:             leadSource,
    business_vertical:       businessVertical,
    human_priority:          humanPriority,
    lead_value:              Math.max(0, lead.value ?? 0),
    days_in_pipeline:        daysInPipeline,
    time_in_current_stage:   timeInCurrentStage,
    days_since_last_contact: daysSinceLastContact,
    activity_count:          Math.max(0, lead.activityCount ?? 0),
    task_count:              Math.max(0, lead.taskCount ?? 0),
    note_count:              Math.max(0, lead.noteCount ?? 0),
    stage_index:             stageIndex,
    stage_probability:       stageProbability,
    is_rotten:               lead.isRotten ? 1 : 0,
    has_upcoming_task:       hasUpcomingTask,
  };
}

// ══════════════════════════════════════════════
// FLASK CALL
// ══════════════════════════════════════════════

async function callScoreEndpoint(features: ScoreFeatureVector): Promise<ScoreResult> {
  try {
    const { data } = await axios.post<ScoreResult>(
      `${ML_SERVICE_URL}/score`,
      features,
      {
        timeout: ML_TIMEOUT_MS,
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error: string }>;
    if (axiosErr.response) {
      throw new Error(
        `ML service error ${axiosErr.response.status}: ${axiosErr.response.data?.error ?? "unknown"}`
      );
    }
    if (axiosErr.code === "ECONNREFUSED") {
      throw new Error("ML service is not running (ECONNREFUSED on port 5001)");
    }
    throw new Error(`ML service unreachable: ${axiosErr.message}`);
  }
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════

/**
 * Score a single lead and write results back to MongoDB.
 * Safe to call from post-save hooks — handles errors without crashing.
 *
 * @param lead  Hydrated LeadDocument (must have _id)
 * @returns     ScoreResult | null (null on failure — non-fatal)
 */
export async function scoreLead(lead: LeadDocument): Promise<ScoreResult | null> {
  // Skip scoring for resolved leads (won/lost/archived — already closed out)
  if (
    lead.isConverted ||
    lead.status === "WON" ||
    lead.status === "LOST" ||
    lead.status === "ARCHIVED"
  ) {
    return null;
  }

  try {
    const features = await extractFeatures(lead);
    const result   = await callScoreEndpoint(features);

    // Write back to MongoDB — use updateOne to avoid re-triggering hooks
    await Lead.updateOne(
      { _id: lead._id },
      {
        $set: {
          mlScore:       result.mlScore,
          mlPriority:    result.mlPriority,
          lastScoredAt:  new Date(result.scoredAt),
          scoreFeatures: features,
        },
      }
    );

    emitLeadEvent(String(lead._id), "score");

    return result;
  } catch (err) {
    // Non-fatal — log but don't crash the lead creation flow
    console.error(`[ScoringService] Failed to score lead ${lead._id}:`, err);
    return null;
  }
}

/**
 * Batch score all unscored (or stale) leads in a workspace.
 * Calls /score/batch for efficiency.
 *
 * @param workspaceId   Workspace to re-score
 * @param staleDays     Re-score leads not scored in X days (default: 1)
 */
export async function batchScoreLeads(
  workspaceId: Types.ObjectId | string,
  staleDays = 1
): Promise<{ scored: number; failed: number }> {
  const staleThreshold = new Date();
  staleThreshold.setDate(staleThreshold.getDate() - staleDays);

  // Find leads that need scoring
  const leads = await Lead.find({
    workspaceId,
    isConverted: false,
    status: { $nin: ["LOST", "WON", "ARCHIVED"] },
    $or: [
      { lastScoredAt: null },
      { lastScoredAt: { $lt: staleThreshold } },
    ],
  })
    .limit(500) // match Flask batch limit
    .lean();

  if (leads.length === 0) return { scored: 0, failed: 0 };

  // Extract features for each lead
  const featureVectors = await Promise.all(
    leads.map(async (lead) => {
      const hydrated = lead as unknown as LeadDocument;
      const features = await extractFeatures(hydrated);
      return { leadId: String(lead._id), ...features };
    })
  );

  // Call batch endpoint
  const { data } = await axios.post(
    `${ML_SERVICE_URL}/score/batch`,
    { leads: featureVectors },
    { timeout: 30_000 }
  );

  // Write results back
  const bulkOps = data.results
    .filter((r: any) => !r.error)
    .map((r: ScoreResult & { leadId: string }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(r.leadId) },
        update: {
          $set: {
            mlScore:      r.mlScore,
            mlPriority:   r.mlPriority,
            lastScoredAt: new Date(r.scoredAt),
          },
        },
      },
    }));

  if (bulkOps.length > 0) {
    await Lead.bulkWrite(bulkOps);
  }

  return {
    scored: data.successCount,
    failed: data.errorCount,
  };
}

/**
 * Health check — confirms Flask service is reachable.
 */
export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const { data } = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3000 });
    return data.status === "ok";
  } catch {
    return false;
  }
}
