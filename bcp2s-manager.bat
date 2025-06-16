@echo off
title BCP2S Container Manager

:menu
cls
echo ===============================================
echo           BCP2S Container Manager
echo ===============================================
echo.
echo Choose an option:
echo.
echo 1. Start BCP2S (Production Mode)
echo 2. Start BCP2S (Development Mode)
echo 3. Stop BCP2S
echo 4. Restart BCP2S
echo 5. View Logs
echo 6. Check Service Status
echo 7. Build/Rebuild Container
echo 8. Start Individual Services
echo 9. Clean Up (Remove all containers)
echo 0. Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto start_prod
if "%choice%"=="2" goto start_dev
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto restart
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto status
if "%choice%"=="7" goto build
if "%choice%"=="8" goto individual
if "%choice%"=="9" goto cleanup
if "%choice%"=="0" goto exit
goto menu

:start_prod
echo 🚀 Starting BCP2S in Production Mode...
docker-compose -f docker-compose.new.yml --profile unified up -d
if %errorlevel% equ 0 (
    echo ✅ BCP2S started successfully!
    call :show_urls
) else (
    echo ❌ Failed to start BCP2S
)
pause
goto menu

:start_dev
echo 🚀 Starting BCP2S in Development Mode...
docker-compose -f docker-compose.new.yml --profile unified-dev up -d
if %errorlevel% equ 0 (
    echo ✅ BCP2S Development started successfully!
    call :show_urls
) else (
    echo ❌ Failed to start BCP2S Development
)
pause
goto menu

:stop
echo 🛑 Stopping BCP2S...
docker-compose -f docker-compose.new.yml --profile unified down
docker-compose -f docker-compose.new.yml --profile unified-dev down
docker-compose -f docker-compose.new.yml --profile individual down
echo ✅ BCP2S stopped
pause
goto menu

:restart
echo 🔄 Restarting BCP2S...
docker-compose -f docker-compose.new.yml --profile unified restart
docker-compose -f docker-compose.new.yml --profile unified-dev restart
echo ✅ BCP2S restarted
pause
goto menu

:logs
echo 📋 BCP2S Logs:
echo.
echo Choose which logs to view:
echo 1. All services
echo 2. Main Dashboard
echo 3. AMMC Service
echo 4. BAM Service
echo 5. Back to main menu
echo.
set /p log_choice="Enter choice (1-5): "

if "%log_choice%"=="1" docker logs bcp2s-unified
if "%log_choice%"=="2" docker exec bcp2s-unified supervisorctl tail -f main-dashboard
if "%log_choice%"=="3" docker exec bcp2s-unified supervisorctl tail -f ammc-service
if "%log_choice%"=="4" docker exec bcp2s-unified supervisorctl tail -f bam-service
if "%log_choice%"=="5" goto menu

pause
goto menu

:status
echo 🔍 Checking BCP2S Status...
echo.
echo Container Status:
docker ps --filter "name=bcp2s"
echo.
echo Service Health Check:
curl -s -o nul -w "Main Dashboard: %%{http_code}\n" http://localhost:3000/api/health
curl -s -o nul -w "AMMC Service: %%{http_code}\n" http://localhost:8080/admin/
curl -s -o nul -w "BAM Service: %%{http_code}\n" http://localhost:8000/
pause
goto menu

:build
echo 🔨 Building BCP2S Container...
docker-compose -f docker-compose.new.yml --profile unified build --no-cache
echo ✅ Build completed
pause
goto menu

:individual
echo 🚀 Starting Individual Services...
docker-compose -f docker-compose.new.yml --profile individual up -d
if %errorlevel% equ 0 (
    echo ✅ Individual services started!
    call :show_urls
) else (
    echo ❌ Failed to start individual services
)
pause
goto menu

:cleanup
echo 🗑️ Cleaning up BCP2S containers...
echo WARNING: This will remove all BCP2S containers and images!
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    docker-compose -f docker-compose.new.yml --profile unified down
    docker-compose -f docker-compose.new.yml --profile unified-dev down
    docker-compose -f docker-compose.new.yml --profile individual down
    docker rmi bcp2s-unified bcp2s-unified-dev >nul 2>&1
    echo ✅ Cleanup completed
) else (
    echo ❌ Cleanup cancelled
)
pause
goto menu

:show_urls
echo.
echo 🌐 Service URLs:
echo   📊 Main Dashboard:     http://localhost:3000
echo   📈 Rep Watch:          http://localhost:3010
echo   📄 Documents Service:  http://localhost:3003
echo   🧮 Calculs Service:    http://localhost:3005
echo   🛡️  AML Service:        http://localhost:5000
echo   📋 AMMC Service:       http://localhost:8080
echo   🏦 BAM Service:        http://localhost:8000
echo.
goto :eof

:exit
echo 👋 Goodbye!
exit /b 0
