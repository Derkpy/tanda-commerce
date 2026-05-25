import { prisma } from "../../config/prisma.js";
import type { AuthUser } from "../../types/auth.js";

export const tandaService = {
  list(auth: AuthUser) {
    return prisma.tanda.findMany({
      where: {
        sale: {
          idBranch: auth.idBranch,
        },
      },
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
