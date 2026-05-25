import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";

export const userService = {
  async findById(id: number, auth: AuthUser) {
    const user = await prisma.user.findFirst({
      where: {
        idUser: id,
        idBranch: auth.idBranch,
      },
      select: {
        idUser: true,
        idBranch: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        branch: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  },
};
