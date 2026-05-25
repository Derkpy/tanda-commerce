import type { Request, Response } from "express";
import { ApiError } from "../../errors/api-error.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "./auth.constants.js";
import { clearAuthCookies, setAuthCookies } from "./auth.cookies.js";
import type { LoginBody } from "./auth.schema.js";
import { authService } from "./auth.service.js";

type AnyRequest = Request<any, any, any, any>;

const setNoStoreHeaders = (res: Response): void => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
};

const getClientInfo = (req: AnyRequest) => ({
  ipAddress: req.ip,
  userAgent: req.get("user-agent"),
});

const getRefreshTokenCookie = (req: Request): string | undefined => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  return typeof token === "string" && token.length > 0 ? token : undefined;
};

const requireAuthenticatedUser = (req: AnyRequest) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  return req.user;
};

export const authController = {
  async login(req: Request<unknown, unknown, LoginBody>, res: Response) {
    const result = await authService.login(req.body, getClientInfo(req));
    setNoStoreHeaders(res);
    setAuthCookies(res, result.tokens);

    res.status(200).json({ user: result.user });
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(requireAuthenticatedUser(req));
    setNoStoreHeaders(res);

    res.json({ user });
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = getRefreshTokenCookie(req);

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    let result;

    try {
      result = await authService.refresh(refreshToken, getClientInfo(req));
    } catch (error) {
      clearAuthCookies(res);
      throw error;
    }

    setNoStoreHeaders(res);
    setAuthCookies(res, result.tokens);

    res.json({ user: result.user });
  },

  async logout(req: Request, res: Response) {
    await authService.logout(getRefreshTokenCookie(req));
    setNoStoreHeaders(res);
    clearAuthCookies(res);

    res.status(204).send();
  },
};
