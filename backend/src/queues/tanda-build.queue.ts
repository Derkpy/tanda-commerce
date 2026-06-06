import Bull, { type Queue } from "bull";
import { env } from "../config/env.js";
import type { AuthUser } from "../types/auth.js";
import type { BuildSaleInput } from "../modules/sales/sale.schema.js";

export type TandaBuildJobData = {
  auth: AuthUser;
  input: BuildSaleInput;
};

let tandaBuildQueue: Queue<TandaBuildJobData> | null = null;

export const getTandaBuildQueue = () => {
  if (!tandaBuildQueue) {
    tandaBuildQueue = new Bull<TandaBuildJobData>("tanda-build", env.REDIS_URL, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          delay: 1000,
          type: "exponential",
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
      settings: {
        stalledInterval: 30_000,
      },
    });
  }

  return tandaBuildQueue;
};

export const closeTandaBuildQueue = async () => {
  if (!tandaBuildQueue) {
    return;
  }

  await tandaBuildQueue.close();
  tandaBuildQueue = null;
};
