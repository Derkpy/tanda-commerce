import { redisCache } from "../config/redis.js";
import { prisma } from "../config/prisma.js";

const tablesToTruncate = [
  "refresh_token",
  "payment_tanda",
  "tanda",
  "sale_details",
  "sales",
  "products",
  "category",
  "\"group\"",
  "client",
  "users",
  "branch",
];

export const resetDatabase = async (): Promise<void> => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tablesToTruncate.join(", ")} RESTART IDENTITY CASCADE;`,
  );
  await redisCache.delByPrefix("cache:");
};

export const disconnectDatabase = async (): Promise<void> => {
  await redisCache.disconnect();
  await prisma.$disconnect();
};
