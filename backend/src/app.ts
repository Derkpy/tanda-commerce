import compression from "compression";
import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createApiRouter } from "./routes/index.js";

const allowedOrigins = new Set([
  env.FRONTEND_URL,
  ...env.CORS_ORIGINS,
]);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204,
};

export const createApp = () => {
  const app = express();
  const apiRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests" },
  });

  app.disable("x-powered-by");
  app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(pinoHttp({ logger }));
  app.use(compression());
  app.use("/api", apiRateLimiter);
  app.use(cookieParser());
  app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", createApiRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
