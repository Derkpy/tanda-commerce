import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { CreateCategoryInput } from "./category.schema.js";

export const categoryService = {
  list() {
    return prisma.category.findMany({
      orderBy: { idCategory: "asc" },
      include: {
        group: true,
      },
    });
  },

  async create(input: CreateCategoryInput) {
    const group = await prisma.productGroup.findUnique({
      where: { idGroup: input.idGroup },
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
