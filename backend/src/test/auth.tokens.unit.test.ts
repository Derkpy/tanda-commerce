import { describe, expect, it } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  tokenHash,
  verifyAccessToken,
  verifyRefreshToken,
} from "../modules/auth/auth.tokens.js";

describe("auth token utilities", () => {
  it("firma y valida access tokens con el payload esperado", () => {
    const token = signAccessToken({
      idBranch: 4,
      idUser: 12,
      role: "admin",
    });

    expect(verifyAccessToken(token)).toEqual({
      idBranch: 4,
      idUser: 12,
      role: "admin",
    });
  });

  it("firma refresh tokens con expiracion futura y jti", () => {
    const result = signRefreshToken(18);
    const payload = verifyRefreshToken(result.token);

    expect(payload.idUser).toBe(18);
    expect(payload.type).toBe("refresh");
    expect(payload.jti).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("hashea tokens de forma determinista", () => {
    const token = "example-token";

    expect(tokenHash(token)).toBe(tokenHash(token));
    expect(tokenHash(token)).not.toBe(token);
  });
});
