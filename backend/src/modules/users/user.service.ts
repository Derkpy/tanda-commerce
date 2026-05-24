import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";

export const userService = {
  async findById(id: number) {
    const user = await prisma.user.findUnique({
      where: { idUser: id },
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
