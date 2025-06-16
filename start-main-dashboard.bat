@echo off
echo 🚀 Starting BCP2S Main Dashboard with integrated AML Center...
echo.
echo 📋 Service URL:
echo   Main Dashboard with AML Center: http://localhost:3000
echo   AML Center Direct Access:      http://localhost:3000/amlcenter
echo.

REM Start the main dashboard
npx next dev -p 3000

echo.
echo ✅ Main Dashboard is running!
echo 🛑 To stop the service, press Ctrl+C
pause
