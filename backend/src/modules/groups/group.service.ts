import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";
import type { CreateGroupInput, UpdateGroupInput } from "./group.schema.js";

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

  async update(id: number, input: UpdateGroupInput, auth: AuthUser) {
    const group = await prisma.productGroup.findFirst({
      where: {
        idGroup: id,
        idBranch: auth.idBranch,
      },
      select: { idGroup: true },
    });

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    return prisma.productGroup.update({
      where: { idGroup: id },
      data: {
        groupName: input.groupName,
      },
    });
  },

  async delete(id: number, auth: AuthUser) {
    const group = await prisma.productGroup.findFirst({
      where: {
        idGroup: id,
        idBranch: auth.idBranch,
      },
      select: {
        idGroup: true,
      },
    });

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    await prisma.$transaction(async (tx) => {
      const categories = await tx.category.findMany({
        where: {
          idGroup: id,
        },
        select: {
          idCategory: true,
        },
      });
      const categoryIds = categories.map((category) => category.idCategory);

      if (categoryIds.length > 0) {
        await tx.product.deleteMany({
          where: {
            idCategory: {
              in: categoryIds,
            },
          },
        });

        await tx.category.deleteMany({
          where: {
            idCategory: {
              in: categoryIds,
            },
          },
        });
      }

      await tx.productGroup.delete({
        where: { idGroup: id },
      });
    });
  },
};
