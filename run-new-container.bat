@echo off
echo 🚀 Starting BCP Dashboard with new optimized container...

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo 🔨 Building and starting the production container...
docker-compose -f docker-compose.new.yml --profile production up --build -d

if %errorlevel% equ 0 (
    echo ✅ Container started successfully!
    echo.
    echo 🌐 Dashboard available at: http://localhost:3000
    echo 🔍 Health check: http://localhost:3000/api/health
    echo.
    echo 📋 Container management:
    echo   View logs: docker logs bcp-dashboard-prod
    echo   Stop: docker-compose -f docker-compose.new.yml --profile production down
    echo   Restart: docker-compose -f docker-compose.new.yml --profile production restart
    echo.
    echo 🔍 Checking container status...
    timeout /t 5 >nul
    docker ps --filter "name=bcp-dashboard-prod"
) else (
    echo ❌ Failed to start container
    echo 📋 Checking for errors...
    docker-compose -f docker-compose.new.yml --profile production logs
)

pause
