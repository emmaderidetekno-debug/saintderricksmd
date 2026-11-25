@echo off
setlocal
cd /d "%~dp0"

rem ---------------------------------------------------------------------
rem Paste your WhatsApp session string after SESSION= and save this file.
rem Get it from the pairing page linked in README.md.
rem ---------------------------------------------------------------------
set SESSION=

rem Owner phone numbers: country code, no + and no spaces, comma separated.
set DEV=

if "%SESSION%"=="" (
  echo.
  echo SESSION is empty.
  echo Right-click this file, choose Edit, paste your session string after SESSION=, save, then run it again.
  echo.
  pause
  exit /b 1
)

echo Starting St.Derricks MD...
node start.js

echo.
echo The bot has stopped. Press any key to close this window.
pause >nul
