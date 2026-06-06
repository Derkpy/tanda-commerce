$ErrorActionPreference = "Stop"

& (Join-Path $PSScriptRoot "start-redis.ps1")

Start-Process -FilePath powershell.exe -WorkingDirectory (Join-Path $PSScriptRoot "..") -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-NoExit",
  "-File",
  (Join-Path $PSScriptRoot "start-backend.ps1")
)

Start-Process -FilePath powershell.exe -WorkingDirectory (Join-Path $PSScriptRoot "..") -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-NoExit",
  "-File",
  (Join-Path $PSScriptRoot "start-tanda-worker.ps1")
)

Start-Process -FilePath powershell.exe -WorkingDirectory (Join-Path $PSScriptRoot "..") -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-NoExit",
  "-File",
  (Join-Path $PSScriptRoot "start-web.ps1")
)

Write-Host "Dev local iniciado: Redis 6379, backend 3000, worker tanda, web 5173."
