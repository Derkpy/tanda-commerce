import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";
import type { CreateGroupInput } from "./group.schema.js";

export const groupService = {
  list(auth: AuthUser) {
    return prisma.productGroup.findMany({
      where: {
        idBranch: auth.idBranch,
      },
      orderBy: { idGroup: "asc" },
      include: {
        branch: true,
      },
    });
  },

  async create(input: CreateGroupInput, auth: AuthUser) {
    const branch = await prisma.branch.findUnique({
      where: { idBranch: auth.idBranch },
      select: { idBranch: true },
    });

    if (!branch) {
      throw new ApiError(404, "Branch not found");
    }

    return prisma.productGroup.create({
      data: {
        groupName: input.groupName,
        idBranch: auth.idBranch,
      },
    });
  },
};
