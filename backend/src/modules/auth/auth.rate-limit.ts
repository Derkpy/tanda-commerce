import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";

export const createAuthLoginRateLimiter = () =>
  rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    limit: env.AUTH_LOGIN_RATE_LIMIT_MAX,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many login attempts" },
  });

export const createAuthRefreshRateLimiter = () =>
  rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    limit: env.AUTH_REFRESH_RATE_LIMIT_MAX,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many refresh attempts" },
  });
