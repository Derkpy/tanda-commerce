import argon2 from "argon2";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { disconnectDatabase, resetDatabase } from "./test-db.js";

let app: ReturnType<typeof createApp>;
const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "true"
  ? describe
  : describe.skip;

const createUser = async (status = "active") => {
  const branch = await prisma.branch.create({
    data: {
      localitation: "Centro",
      name: "Sucursal Centro",
    },
  });

  const passwordHash = await argon2.hash("password123");
  const user = await prisma.user.create({
    data: {
      email: `user-${status}@example.com`,
      idBranch: branch.idBranch,
      name: "Derek",
      passwordHash,
      role: "admin",
      status,
      username: `user-${status}`,
    },
  });

  return { branch, user };
};

describeIntegration("auth integration", () => {
  beforeEach(async () => {
    await resetDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("inicia sesion, devuelve user publico y setea cookies httpOnly", async () => {
    await createUser();

    const response = await request(app).post("/api/auth/login").send({
      identifier: "user-active",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      email: "user-active@example.com",
      name: "Derek",
      username: "user-active",
    });
    expect(response.body.user.passwordHash).toBeUndefined();

    const setCookieHeader = toCookieArray(response.headers["set-cookie"]);
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader.join(";")).toContain("HttpOnly");
    expect(setCookieHeader.join(";")).toContain("SameSite=Lax");
    expect(setCookieHeader.join(";")).not.toContain("Secure");
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("rechaza password incorrecta", async () => {
    await createUser();

    const response = await request(app).post("/api/auth/login").send({
      identifier: "user-active",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });

  it("rechaza usuarios inactivos", async () => {
    await createUser("inactive");

    const response = await request(app).post("/api/auth/login").send({
      identifier: "user-inactive",
      password: "password123",
    });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("User is inactive");
  });

  it("devuelve la sesion actual con /api/auth/me", async () => {
    await createUser();
    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      identifier: "user-active",
      password: "password123",
    });

    const response = await agent.get("/api/auth/me");

    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe("user-active");
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("protege rutas sin cookie de acceso", async () => {
    const response = await request(app).get("/api/clients");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Authentication required");
  });

  it("rechaza access token invalido o expirado", async () => {
    const expiredToken = jwt.sign(
      {
        idBranch: 1,
        idUser: 9,
        role: "admin",
        type: "access",
      },
      env.JWT_ACCESS_SECRET,
      {
        algorithm: "HS256",
        expiresIn: -1,
      },
    );

    const response = await request(app)
      .get("/api/clients")
      .set("Cookie", [`accessToken=${expiredToken}`]);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid or expired token");
  });

  it("bloquea rutas protegidas cuando el usuario queda inactivo despues del login", async () => {
    const { user } = await createUser();
    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      identifier: "user-active",
      password: "password123",
    });

    await prisma.user.update({
      where: { idUser: user.idUser },
      data: { status: "inactive" },
    });

    const response = await agent.get("/api/clients");

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("User is inactive");
  });

  it("aplica rate limit al login", async () => {
    await createUser();

    let response = await request(app).post("/api/auth/login").send({
      identifier: "user-active",
      password: "wrong-password",
    });

    for (let index = 0; index < 20; index += 1) {
      response = await request(app).post("/api/auth/login").send({
        identifier: "user-active",
        password: "wrong-password",
      });
    }

    expect(response.status).toBe(429);
    expect(response.body.error).toBe("Too many login attempts");
  });

  it("rota el refresh token y revoca el anterior", async () => {
    await createUser();
    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      identifier: "user-active",
      password: "password123",
    });

    const response = await agent.post("/api/auth/refresh").send();

    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe("user-active");
    expect(toCookieArray(response.headers["set-cookie"]).join(";")).toContain(
      "refreshToken=",
    );

    const tokens = await prisma.refreshToken.findMany({
      orderBy: { idRefreshToken: "asc" },
    });

    expect(tokens).toHaveLength(2);
    expect(tokens.filter((token) => token.revokedAt === null)).toHaveLength(1);
    expect(tokens.filter((token) => token.revokedAt !== null)).toHaveLength(1);
  });

  it("rechaza refresh token invalido", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", ["refreshToken=invalid-token"]);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid or expired refresh token");
    expect(toCookieArray(response.headers["set-cookie"]).join(";")).toContain(
      "refreshToken=;",
    );
  });

  it("revoca la sesion en logout y limpia cookies", async () => {
    await createUser();
    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      identifier: "user-active",
      password: "password123",
    });

    const logoutResponse = await agent.post("/api/auth/logout").send();

    expect(logoutResponse.status).toBe(204);
    expect(
      toCookieArray(logoutResponse.headers["set-cookie"]).join(";"),
    ).toContain("accessToken=;");
    expect(
      toCookieArray(logoutResponse.headers["set-cookie"]).join(";"),
    ).toContain("refreshToken=;");

    const activeTokenCount = await prisma.refreshToken.count({
      where: { revokedAt: null },
    });

    expect(activeTokenCount).toBe(0);

    const meResponse = await agent.get("/api/auth/me");
    expect(meResponse.status).toBe(401);
  });

  it("bloquea refresh para usuarios que quedaron inactivos", async () => {
    const { user } = await createUser();
    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      identifier: "user-active",
      password: "password123",
    });

    await prisma.user.update({
      where: { idUser: user.idUser },
      data: { status: "inactive" },
    });

    const response = await agent.post("/api/auth/refresh").send();

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("User is inactive");

    const activeTokenCount = await prisma.refreshToken.count({
      where: { revokedAt: null },
    });

    expect(activeTokenCount).toBe(0);
  });

  it("valida el payload de login", async () => {
    const response = await request(app).post("/api/auth/login").send({
      identifier: "",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation error");
  });
});

const toCookieArray = (header: string[] | string | undefined): string[] => {
  if (!header) {
    return [];
  }

  return Array.isArray(header) ? header : [header];
};
