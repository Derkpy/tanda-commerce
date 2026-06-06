$ErrorActionPreference = "Stop"

$redisDir = Join-Path $PSScriptRoot "..\.tools\redis\Redis-8.8.0-Windows-x64-msys2"
$redisCli = Join-Path $redisDir "redis-cli.exe"

if (Test-Path $redisCli) {
  try {
    & $redisCli -h 127.0.0.1 -p 6379 shutdown nosave
    Start-Sleep -Seconds 1
  } catch {
    Get-Process -Name redis-server -ErrorAction SilentlyContinue | Stop-Process -Force
  }
}

Write-Host "Redis detenido."
