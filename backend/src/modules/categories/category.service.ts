import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";
import type { CreateCategoryInput } from "./category.schema.js";

export const categoryService = {
  list(auth: AuthUser) {
    return prisma.category.findMany({
      where: {
        group: {
          idBranch: auth.idBranch,
        },
      },
      orderBy: { idCategory: "asc" },
      include: {
        group: true,
      },
    });
  },

  async create(input: CreateCategoryInput, auth: AuthUser) {
    const group = await prisma.productGroup.findFirst({
      where: {
        idGroup: input.idGroup,
        idBranch: auth.idBranch,
      },
      select: { idGroup: true },
    });

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    return prisma.category.create({
      data: input,
    });
  },
};
