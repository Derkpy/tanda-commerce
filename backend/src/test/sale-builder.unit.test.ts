import { describe, expect, it } from "vitest";
import { ApiError } from "../errors/api-error.js";
import {
  parseMoneyToCents,
  SaleBuilder,
} from "../modules/sales/sale-builder.js";

describe("SaleBuilder", () => {
  it("genera fechas y reparte centavos sobrantes en el ultimo pago", () => {
    const result = new SaleBuilder({
      branchId: 1,
      clientId: 1,
      firstPaymentDate: "2099-07-02",
      paymentCount: 3,
      paymentIntervalDays: 7,
      products: [
        {
          code: "BLU-1",
          idProduct: 1,
          quantity: 1,
          unitPriceCents: 10_001,
        },
      ],
    }).build();

    expect(result.total).toBe("100.01");
    expect(result.payments.map((payment) => payment.paymentDate)).toEqual([
      "2099-07-02",
      "2099-07-09",
      "2099-07-16",
    ]);
    expect(result.payments.map((payment) => payment.paymentTotal)).toEqual([
      "33.33",
      "33.33",
      "33.35",
    ]);
  });

  it("multiplica cantidad por precio para los detalles", () => {
    const result = new SaleBuilder({
      branchId: 1,
      clientId: 1,
      firstPaymentDate: "2099-07-02",
      paymentCount: 2,
      paymentIntervalDays: 5,
      products: [
        {
          code: "TEN-1",
          idProduct: 3,
          quantity: 2,
          unitPriceCents: 5_000,
        },
        {
          code: "BOL-2",
          idProduct: 4,
          quantity: 1,
          unitPriceCents: 2_500,
        },
      ],
    }).build();

    expect(result.total).toBe("125.00");
    expect(result.saleDetails).toEqual([
      {
        idProduct: 3,
        price: "50.00",
        priceCents: 5_000,
        quantity: 2,
      },
      {
        idProduct: 4,
        price: "25.00",
        priceCents: 2_500,
        quantity: 1,
      },
    ]);
  });

  it("rechaza fechas de primer pago en el pasado", () => {
    expect(
      () =>
        new SaleBuilder({
          branchId: 1,
          clientId: 1,
          firstPaymentDate: "2000-01-01",
          paymentCount: 2,
          paymentIntervalDays: 7,
          products: [
            {
              code: "BLU-1",
              idProduct: 1,
              quantity: 1,
              unitPriceCents: 5_000,
            },
          ],
        }).build(),
    ).toThrowError(new ApiError(400, "First payment date cannot be in the past"));
  });

  it("rechaza intervalos fuera de 3 a 15 dias", () => {
    expect(
      () =>
        new SaleBuilder({
          branchId: 1,
          clientId: 1,
          firstPaymentDate: "2099-07-02",
          paymentCount: 2,
          paymentIntervalDays: 2,
          products: [
            {
              code: "BLU-1",
              idProduct: 1,
              quantity: 1,
              unitPriceCents: 5_000,
            },
          ],
        }).build(),
    ).toThrowError(
      new ApiError(400, "Payment interval must be between 3 and 15 days"),
    );
  });

  it("valida el formato monetario", () => {
    expect(() => parseMoneyToCents("12.345")).toThrowError(
      new ApiError(400, "Invalid money value"),
    );
  });
});
