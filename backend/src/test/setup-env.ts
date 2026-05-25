process.env.NODE_ENV ??= "test";
process.env.PORT ??= "3000";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5432/system_tandas_ci";
process.env.REDIS_URL ??= "redis://127.0.0.1:6379";
process.env.CACHE_TTL_SECONDS ??= "30";
process.env.FRONTEND_URL ??= "http://localhost:5173";
process.env.CORS_ORIGINS ??= "http://localhost:5173";
process.env.REQUEST_BODY_LIMIT ??= "10kb";
process.env.RATE_LIMIT_WINDOW_MS ??= "900000";
process.env.RATE_LIMIT_MAX ??= "300";
process.env.AUTH_RATE_LIMIT_WINDOW_MS ??= "900000";
process.env.AUTH_LOGIN_RATE_LIMIT_MAX ??= "20";
process.env.AUTH_REFRESH_RATE_LIMIT_MAX ??= "20";
process.env.COOKIE_SAME_SITE ??= "lax";
process.env.JWT_ACCESS_SECRET ??=
  "test-access-secret-that-is-at-least-thirty-two-chars";
process.env.JWT_REFRESH_SECRET ??=
  "test-refresh-secret-that-is-at-least-thirty-two-chars";
process.env.JWT_ACCESS_TTL_SECONDS ??= "900";
process.env.JWT_REFRESH_TTL_SECONDS ??= "2592000";
process.env.RUN_INTEGRATION_TESTS ??= "false";
process.env.REDIS_INTEGRATION ??= "false";
