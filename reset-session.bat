@echo off
setlocal
cd /d "%~dp0"

echo.
echo   St. Derricks MD - forget the current login
echo   ------------------------------------------
echo   Removes session.txt and the session folder, so the next start asks for
echo   a freshly paired session again. Nothing else in the project is touched.
echo.
choice /c YN /m "Continue"
if errorlevel 2 goto cancel

if exist "session.txt" del /q "session.txt"
if exist "session\" rmdir /s /q "session"
echo.
echo Current login removed. Pair a new session at https://pair-tesla-md.onrender.com
echo then double-click Start St. Derricks MD.bat and paste the newest string.
echo.
pause
exit /b 0

:cancel
echo.
echo Nothing was changed.
pause
exit /b 0
