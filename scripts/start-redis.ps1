$ErrorActionPreference = "Stop"

$redisDir = Join-Path $PSScriptRoot "..\.tools\redis\Redis-8.8.0-Windows-x64-msys2"
$redisServer = Join-Path $redisDir "redis-server.exe"
$redisCli = Join-Path $redisDir "redis-cli.exe"

if (-not (Test-Path $redisServer)) {
  throw "No se encontro Redis portable en $redisDir"
}

$isRunning = $false
try {
  $ping = & $redisCli -h 127.0.0.1 -p 6379 ping 2>$null
  $isRunning = $ping -eq "PONG"
} catch {
  $isRunning = $false
}

if ($isRunning) {
  Write-Host "Redis ya esta activo en 127.0.0.1:6379"
  exit 0
}

Start-Process -FilePath $redisServer -ArgumentList "redis.conf" -WorkingDirectory $redisDir -WindowStyle Minimized
Start-Sleep -Seconds 3

$ping = & $redisCli -h 127.0.0.1 -p 6379 ping
if ($ping -ne "PONG") {
  throw "Redis no respondio PONG despues de iniciar."
}

Write-Host "Redis activo en 127.0.0.1:6379"
