@echo off
echo 🚀 Starting BCP2S Unified Container...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo 🛑 Stopping any existing BCP2S containers...
docker stop bcp2s-unified >nul 2>&1
docker rm bcp2s-unified >nul 2>&1

echo 🔨 Building BCP2S unified container...
docker-compose -f docker-compose.new.yml --profile unified build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Check the logs above.
    pause
    exit /b 1
)

echo 🚀 Starting BCP2S unified container...
docker-compose -f docker-compose.new.yml --profile unified up -d

if %errorlevel% equ 0 (
    echo ✅ BCP2S container started successfully!
    echo.
    echo 🌐 All Services Available:
    echo   📊 Main Dashboard:     http://localhost:3000
    echo   📈 Rep Watch:          http://localhost:3010
    echo   📄 Documents Service:  http://localhost:3003
    echo   🧮 Calculs Service:    http://localhost:3005
    echo   🛡️  AML Service:        http://localhost:5000
    echo   📋 AMMC Service:       http://localhost:8080
    echo   🏦 BAM Service:        http://localhost:8000
    echo.
    echo 🔍 Health Check:        http://localhost:3000/api/health
    echo.
    echo 📋 Container Management:
    echo   View logs: docker logs bcp2s-unified
    echo   Stop: docker-compose -f docker-compose.new.yml --profile unified down
    echo   Restart: docker-compose -f docker-compose.new.yml --profile unified restart
    echo.
    echo 🔍 Checking container status...
    timeout /t 3 >nul
    docker ps --filter "name=bcp2s-unified"
    echo.
    echo 📊 Service Status (wait 30 seconds for all services to start):
    timeout /t 5 >nul
    echo   Testing Main Dashboard...
    curl -s -o nul -w "Main Dashboard: %%{http_code}\n" http://localhost:3000/api/health
    echo   Testing AMMC Service...
    curl -s -o nul -w "AMMC Service: %%{http_code}\n" http://localhost:8080/admin/
    echo   Testing BAM Service...
    curl -s -o nul -w "BAM Service: %%{http_code}\n" http://localhost:8000/
) else (
    echo ❌ Failed to start BCP2S container
    echo 📋 Checking for errors...
    docker-compose -f docker-compose.new.yml --profile unified logs --tail=50
)

pause
