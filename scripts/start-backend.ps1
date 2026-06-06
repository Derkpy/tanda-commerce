$ErrorActionPreference = "Stop"

$backendDir = Join-Path $PSScriptRoot "..\backend"
Set-Location $backendDir

$env:DATABASE_URL = "postgresql://postgres:@localhost:5433/system_tanda"
$env:PORT = "3000"
$env:REDIS_URL = "redis://localhost:6379"
$env:CACHE_TTL_SECONDS = "120"
$env:FRONTEND_URL = "http://localhost:5173"
$env:CORS_ORIGINS = "http://localhost:5173"
$env:REQUEST_BODY_LIMIT = "10kb"
$env:RATE_LIMIT_WINDOW_MS = "900000"
$env:RATE_LIMIT_MAX = "300"
$env:AUTH_RATE_LIMIT_WINDOW_MS = "900000"
$env:AUTH_LOGIN_RATE_LIMIT_MAX = "20"
$env:AUTH_REFRESH_RATE_LIMIT_MAX = "20"
$env:COOKIE_SAME_SITE = "lax"
$env:JWT_ACCESS_SECRET = "dev-access-secret-that-is-at-least-thirty-two-chars"
$env:JWT_REFRESH_SECRET = "dev-refresh-secret-that-is-at-least-thirty-two-chars"

.\node_modules\.bin\tsx.CMD src\server.ts
