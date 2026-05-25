import { createHash, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env.js";
import type { AuthUser } from "../../types/auth.js";

const jwtMetaSchema = {
  exp: z.number().int().positive().optional(),
  iat: z.number().int().positive().optional(),
};

const accessTokenPayloadSchema = z
  .object({
    ...jwtMetaSchema,
    idUser: z.number().int().positive(),
    idBranch: z.number().int().positive(),
    role: z.string().trim().min(1).max(45),
    type: z.literal("access"),
  })
  .strict();

const refreshTokenPayloadSchema = z
  .object({
    ...jwtMetaSchema,
    idUser: z.number().int().positive(),
    jti: z.string().uuid(),
    type: z.literal("refresh"),
  })
  .strict();

export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;

export const tokenHash = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const signAccessToken = (user: AuthUser): string =>
  jwt.sign(
    {
      idUser: user.idUser,
      idBranch: user.idBranch,
      role: user.role,
      type: "access",
    },
    env.JWT_ACCESS_SECRET,
    {
      algorithm: "HS256",
      expiresIn: env.JWT_ACCESS_TTL_SECONDS,
    },
  );

export const signRefreshToken = (
  idUser: number,
): { token: string; expiresAt: Date } => {
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_SECONDS * 1000);
  const token = jwt.sign(
    {
      idUser,
      jti: randomUUID(),
      type: "refresh",
    },
    env.JWT_REFRESH_SECRET,
    {
      algorithm: "HS256",
      expiresIn: env.JWT_REFRESH_TTL_SECONDS,
    },
  );

  return { token, expiresAt };
};

export const verifyAccessToken = (token: string): AuthUser => {
  const payload = accessTokenPayloadSchema.parse(
    jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    }),
  );

  return {
    idUser: payload.idUser,
    idBranch: payload.idBranch,
    role: payload.role,
  };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  refreshTokenPayloadSchema.parse(
    jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
    }),
  );
