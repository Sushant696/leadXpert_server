import { Request, Response, NextFunction } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { env } from "../config/env";

export const rateLimiter = rateLimit({
  limit: 100,
  windowMs: 15 * 60 * 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: "Too many requests, please try again later.",
});

// Strict rate limiter for verification/validation endpoints
// Prevents brute-force of 6-digit codes

export const verificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: "Too many verification attempts. Please try again in 15 minutes.",
  },
  keyGenerator: (req) => {
    const email = req.body.email || req.query.email || "unknown";
    const ipKey = ipKeyGenerator(req.ip ?? "0.0.0.0");
    return `${ipKey}-${email}`;
  },
});

// Rate limiter for password reset requests
// Prevents abuse of forgot password endpoint

export const passwordResetRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    error: "Too many password reset requests. Please try again in 1 hour.",
  },
  keyGenerator: (req: Request) => {
    const email = req.body.email || "unknown";
    const ipKey = ipKeyGenerator(req.ip ?? "0.0.0.0");
    return `${ipKey}-${email}`
  },
});

// Rate limiter for resend verification
// Prevents spam/abuse
export const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many resend requests. Please try again in 1 hour.",
  },
  keyGenerator: (req: Request) => {
    const email = req.body.email || req.query.email || "unknown";
    const ipKey = ipKeyGenerator(req.ip ?? "0.0.0.0");
    return `${ipKey}-${email}`
  },
});

// Strict login rate limiter
// Prevents credential stuffing attacks
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: "Too many login attempts. Please try again in 15 minutes.",
  },
  keyGenerator: (req: Request) => {
    const email = req.body.email || req.query.email || "unknown";
    const ipKey = ipKeyGenerator(req.ip ?? "0.0.0.0");
    return `${ipKey}-${email}`
  },
});

// Registration rate limiter
// Prevents mass account creation
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many registration attempts. Please try again in 1 hour.",
  },
});

export const skipRatelimiterForDevelopment = (rateLimiterFunction: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "development") {
      return next();
    }
    return rateLimiterFunction(req, res, next);
  };
};
