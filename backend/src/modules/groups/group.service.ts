import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { CreateGroupInput } from "./group.schema.js";

export const groupService = {
  list() {
    return prisma.productGroup.findMany({
      orderBy: { idGroup: "asc" },
      include: {
        branch: true,
      },
    });
  },

  async create(input: CreateGroupInput) {
    const branch = await prisma.branch.findUnique({
      where: { idBranch: input.idBranch },
      select: { idBranch: true },
    });

    if (!branch) {
      throw new ApiError(404, "Branch not found");
    }

    return prisma.productGroup.create({
      data: input,
    });
  },
};
