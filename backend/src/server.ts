import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./config/prisma.js";
import { redisCache } from "./config/redis.js";
import { closeTandaBuildQueue } from "./queues/tanda-build.queue.js";
import { createApp } from "./app.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Backend server listening");
});

let isShuttingDown = false;

const shutdown = (signal: NodeJS.Signals) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, "Closing backend server");

  server.close(async (error) => {
    if (error) {
      logger.error({ error }, "Backend server shutdown failed");
      process.exitCode = 1;
    }

    await Promise.allSettled([
      closeTandaBuildQueue(),
      redisCache.disconnect(),
      prisma.$disconnect(),
    ]);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
