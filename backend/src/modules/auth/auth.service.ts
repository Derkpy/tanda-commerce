import argon2 from "argon2";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import type { AuthUser } from "../../types/auth.js";
import type { LoginBody } from "./auth.schema.js";
import {
  signAccessToken,
  signRefreshToken,
  tokenHash,
  verifyRefreshToken,
} from "./auth.tokens.js";

type ClientSessionInfo = {
  ipAddress?: string;
  userAgent?: string;
};

const publicUserSelect = {
  idUser: true,
  idBranch: true,
  name: true,
  email: true,
  username: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  branch: true,
} as const;

const loginUserSelect = {
  ...publicUserSelect,
  passwordHash: true,
} as const;

const sanitizeClientInfo = (value: string | undefined, maxLength: number) =>
  value ? value.slice(0, maxLength) : undefined;

const isActiveUser = (status: string): boolean =>
  status.trim().toLowerCase() === "active";

const getLoginWhere = (input: LoginBody) => {
  return {
    OR: [{ email: input.identifier }, { username: input.identifier }],
  };
};

const verifyPassword = async (
  passwordHash: string,
  password: string,
): Promise<boolean> => {
  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    return false;
  }
};

const issueTokenPair = async (
  user: AuthUser,
  clientInfo: ClientSessionInfo,
) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.idUser);

  await prisma.refreshToken.create({
    data: {
      idUser: user.idUser,
      tokenHash: tokenHash(refreshToken.token),
      expiresAt: refreshToken.expiresAt,
      ipAddress: sanitizeClientInfo(clientInfo.ipAddress, 60),
      userAgent: sanitizeClientInfo(clientInfo.userAgent, 255),
    },
  });

  return {
    accessToken,
    refreshToken: refreshToken.token,
  };
};

export const authService = {
  async login(input: LoginBody, clientInfo: ClientSessionInfo) {
    const user = await prisma.user.findFirst({
      where: getLoginWhere(input),
      select: loginUserSelect,
    });

    if (!user || !(await verifyPassword(user.passwordHash, input.password))) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!isActiveUser(user.status)) {
      throw new ApiError(403, "User is inactive");
    }

    const { passwordHash: _passwordHash, ...publicUser } = user;
    const tokens = await issueTokenPair(
      {
        idUser: user.idUser,
        idBranch: user.idBranch,
        role: user.role,
      },
      clientInfo,
    );

    return { tokens, user: publicUser };
  },

  async me(user: AuthUser) {
    const currentUser = await prisma.user.findUnique({
      where: { idUser: user.idUser },
      select: publicUserSelect,
    });

    if (!currentUser) {
      throw new ApiError(401, "Authentication required");
    }

    if (!isActiveUser(currentUser.status)) {
      throw new ApiError(403, "User is inactive");
    }

    return currentUser;
  },

  async refresh(refreshToken: string, clientInfo: ClientSessionInfo) {
    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: tokenHash(refreshToken) },
      select: {
        expiresAt: true,
        idRefreshToken: true,
        idUser: true,
        revokedAt: true,
      },
    });

    if (
      !storedToken ||
      storedToken.idUser !== payload.idUser ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { idUser: payload.idUser },
      select: publicUserSelect,
    });

    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!isActiveUser(user.status)) {
      await prisma.refreshToken.updateMany({
        where: {
          idRefreshToken: storedToken.idRefreshToken,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
      throw new ApiError(403, "User is inactive");
    }

    const nextRefreshToken = signRefreshToken(user.idUser);
    const tokens = {
      accessToken: signAccessToken({
        idUser: user.idUser,
        idBranch: user.idBranch,
        role: user.role,
      }),
      refreshToken: nextRefreshToken.token,
    };

    await prisma.$transaction(async (tx) => {
      const revokeResult = await tx.refreshToken.updateMany({
        where: {
          idRefreshToken: storedToken.idRefreshToken,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      if (revokeResult.count !== 1) {
        throw new ApiError(401, "Invalid or expired refresh token");
      }

      await tx.refreshToken.create({
        data: {
          idUser: user.idUser,
          tokenHash: tokenHash(nextRefreshToken.token),
          expiresAt: nextRefreshToken.expiresAt,
          ipAddress: sanitizeClientInfo(clientInfo.ipAddress, 60),
          userAgent: sanitizeClientInfo(clientInfo.userAgent, 255),
        },
      });
    });

    return { tokens, user };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);

      await prisma.refreshToken.updateMany({
        where: {
          idUser: payload.idUser,
          tokenHash: tokenHash(refreshToken),
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } catch {
      return;
    }
  },
};
