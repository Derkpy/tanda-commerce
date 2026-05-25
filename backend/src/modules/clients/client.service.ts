import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";
import type { CreateClientInput } from "./client.schema.js";

export const clientService = {
  list(auth: AuthUser) {
    return prisma.client.findMany({
      where: {
        idBranch: auth.idBranch,
      },
      orderBy: { idClient: "asc" },
    });
  },

  async create(input: CreateClientInput, auth: AuthUser) {
    return prisma.client.create({
      data: {
        ...input,
        idBranch: auth.idBranch,
      },
    });
  },

  async findById(id: number, auth: AuthUser) {
    const client = await prisma.client.findFirst({
      where: {
        idClient: id,
        idBranch: auth.idBranch,
      },
      include: {
        sales: {
          select: { idSales: true },
          orderBy: { idSales: "asc" },
        },
        tandas: {
          select: { idTanda: true },
          orderBy: { idTanda: "asc" },
        },
      },
    });

    if (!client) {
      throw new ApiError(404, "Client not found");
    }

    return client;
  },
};
