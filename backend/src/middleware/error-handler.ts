import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../errors/api-error.js";

const isProduction = env.NODE_ENV === "production";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      ...(isProduction ? {} : { details: error.issues }),
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: error.message,
      ...(isProduction || error.details === undefined
        ? {}
        : { details: error.details }),
    });
    return;
  }

  logger.error({ error }, "Unhandled error");

  res.status(500).json({
    error:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : error instanceof Error
          ? error.message
          : "Unknown error",
  });
};
