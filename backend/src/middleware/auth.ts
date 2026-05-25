import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../errors/api-error.js";
import { ACCESS_TOKEN_COOKIE_NAME } from "../modules/auth/auth.constants.js";
import { verifyAccessToken } from "../modules/auth/auth.tokens.js";

const getAccessTokenCookie = (cookies: unknown): string | undefined => {
  if (!cookies || typeof cookies !== "object") {
    return undefined;
  }

  const token = (cookies as Record<string, unknown>)[ACCESS_TOKEN_COOKIE_NAME];
  return typeof token === "string" && token.length > 0 ? token : undefined;
};

const isActiveUser = (status: string): boolean =>
  status.trim().toLowerCase() === "active";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  const token = getAccessTokenCookie(req.cookies);

  if (!token) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
    return;
  }

  const currentUser = await prisma.user.findUnique({
    where: { idUser: payload.idUser },
    select: {
      idBranch: true,
      idUser: true,
      role: true,
      status: true,
    },
  });

  if (!currentUser) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  if (!isActiveUser(currentUser.status)) {
    next(new ApiError(403, "User is inactive"));
    return;
  }

  req.user = {
    idBranch: currentUser.idBranch,
    idUser: currentUser.idUser,
    role: currentUser.role,
  };
  next();
};
