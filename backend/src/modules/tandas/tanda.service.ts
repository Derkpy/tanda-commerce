import { prisma } from "../../config/prisma.js";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";
import { getTandaBuildQueue } from "../../queues/tanda-build.queue.js";
import type { BuildSaleInput } from "../sales/sale.schema.js";

export const tandaService = {
  list(auth: AuthUser) {
    return prisma.tanda.findMany({
      where: {
        sale: {
          idBranch: auth.idBranch,
        },
      },
      orderBy: { idTanda: "asc" },
      include: {
        payments: {
          select: { idPaymentTanda: true },
          orderBy: { idPaymentTanda: "asc" },
        },
      },
    });
  },

  async build(input: BuildSaleInput, auth: AuthUser) {
    try {
      const job = await getTandaBuildQueue().add("create-tanda", {
        auth,
        input,
      });

      return {
        jobId: String(job.id),
        status: "queued",
      };
    } catch (error) {
      logger.error({ err: error }, "Could not enqueue tanda builder job");
      throw new ApiError(503, "Tanda builder worker queue unavailable");
    }
  },
};
