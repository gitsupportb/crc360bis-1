@echo off
echo.
echo 🏦 BCP Securities Services - Local Development Server
echo ====================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo 💡 Please install Python 3.x from https://python.org
    echo.
    pause
    exit /b 1
)

echo 🐍 Python found, starting server...
echo.

REM Start the Python server
python serve.py

echo.
echo 👋 Server stopped
pause
