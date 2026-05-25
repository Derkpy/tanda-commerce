import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../config/prisma.js";
import { disconnectDatabase, resetDatabase } from "./test-db.js";

const firstPaymentDate = "2099-07-02";
let app: ReturnType<typeof createApp>;
const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "true"
  ? describe
  : describe.skip;

const loginAsBranchUser = async () => {
  const branch = await prisma.branch.create({
    data: {
      localitation: "Centro",
      name: "Sucursal Centro",
    },
  });

  const branchTwo = await prisma.branch.create({
    data: {
      localitation: "Norte",
      name: "Sucursal Norte",
    },
  });

  const passwordHash = await argon2.hash("password123");
  await prisma.user.create({
    data: {
      email: "builder@example.com",
      idBranch: branch.idBranch,
      name: "Builder User",
      passwordHash,
      role: "admin",
      status: "active",
      username: "builder-user",
    },
  });

  const client = await prisma.client.create({
    data: {
      idBranch: branch.idBranch,
      name: "Cliente Uno",
      statusGlobal: "regular",
      statusSingular: "activo",
    },
  });

  const group = await prisma.productGroup.create({
    data: {
      groupName: "Ropa",
      idBranch: branch.idBranch,
    },
  });

  const otherGroup = await prisma.productGroup.create({
    data: {
      groupName: "Ropa Norte",
      idBranch: branchTwo.idBranch,
    },
  });

  const category = await prisma.category.create({
    data: {
      categoryName: "Blusas",
      code: "BLU",
      idGroup: group.idGroup,
    },
  });

  const otherCategory = await prisma.category.create({
    data: {
      categoryName: "Pantalones",
      code: "PAN",
      idGroup: otherGroup.idGroup,
    },
  });

  const fixedPriceProduct = await prisma.product.create({
    data: {
      code: "BLU-1",
      idCategory: category.idCategory,
      nameProducts: "Blusa Lisa",
      priceProduct: "50.00",
    },
  });

  const manualPriceProduct = await prisma.product.create({
    data: {
      code: "BLU-2",
      idCategory: category.idCategory,
      nameProducts: "Blusa Especial",
      priceProduct: null,
    },
  });

  const otherBranchProduct = await prisma.product.create({
    data: {
      code: "PAN-1",
      idCategory: otherCategory.idCategory,
      nameProducts: "Pantalon Norte",
      priceProduct: "99.00",
    },
  });

  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({
    identifier: "builder-user",
    password: "password123",
  });

  return {
    agent,
    client,
    fixedPriceProduct,
    manualPriceProduct,
    otherBranchProduct,
  };
};

describeIntegration("sales builder integration", () => {
  beforeEach(async () => {
    await resetDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("previsualiza una venta usando precio fijo y manual", async () => {
    const { agent, client } = await loginAsBranchUser();

    const response = await agent.post("/api/sales/build/preview").send({
      clientId: client.idClient,
      firstPaymentDate,
      paymentCount: 3,
      paymentIntervalDays: 7,
      products: [
        { code: "BLU-1", price: 999.99, quantity: 1 },
        { code: "BLU-2", price: 50.01, quantity: 1 },
      ],
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe("100.01");
    expect(response.body.payments.map((payment: { paymentTotal: string }) => payment.paymentTotal)).toEqual([
      "33.33",
      "33.33",
      "33.35",
    ]);
    expect(await prisma.sale.count()).toBe(0);
  });

  it("requiere precio manual cuando el producto no tiene precio fijo", async () => {
    const { agent, client } = await loginAsBranchUser();

    const response = await agent.post("/api/sales/build/preview").send({
      clientId: client.idClient,
      firstPaymentDate,
      paymentCount: 2,
      paymentIntervalDays: 7,
      products: [{ code: "BLU-2", quantity: 1 }],
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Product requires a manual price: BLU-2");
  });

  it("rechaza productos de otra sucursal", async () => {
    const { agent, client, otherBranchProduct } = await loginAsBranchUser();

    const response = await agent.post("/api/sales/build/preview").send({
      clientId: client.idClient,
      firstPaymentDate,
      paymentCount: 2,
      paymentIntervalDays: 7,
      products: [{ code: otherBranchProduct.code, quantity: 1 }],
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(`Product not found: ${otherBranchProduct.code}`);
  });

  it("persiste sales, sale_details, tanda y payment_tanda en una transaccion", async () => {
    const { agent, client } = await loginAsBranchUser();

    const response = await agent.post("/api/sales/build").send({
      clientId: client.idClient,
      firstPaymentDate,
      paymentCount: 3,
      paymentIntervalDays: 5,
      products: [
        { code: "BLU-1", quantity: 2 },
        { code: "BLU-2", price: 20.00, quantity: 1 },
      ],
    });

    expect(response.status).toBe(201);

    const sale = await prisma.sale.findFirstOrThrow({
      include: {
        details: true,
        tanda: {
          include: {
            payments: true,
          },
        },
      },
    });

    expect(sale.total.toString()).toBe("120");
    expect(sale.details).toHaveLength(2);
    expect(sale.details.map((detail) => detail.price.toString())).toEqual([
      "50",
      "20",
    ]);
    expect(sale.tanda?.dateStart.toISOString().slice(0, 10)).toBe(firstPaymentDate);
    expect(sale.tanda?.dateEnd.toISOString().slice(0, 10)).toBe("2099-07-12");
    expect(sale.tanda?.payments).toHaveLength(3);
    expect(
      sale.tanda?.payments.map((payment) =>
        payment.paymentDate.toISOString().slice(0, 10),
      ),
    ).toEqual(["2099-07-02", "2099-07-07", "2099-07-12"]);
    expect(
      sale.tanda?.payments.map((payment) => payment.paymentTotal.toString()),
    ).toEqual(["40", "40", "40"]);
  });
});
