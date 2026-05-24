import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { BuildSaleInput } from "./sale.schema.js";

export const saleService = {
  list() {
    return prisma.sale.findMany({
      orderBy: { idSales: "asc" },
      include: {
        details: {
          orderBy: { idSaleDetails: "asc" },
        },
      },
    });
  },

  async findById(id: number) {
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

    return sale;
  },

  build(_input: BuildSaleInput): never {
    throw new ApiError(
      501,
      "Sale Builder endpoint prepared. Builder calculation and persistence are pending.",
    );
  },
};
