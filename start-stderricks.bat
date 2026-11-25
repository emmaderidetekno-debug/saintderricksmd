@echo off
setlocal
cd /d "%~dp0"

rem The session is asked for by start.js, not by this file: cmd truncates
rem long pasted values, which used to cut the session in half.
rem A saved session.txt is reused automatically.

rem Uncomment to serve the page on a fixed port while testing locally.
rem set PORT=4324

rem Owner numbers: country code, digits only, comma separated (optional).
set "DEV="

echo.
echo Starting St. Derricks MD...
node start.js

echo.
echo The bot has stopped. Press any key to close this window.
pause >nul
