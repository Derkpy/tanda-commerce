import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { z } from "zod";

const seedEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SEED_ADMIN_BRANCH_LOCALITATION: z.string().trim().min(1).default("Matriz"),
  SEED_ADMIN_BRANCH_NAME: z.string().trim().min(1).default("Sucursal Principal"),
  SEED_ADMIN_EMAIL: z.string().trim().email().default("admin@systemtandas.local"),
  SEED_ADMIN_NAME: z.string().trim().min(1).default("Administrador Principal"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe12345!"),
  SEED_ADMIN_PHONE: z.string().trim().min(1).default("0000000000"),
  SEED_ADMIN_ROLE: z.string().trim().min(1).default("admin"),
  SEED_ADMIN_STATUS: z.string().trim().min(1).default("active"),
  SEED_ADMIN_USERNAME: z.string().trim().min(3).default("admin"),
});

const env = seedEnvSchema.parse(process.env);

if (env.NODE_ENV === "production") {
  throw new Error("The seed script cannot run in production");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: env.DATABASE_URL,
  }),
});

async function main() {
  const passwordHash = await argon2.hash(env.SEED_ADMIN_PASSWORD);

  const branch =
    (await prisma.branch.findFirst({
      where: {
        localitation: env.SEED_ADMIN_BRANCH_LOCALITATION,
        name: env.SEED_ADMIN_BRANCH_NAME,
      },
    })) ??
    (await prisma.branch.create({
      data: {
        localitation: env.SEED_ADMIN_BRANCH_LOCALITATION,
        name: env.SEED_ADMIN_BRANCH_NAME,
      },
    }));

  const user = await prisma.user.upsert({
    where: {
      email: env.SEED_ADMIN_EMAIL,
    },
    update: {
      idBranch: branch.idBranch,
      name: env.SEED_ADMIN_NAME,
      passwordHash,
      phone: env.SEED_ADMIN_PHONE,
      role: env.SEED_ADMIN_ROLE,
      status: env.SEED_ADMIN_STATUS,
      username: env.SEED_ADMIN_USERNAME,
    },
    create: {
      idBranch: branch.idBranch,
      email: env.SEED_ADMIN_EMAIL,
      name: env.SEED_ADMIN_NAME,
      passwordHash,
      phone: env.SEED_ADMIN_PHONE,
      role: env.SEED_ADMIN_ROLE,
      status: env.SEED_ADMIN_STATUS,
      username: env.SEED_ADMIN_USERNAME,
    },
    select: {
      branch: {
        select: {
          idBranch: true,
          localitation: true,
          name: true,
        },
      },
      email: true,
      idUser: true,
      username: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        branch,
        user,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
