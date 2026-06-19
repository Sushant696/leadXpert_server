/**
 * Lead Scoring Router
 * ====================
 * Exposes scoring endpoints on the Node.js backend.
 * Mount in your main router:
 *   app.use("/api/ml", scoringRouter);
 *
 * Endpoints:
 *   GET  /api/ml/health           — check Flask service is up
 *   POST /api/ml/leads/:id/score  — manually re-score a lead
 *   POST /api/ml/workspace/:id/batch-score — batch re-score workspace
 */

import { Router, Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Lead } from "../models/lead.model";
import {
  scoreLead,
  batchScoreLeads,
  checkMLServiceHealth,
} from "../services/scoring.service";

export const scoringRouter = Router();

// ── GET /api/ml/health
scoringRouter.get("/health", async (_req: Request, res: Response) => {
  const healthy = await checkMLServiceHealth();
  return res.status(healthy ? 200 : 503).json({
    status:    healthy ? "ok" : "unavailable",
    service:   "LeadXpert ML Microservice",
    timestamp: new Date().toISOString(),
  });
});

// ── POST /api/ml/leads/:id/score
scoringRouter.post(
  "/leads/:id/score",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }

      const lead = await Lead.findById(id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const result = await scoreLead(lead);
      if (!result) {
        return res.status(200).json({
          message: "Lead skipped (already converted/lost or scoring unavailable)",
          leadId:  id,
        });
      }

      return res.status(200).json({
        leadId:  id,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/ml/workspace/:id/batch-score
scoringRouter.post(
  "/workspace/:id/batch-score",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid workspace ID" });
      }

      const staleDays = Number(req.query.staleDays ?? 1);
      const { scored, failed } = await batchScoreLeads(
        new Types.ObjectId(id),
        staleDays
      );

      return res.status(200).json({
        workspaceId: id,
        scored,
        failed,
        timestamp:   new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);
