import { z } from "zod";
import { httpClient } from "@/shared/api/http-client";
import {
  authUserSchema,
  loginSchema,
  type AuthUser,
  type LoginValues,
} from "../model/auth.schema";

const authEnvelopeSchema = z.union([
  z.object({ user: authUserSchema }),
  authUserSchema.transform((user) => ({ user })),
]);

function parseAuthUser(data: unknown): AuthUser {
  const parsed = authEnvelopeSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Invalid auth response");
  }

  return parsed.data.user;
}

export const authApi = {
  async login(values: LoginValues): Promise<AuthUser> {
    const payload = loginSchema.parse(values);
    const response = await httpClient.post("/auth/login", payload);

    return parseAuthUser(response.data);
  },

  async me(): Promise<AuthUser> {
    const response = await httpClient.get("/auth/me");

    return parseAuthUser(response.data);
  },

  async logout(): Promise<void> {
    await httpClient.post("/auth/logout");
  },
};
