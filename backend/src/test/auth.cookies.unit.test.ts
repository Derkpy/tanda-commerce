import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { clearAuthCookies, setAuthCookies } from "../modules/auth/auth.cookies.js";

const createResponseMock = () => {
  const cookie = vi.fn();
  const clearCookie = vi.fn();

  return {
    clearCookie,
    cookie,
  } as unknown as Response;
};

describe("auth cookies", () => {
  it("setea cookies httpOnly para access y refresh", () => {
    const res = createResponseMock();

    setAuthCookies(res, {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const cookieMock = vi.mocked(res.cookie);
    const firstCall = cookieMock.mock.calls[0] as unknown as [
      string,
      string,
      Record<string, unknown>,
    ];
    const secondCall = cookieMock.mock.calls[1] as unknown as [
      string,
      string,
      Record<string, unknown>,
    ];

    expect(cookieMock).toHaveBeenCalledTimes(2);
    expect(firstCall[0]).toBe("accessToken");
    expect(firstCall[2]).toMatchObject({
      httpOnly: true,
      path: "/api",
      sameSite: "lax",
      secure: false,
    });
    expect(secondCall[0]).toBe("refreshToken");
    expect(secondCall[2]).toMatchObject({
      httpOnly: true,
      path: "/api/auth",
      sameSite: "lax",
      secure: false,
    });
  });

  it("limpia las cookies de sesion con las mismas rutas", () => {
    const res = createResponseMock();

    clearAuthCookies(res);

    const clearCookieMock = vi.mocked(res.clearCookie);

    expect(clearCookieMock).toHaveBeenCalledTimes(2);
    expect(clearCookieMock.mock.calls[0]?.[0]).toBe("accessToken");
    expect(clearCookieMock.mock.calls[0]?.[1]).toMatchObject({
      httpOnly: true,
      path: "/api",
    });
    expect(clearCookieMock.mock.calls[1]?.[0]).toBe("refreshToken");
    expect(clearCookieMock.mock.calls[1]?.[1]).toMatchObject({
      httpOnly: true,
      path: "/api/auth",
    });
  });
});
