import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import { invalidateCache } from "../../middleware/cache.js";
import {
  parseDateOnly,
  parseMoneyToCents,
  SaleBuilder,
  type SaleBuilderInput,
} from "./sale-builder.js";
import type { BuildSaleInput } from "./sale.schema.js";

export type AuthContext = {
  idUser: number;
  idBranch: number;
  role: string;
};

export const saleService = {
  list(auth: AuthContext) {
    return prisma.sale.findMany({
      where: {
        idBranch: auth.idBranch,
      },
      orderBy: { idSales: "asc" },
      include: {
        details: {
          orderBy: { idSaleDetails: "asc" },
        },
      },
    });
  },

  async findById(id: number, auth: AuthContext) {
    const sale = await prisma.sale.findUnique({
      where: { idSales: id },
      include: {
        details: {
          select: { idSaleDetails: true },
          orderBy: { idSaleDetails: "asc" },
        },
      },
    });

    if (!sale) {
      throw new ApiError(404, "Sale not found");
    }

    if (sale.idBranch !== auth.idBranch) {
      throw new ApiError(404, "Sale not found");
    }

    return sale;
  },

  async previewBuild(input: BuildSaleInput, auth: AuthContext) {
    return new SaleBuilder(await resolveBuilderInput(input, auth)).build();
  },

  async build(input: BuildSaleInput, auth: AuthContext) {
    const builtSale = new SaleBuilder(
      await resolveBuilderInput(input, auth),
    ).build();

    const sale = await prisma.$transaction(async (tx) => {
      const createdSale = await tx.sale.create({
        data: {
          idClient: builtSale.clientId,
          idBranch: builtSale.branchId,
          total: builtSale.total,
          date: currentDateOnly(),
        },
      });

      await tx.saleDetail.createMany({
        data: builtSale.saleDetails.map((detail) => ({
          idSale: createdSale.idSales,
          idProduct: detail.idProduct,
          quantity: detail.quantity,
          price: detail.price,
        })),
      });

      const createdTanda = await tx.tanda.create({
        data: {
          idSale: createdSale.idSales,
          idClient: builtSale.clientId,
          dateStart: parseDateOnly(builtSale.tanda.dateStart),
          dateEnd: parseDateOnly(builtSale.tanda.dateEnd),
          status: builtSale.tanda.status,
          total: builtSale.tanda.total,
        },
      });

      await tx.paymentTanda.createMany({
        data: builtSale.payments.map((payment) => ({
          idTanda: createdTanda.idTanda,
          status: payment.status,
          paymentDate: parseDateOnly(payment.paymentDate),
          paymentTotal: payment.paymentTotal,
          paymentTandaTotal: payment.paymentTandaTotal,
        })),
      });

      return tx.sale.findUniqueOrThrow({
        where: { idSales: createdSale.idSales },
        include: {
          details: {
            orderBy: { idSaleDetails: "asc" },
          },
          tanda: {
            include: {
              payments: {
                orderBy: { idPaymentTanda: "asc" },
              },
            },
          },
        },
      });
    });

    await invalidateCache([
      "cache:/api/sales",
      "cache:/api/tandas",
      "cache:/api/clients",
    ]);

    return sale;
  },
};

const resolveBuilderInput = async (
  input: BuildSaleInput,
  auth: AuthContext,
): Promise<SaleBuilderInput> => {
  const client = await prisma.client.findFirst({
    where: {
      idClient: input.clientId,
      idBranch: auth.idBranch,
    },
    select: {
      idClient: true,
    },
  });

  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  const codes = [...new Set(input.products.map((product) => product.code))];
  const products = await prisma.product.findMany({
    where: {
      code: {
        in: codes,
      },
      category: {
        group: {
          idBranch: auth.idBranch,
        },
      },
    },
    select: {
      idProduct: true,
      code: true,
      priceProduct: true,
    },
  });
  const productsByCode = new Map(
    products.map((product) => [product.code, product]),
  );

  return {
    clientId: input.clientId,
    branchId: auth.idBranch,
    paymentCount: input.paymentCount,
    paymentIntervalDays: input.paymentIntervalDays,
    firstPaymentDate: input.firstPaymentDate,
    products: input.products.map((requestedProduct) => {
      const product = productsByCode.get(requestedProduct.code);

      if (!product) {
        throw new ApiError(404, `Product not found: ${requestedProduct.code}`);
      }

      const price =
        product.priceProduct !== null
          ? product.priceProduct.toString()
          : requestedProduct.price;

      if (price === undefined) {
        throw new ApiError(
          400,
          `Product requires a manual price: ${requestedProduct.code}`,
        );
      }

      return {
        idProduct: product.idProduct,
        code: product.code,
        quantity: requestedProduct.quantity,
        unitPriceCents: parseMoneyToCents(price),
      };
    }),
  };
};

const currentDateOnly = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};
