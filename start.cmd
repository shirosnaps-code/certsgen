@echo off
cd /d "%~dp0"

echo Starting server...
start "" cmd /k "node server.js"

timeout /t 5 > nul

echo Opening browser to http://localhost:3000...
start http://localhost:3000

pause
