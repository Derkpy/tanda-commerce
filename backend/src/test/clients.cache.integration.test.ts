import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { redisCache } from "../config/redis.js";
import { prisma } from "../config/prisma.js";
import { disconnectDatabase, resetDatabase } from "./test-db.js";

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "true"
  ? describe
  : describe.skip;
const itWithRedis = process.env.REDIS_INTEGRATION === "true" ? it : it.skip;

let app: ReturnType<typeof createApp>;

const createAuthenticatedSession = async () => {
  const branch = await prisma.branch.create({
    data: {
      localitation: "Centro",
      name: "Sucursal Centro",
    },
  });

  const passwordHash = await argon2.hash("password123");
  const user = await prisma.user.create({
    data: {
      email: "cache-user@example.com",
      idBranch: branch.idBranch,
      name: "Cache User",
      passwordHash,
      role: "admin",
      status: "active",
      username: "cache-user",
    },
  });

  await prisma.client.create({
    data: {
      idBranch: branch.idBranch,
      name: "Cliente Inicial",
      statusGlobal: "regular",
      statusSingular: "activo",
    },
  });

  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({
    identifier: "cache-user",
    password: "password123",
  });

  return {
    agent,
    branch,
    user,
  };
};

describeIntegration("clients cache integration", () => {
  beforeEach(async () => {
    await resetDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  itWithRedis("cachea GET /api/clients y lo invalida despues de un POST", async () => {
    const { agent, branch, user } = await createAuthenticatedSession();

    const firstResponse = await agent.get("/api/clients");

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body).toHaveLength(1);

    const cacheKey = `cache:/api/clients:branch:${branch.idBranch}:user:${user.idUser}`;
    expect(await redisCache.get(cacheKey)).not.toBeNull();

    await prisma.client.create({
      data: {
        idBranch: branch.idBranch,
        name: "Cliente Sin Invalidar",
        statusGlobal: "regular",
        statusSingular: "activo",
      },
    });

    const cachedResponse = await agent.get("/api/clients");

    expect(cachedResponse.status).toBe(200);
    expect(cachedResponse.body).toHaveLength(1);

    await agent.post("/api/clients").send({
      name: "Cliente Nuevo",
      statusGlobal: "excelente",
      statusSingular: "activo",
    });

    const refreshedResponse = await agent.get("/api/clients");

    expect(refreshedResponse.status).toBe(200);
    expect(refreshedResponse.body).toHaveLength(3);
    expect(refreshedResponse.body.map((client: { name: string }) => client.name)).toEqual([
      "Cliente Inicial",
      "Cliente Sin Invalidar",
      "Cliente Nuevo",
    ]);
  });
});
