import { z } from "zod";

const commaSeparatedUrlListSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().url()).min(1));

const optionalNonEmptyStringSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalUrlListSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? [] : trimmed;
}, commaSeparatedUrlListSchema.or(z.array(z.string().url())).default([]));

export const envSchema = z.object({
  AUTH_LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  AUTH_REFRESH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("strict"),
  DATABASE_URL: z.string().url(),
  CORS_ORIGINS: optionalUrlListSchema,
  COOKIE_DOMAIN: optionalNonEmptyStringSchema,
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(15 * 60),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(30 * 24 * 60 * 60),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(120),
  REQUEST_BODY_LIMIT: z.string().trim().min(1).max(20).default("10kb"),
});

export type Env = z.infer<typeof envSchema>;
