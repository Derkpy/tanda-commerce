import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema.js";

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

    return prisma.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: {
          idGroup: input.idGroup,
          categoryName: input.categoryName,
          code: createTemporaryCode("category"),
        },
      });

      return tx.category.update({
        where: { idCategory: category.idCategory },
        data: {
          code: createEntityCode([category.idGroup, category.idCategory]),
        },
        include: {
          group: true,
        },
      });
    });
  },

  async update(id: number, input: UpdateCategoryInput, auth: AuthUser) {
    const category = await prisma.category.findFirst({
      where: {
        idCategory: id,
        group: {
          idBranch: auth.idBranch,
        },
      },
      select: { idCategory: true },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return prisma.category.update({
      where: { idCategory: id },
      data: {
        categoryName: input.categoryName,
      },
      include: {
        group: true,
      },
    });
  },

  async delete(id: number, auth: AuthUser) {
    const category = await prisma.category.findFirst({
      where: {
        idCategory: id,
        group: {
          idBranch: auth.idBranch,
        },
      },
      select: {
        idCategory: true,
      },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.deleteMany({
        where: {
          idCategory: id,
        },
      });

      await tx.category.delete({
        where: { idCategory: id },
      });
    });
  },
};

const createTemporaryCode = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const createEntityCode = (parts: Array<number>) =>
  `${parts.join("")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
