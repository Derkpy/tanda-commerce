import type { Request } from "express";
import { ApiError } from "../errors/api-error.js";
import type { AuthUser } from "../types/auth.js";

export const requireAuthUser = (req: Request<any, any, any, any>): AuthUser => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  return req.user;
};
