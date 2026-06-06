@echo off
setlocal
set "REDIS_DIR=%~dp0..\.tools\redis\Redis-8.8.0-Windows-x64-msys2"
cd /d "%REDIS_DIR%"
redis-server.exe redis.conf
