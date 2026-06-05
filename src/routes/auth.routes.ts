import { Router } from "express";

import { middlewares } from "../middlewares/isAuthenticated";
import { AuthController } from "../controller/auth.controller";
import {
  loginRateLimiter,
  passwordResetRequestLimiter,
  registrationRateLimiter,
  resendVerificationLimiter,
  skipRatelimiterForDevelopment,
  verificationRateLimiter,
} from "../utils/rateLimiter";

const authRouter = Router();
const authcontroller = new AuthController();

authRouter.post(
  "/mee",
  middlewares.isAuthenticated,
  authcontroller.getCurrentUser,
);

authRouter.post("/logout", authcontroller.logout);

authRouter.post(
  "/refresh",
  middlewares.refreshAccessToken,
  authcontroller.refresh,
);

authRouter.post(
  "/login",
  skipRatelimiterForDevelopment(loginRateLimiter),
  authcontroller.loginUser,
);
authRouter.post(
  "/register",
  skipRatelimiterForDevelopment(registrationRateLimiter),
  authcontroller.createUser,
);

authRouter.post(
  "/forgot-password",
  passwordResetRequestLimiter,
  authcontroller.forgotPassword,
);
authRouter.post(
  "/reset-password",
  verificationRateLimiter,
  authcontroller.resetPassword,
);

authRouter.post(
  "/verify-email",
  verificationRateLimiter,
  middlewares.isAuthenticated,
  authcontroller.verifyEmail,
);
authRouter.post(
  "/send-verification",
  resendVerificationLimiter,
  middlewares.isAuthenticated,
  authcontroller.sendVerification,
);

authRouter.post(
  "/verify-reset-code",
  verificationRateLimiter,
  authcontroller.verifyResetCode,
);

export default authRouter;
