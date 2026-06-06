import { logger } from "../config/logger.js";
import { saleService } from "../modules/sales/sale.service.js";
import { closeTandaBuildQueue, getTandaBuildQueue } from "../queues/tanda-build.queue.js";

const queue = getTandaBuildQueue();

queue.process("create-tanda", 3, async (job) => {
  logger.info({ jobId: job.id }, "Processing tanda builder job");

  const sale = await saleService.build(job.data.input, job.data.auth);
  await job.progress(100);

  return {
    idSales: sale.idSales,
    idTanda: sale.tanda?.idTanda,
  };
});

queue.on("completed", (job, result) => {
  logger.info({ jobId: job.id, result }, "Tanda builder job completed");
});

queue.on("failed", (job, error) => {
  logger.error({ err: error, jobId: job?.id }, "Tanda builder job failed");
});

const shutdown = async () => {
  logger.info("Closing tanda builder worker");
  await closeTandaBuildQueue();
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown();
});

process.on("SIGINT", () => {
  void shutdown();
});
