import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { validateBody } from "../../middleware/validate.js";
import { authController } from "./auth.controller.js";
import {
  authLoginRateLimiter,
  authRefreshRateLimiter,
} from "./auth.rate-limit.js";
import { loginBodySchema } from "./auth.schema.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  authLoginRateLimiter,
  validateBody(loginBodySchema),
  asyncHandler(authController.login),
);

authRouter.get("/me", authMiddleware, asyncHandler(authController.me));

authRouter.post(
  "/refresh",
  authRefreshRateLimiter,
  asyncHandler(authController.refresh),
);

authRouter.post("/logout", asyncHandler(authController.logout));
