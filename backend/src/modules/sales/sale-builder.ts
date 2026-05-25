import { ApiError } from "../../errors/api-error.js";

const centsPerUnit = 100;

export type SaleBuilderProduct = {
  idProduct: number;
  code: string;
  quantity: number;
  unitPriceCents: number;
};

export type SaleBuilderInput = {
  clientId: number;
  branchId: number;
  products: SaleBuilderProduct[];
  paymentCount: number;
  paymentIntervalDays: number;
  firstPaymentDate: string;
};

export type SaleBuilderPayment = {
  paymentNumber: number;
  paymentDate: string;
  paymentTotalCents: number;
};

export type SaleBuilderOutput = {
  clientId: number;
  branchId: number;
  totalCents: number;
  total: string;
  saleDetails: Array<{
    idProduct: number;
    quantity: number;
    priceCents: number;
    price: string;
  }>;
  tanda: {
    dateStart: string;
    dateEnd: string;
    status: string;
    totalCents: number;
    total: string;
  };
  payments: Array<
    SaleBuilderPayment & {
      status: string;
      paymentTotal: string;
      paymentTandaTotal: string;
    }
  >;
};

export class SaleBuilder {
  private readonly input: SaleBuilderInput;

  constructor(input: SaleBuilderInput) {
    this.input = input;
  }

  build(): SaleBuilderOutput {
    this.validate();

    const totalCents = this.input.products.reduce((total, product) => {
      return total + product.unitPriceCents * product.quantity;
    }, 0);

    const payments = this.buildPayments(totalCents);
    const dateStart = payments[0]?.paymentDate;
    const dateEnd = payments[payments.length - 1]?.paymentDate;

    if (!dateStart || !dateEnd) {
      throw new ApiError(400, "Payment schedule could not be generated");
    }

    return {
      clientId: this.input.clientId,
      branchId: this.input.branchId,
      totalCents,
      total: formatCents(totalCents),
      saleDetails: this.input.products.map((product) => ({
        idProduct: product.idProduct,
        quantity: product.quantity,
        priceCents: product.unitPriceCents,
        price: formatCents(product.unitPriceCents),
      })),
      tanda: {
        dateStart,
        dateEnd,
        status: "pending",
        totalCents,
        total: formatCents(totalCents),
      },
      payments: payments.map((payment) => ({
        ...payment,
        status: "pending",
        paymentTotal: formatCents(payment.paymentTotalCents),
        paymentTandaTotal: formatCents(totalCents),
      })),
    };
  }

  private validate(): void {
    if (this.input.products.length === 0) {
      throw new ApiError(400, "At least one product is required");
    }

    if (this.input.paymentCount < 1) {
      throw new ApiError(400, "Payment count must be at least 1");
    }

    if (
      this.input.paymentIntervalDays < 3 ||
      this.input.paymentIntervalDays > 15
    ) {
      throw new ApiError(400, "Payment interval must be between 3 and 15 days");
    }

    const firstPaymentDate = parseDateOnly(this.input.firstPaymentDate);
    const today = currentLocalDateAsUtcDate();

    if (firstPaymentDate < today) {
      throw new ApiError(400, "First payment date cannot be in the past");
    }

    for (const product of this.input.products) {
      if (product.quantity < 1) {
        throw new ApiError(400, "Product quantity must be at least 1");
      }

      if (product.unitPriceCents < 1) {
        throw new ApiError(400, "Product price must be greater than 0");
      }
    }
  }

  private buildPayments(totalCents: number): SaleBuilderPayment[] {
    const basePaymentCents = Math.floor(totalCents / this.input.paymentCount);
    const remainderCents = totalCents % this.input.paymentCount;
    const firstPaymentDate = parseDateOnly(this.input.firstPaymentDate);

    return Array.from({ length: this.input.paymentCount }, (_, index) => {
      const paymentDate = addUtcDays(
        firstPaymentDate,
        index * this.input.paymentIntervalDays,
      );

      return {
        paymentNumber: index + 1,
        paymentDate: toDateOnlyString(paymentDate),
        paymentTotalCents:
          index === this.input.paymentCount - 1
            ? basePaymentCents + remainderCents
            : basePaymentCents,
      };
    });
  }
}

export const parseMoneyToCents = (value: number | string): number => {
  const stringValue = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(stringValue)) {
    throw new ApiError(400, "Invalid money value");
  }

  const [whole, decimals = ""] = stringValue.split(".");
  return Number(whole) * centsPerUnit + Number(decimals.padEnd(2, "0"));
};

export const formatCents = (cents: number): string => {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / centsPerUnit);
  const decimals = String(absolute % centsPerUnit).padStart(2, "0");
  return `${sign}${whole}.${decimals}`;
};

export const parseDateOnly = (date: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, "Date must use YYYY-MM-DD format");
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "Invalid date");
  }

  return parsed;
};

const currentLocalDateAsUtcDate = (): Date => {
  const today = new Date();
  return new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );
};

const addUtcDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

export const toDateOnlyString = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};
