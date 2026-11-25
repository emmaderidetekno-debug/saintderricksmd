@echo off
setlocal
cd /d "%~dp0"

rem Paste your session string here to skip the prompt (optional).
set "SESSION="
rem Uncomment to serve the page on a fixed port while testing locally.
rem set PORT=4324

rem Owner numbers: country code, digits only, comma separated (optional).
set "DEV="

rem A file is safer than pasting: cmd truncates very long pasted values.
if exist "session.txt" set /p "SESSION=<session.txt"

if not "%SESSION%"=="" goto :run

echo.
echo   St. Derricks MD - local start
echo   ----------------------------
echo   Paste your session string and press Enter.
echo   Get it at https://pair-tesla-md.onrender.com
echo.
set /p "SESSION=Session: "
if "%SESSION%"=="" (
  echo.
  echo No session entered - nothing to start.
  pause
  exit /b 1
)

:run
echo.
echo Starting St. Derricks MD...
node start.js

echo.
echo The bot has stopped. Press any key to close this window.
pause >nul
