import type { CookieOptions, Response } from "express";
import { env } from "../../config/env.js";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_PATH,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from "./auth.constants.js";

type AuthCookieTokens = {
  accessToken: string;
  refreshToken: string;
};

const baseCookieOptions = (path: string): CookieOptions => ({
  httpOnly: true,
  path,
  sameSite: env.COOKIE_SAME_SITE,
  secure: env.NODE_ENV === "production",
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
});

export const setAuthCookies = (
  res: Response,
  tokens: AuthCookieTokens,
): void => {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
    ...baseCookieOptions(ACCESS_TOKEN_COOKIE_PATH),
    maxAge: env.JWT_ACCESS_TTL_SECONDS * 1000,
  });

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
    ...baseCookieOptions(REFRESH_TOKEN_COOKIE_PATH),
    maxAge: env.JWT_REFRESH_TTL_SECONDS * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(
    ACCESS_TOKEN_COOKIE_NAME,
    baseCookieOptions(ACCESS_TOKEN_COOKIE_PATH),
  );
  res.clearCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    baseCookieOptions(REFRESH_TOKEN_COOKIE_PATH),
  );
};
