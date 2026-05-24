import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { CreateClientInput } from "./client.schema.js";

export const clientService = {
  list() {
    return prisma.client.findMany({
      orderBy: { idClient: "asc" },
    });
  },

  async create(input: CreateClientInput) {
    return prisma.client.create({
      data: input,
    });
  },

  async findById(id: number) {
    const client = await prisma.client.findUnique({
      where: { idClient: id },
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
