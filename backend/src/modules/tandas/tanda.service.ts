import { prisma } from "../../config/prisma.js";

export const tandaService = {
  list() {
    return prisma.tanda.findMany({
      orderBy: { idTanda: "asc" },
      include: {
        payments: {
          select: { idPaymentTanda: true },
          orderBy: { idPaymentTanda: "asc" },
        },
      },
    });
  },
};
