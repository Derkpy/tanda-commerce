import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../config/prisma.js";
import { disconnectDatabase, resetDatabase } from "./test-db.js";

let app: ReturnType<typeof createApp>;
const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "true"
  ? describe
  : describe.skip;

const createAuthenticatedSession = async () => {
  const branch = await prisma.branch.create({
    data: {
      localitation: "Centro",
      name: "Sucursal Centro",
    },
  });

  const passwordHash = await argon2.hash("password123");
  await prisma.user.create({
    data: {
      email: "inventory-user@example.com",
      idBranch: branch.idBranch,
      name: "Inventory User",
      passwordHash,
      role: "admin",
      status: "active",
      username: "inventory-user",
    },
  });

  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({
    identifier: "inventory-user",
    password: "password123",
  });

  return {
    agent,
    branch,
  };
};

describeIntegration("inventory integration", () => {
  beforeEach(async () => {
    await resetDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("elimina productos relacionados al eliminar una categoria", async () => {
    const { agent, branch } = await createAuthenticatedSession();
    const group = await prisma.productGroup.create({
      data: {
        groupName: "Moda",
        idBranch: branch.idBranch,
      },
    });
    const category = await prisma.category.create({
      data: {
        categoryName: "Blusas",
        code: "cat-001",
        idGroup: group.idGroup,
      },
    });
    await prisma.product.create({
      data: {
        code: "prod-001",
        idCategory: category.idCategory,
        nameProducts: "Blusa negra",
        priceProduct: "299.90",
      },
    });

    const response = await agent.delete(`/api/categories/${category.idCategory}`);

    expect(response.status).toBe(204);
    expect(await prisma.category.count()).toBe(0);
    expect(await prisma.product.count()).toBe(0);
  });

  it("elimina categorias y productos relacionados al eliminar un grupo", async () => {
    const { agent, branch } = await createAuthenticatedSession();
    const group = await prisma.productGroup.create({
      data: {
        groupName: "Moda",
        idBranch: branch.idBranch,
      },
    });
    const category = await prisma.category.create({
      data: {
        categoryName: "Blusas",
        code: "cat-001",
        idGroup: group.idGroup,
      },
    });
    await prisma.product.create({
      data: {
        code: "prod-001",
        idCategory: category.idCategory,
        nameProducts: "Blusa negra",
        priceProduct: null,
      },
    });

    const response = await agent.delete(`/api/groups/${group.idGroup}`);

    expect(response.status).toBe(204);
    expect(await prisma.productGroup.count()).toBe(0);
    expect(await prisma.category.count()).toBe(0);
    expect(await prisma.product.count()).toBe(0);
  });
});
