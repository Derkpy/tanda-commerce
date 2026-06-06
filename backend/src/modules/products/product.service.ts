import { randomInt, randomUUID } from "node:crypto";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";
import type { CreateProductInput, UpdateProductInput } from "./product.schema.js";

export const productService = {
  list(auth: AuthUser) {
    return prisma.product.findMany({
      where: {
        category: {
          group: {
            idBranch: auth.idBranch,
          },
        },
      },
      orderBy: { idProduct: "asc" },
      include: {
        category: {
          include: {
            group: true,
          },
        },
      },
    });
  },

  async findByCode(code: string, auth: AuthUser) {
    const product = await prisma.product.findFirst({
      where: {
        code,
        category: {
          group: {
            idBranch: auth.idBranch,
          },
        },
      },
      select: {
        code: true,
        idCategory: true,
        idProduct: true,
        nameProducts: true,
        priceProduct: true,
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  },

  async create(input: CreateProductInput, auth: AuthUser) {
    const category = await prisma.category.findFirst({
      where: {
        idCategory: input.idCategory,
        group: {
          idBranch: auth.idBranch,
        },
      },
      select: { idCategory: true },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          idCategory: input.idCategory,
          nameProducts: input.nameProducts,
          priceProduct: toNullableDecimal(input.priceProduct),
          code: `product-${randomUUID()}`,
        },
      });

      return tx.product.update({
        where: { idProduct: product.idProduct },
        data: {
          code: createProductCode(product.idCategory, product.idProduct),
        },
        include: {
          category: {
            include: {
              group: true,
            },
          },
        },
      });
    });
  },

  async update(id: number, input: UpdateProductInput, auth: AuthUser) {
    const product = await prisma.product.findFirst({
      where: {
        idProduct: id,
        category: {
          group: {
            idBranch: auth.idBranch,
          },
        },
      },
      select: { idProduct: true },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return prisma.product.update({
      where: { idProduct: id },
      data: {
        nameProducts: input.nameProducts,
        priceProduct: toNullableDecimal(input.priceProduct),
      },
      include: {
        category: {
          include: {
            group: true,
          },
        },
      },
    });
  },

  async delete(id: number, auth: AuthUser) {
    const product = await prisma.product.findFirst({
      where: {
        idProduct: id,
        category: {
          group: {
            idBranch: auth.idBranch,
          },
        },
      },
      select: {
        idProduct: true,
        _count: {
          select: {
            saleDetails: true,
          },
        },
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product._count.saleDetails > 0) {
      throw new ApiError(409, "Product has sale details");
    }

    await prisma.product.delete({
      where: { idProduct: id },
    });
  },
};

const createProductCode = (idCategory: number, idProduct: number) =>
  `${idCategory}${idProduct}${String(randomInt(0, 1000)).padStart(3, "0")}`;

const toNullableDecimal = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
};
