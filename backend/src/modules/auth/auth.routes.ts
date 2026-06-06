import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { validateBody } from "../../middleware/validate.js";
import { authController } from "./auth.controller.js";
import {
  createAuthLoginRateLimiter,
  createAuthRefreshRateLimiter,
} from "./auth.rate-limit.js";
import { loginBodySchema } from "./auth.schema.js";

export const createAuthRouter = () => {
  const authRouter = Router();

  authRouter.post(
    "/login",
    createAuthLoginRateLimiter(),
    validateBody(loginBodySchema),
    asyncHandler(authController.login),
  );

  authRouter.get("/me", authMiddleware, asyncHandler(authController.me));

  authRouter.post(
    "/refresh",
    createAuthRefreshRateLimiter(),
    asyncHandler(authController.refresh),
  );

  authRouter.post("/logout", asyncHandler(authController.logout));

  return authRouter;
};
