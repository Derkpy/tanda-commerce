$ErrorActionPreference = "Stop"

$webDir = Join-Path $PSScriptRoot "..\web"
Set-Location $webDir

$env:VITE_API_URL = "http://localhost:3000/api"

.\node_modules\.bin\vite.CMD --host 0.0.0.0
