import { Request, Response, NextFunction } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { env } from "../config/env";

// Skip rate limiting entirely in development so local testing is never blocked.
// This is baked into every limiter below, so re-running flows while developing
// won't lock you out. In production the limits apply normally.
const skipInDevelopment = () => env.NODE_ENV === "development";

// Global limiter — generous on purpose. This is a CRM, not a banking system,
// so the goal is to stop scraping / abusive bursts, not to police normal usage.
// ~1000 requests / 15 min per IP is plenty for an active user with a busy board.
export const rateLimiter = rateLimit({
  limit: 1000,
  windowMs: 15 * 60 * 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  skip: skipInDevelopment,
  message: "Too many requests, please try again later.",
});

// Strict-ish limiter for verification/validation endpoints.
// Still prevents brute-force of 6-digit codes, but loosened for real users.
export const verificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: skipInDevelopment,
  message: {
    error: "Too many verification attempts. Please try again in 15 minutes.",
  },
  keyGenerator: (req) => {
    const email = req.body.email || req.query.email || "unknown";
    const ipKey = ipKeyGenerator(req.ip ?? "0.0.0.0");
    return `${ipKey}-${email}`;
  },
});

// Rate limiter for password reset requests.
// Prevents abuse of the forgot-password endpoint without annoying real users.
export const passwordResetRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: skipInDevelopment,
  message: {
    error: "Too many password reset requests. Please try again in 1 hour.",
  },
  keyGenerator: (req: Request) => {
    const email = req.body.email || "unknown";
    const ipKey = ipKeyGenerator(req.ip ?? "0.0.0.0");
    return `${ipKey}-${email}`;
  },
});

// Rate limiter for resend verification — prevents email spam/abuse.
export const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: {
    error: "Too many resend requests. Please try again in 1 hour.",
  },
  keyGenerator: (req: Request) => {
    const email = req.body.email || req.query.email || "unknown";
    const ipKey = ipKeyGenerator(req.ip ?? "0.0.0.0");
    return `${ipKey}-${email}`;
  },
});

// Login limiter — guards against credential stuffing while staying forgiving
// for users who fat-finger their password a few times. Successful logins don't
// count toward the limit.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: skipInDevelopment,
  message: {
    error: "Too many login attempts. Please try again in 15 minutes.",
  },
  keyGenerator: (req: Request) => {
    const email = req.body.email || req.query.email || "unknown";
    const ipKey = ipKeyGenerator(req.ip ?? "0.0.0.0");
    return `${ipKey}-${email}`;
  },
});

// Registration limiter — prevents mass account creation from one IP.
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: {
    error: "Too many registration attempts. Please try again in 1 hour.",
  },
});

// Kept for backwards-compatibility with existing route wiring. The dev skip is
// now baked into each limiter above, so this is effectively a passthrough, but
// it stays so the auth routes don't need to change.
export const skipRatelimiterForDevelopment = (rateLimiterFunction: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "development") {
      return next();
    }
    return rateLimiterFunction(req, res, next);
  };
};
