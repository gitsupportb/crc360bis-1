@echo off
REM BCP Securities Services - Docker Build Script (Windows)
REM Builds and manages the Docker container for the reporting dashboard

setlocal enabledelayedexpansion

REM Configuration
set CONTAINER_NAME=bcp-securities-dashboard
set IMAGE_NAME=bcp-dashboard
set COMPOSE_FILE=docker-compose.yml

REM Get command line argument
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=build

echo.
echo 🏦 BCP Securities Services - Docker Build Script
echo ================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install it and try again.
    pause
    exit /b 1
)
echo ✅ docker-compose is available

REM Handle different commands
if "%COMMAND%"=="build" goto :build
if "%COMMAND%"=="start" goto :start
if "%COMMAND%"=="stop" goto :stop
if "%COMMAND%"=="restart" goto :restart
if "%COMMAND%"=="status" goto :status
if "%COMMAND%"=="logs" goto :logs
if "%COMMAND%"=="clean" goto :clean
if "%COMMAND%"=="help" goto :help
if "%COMMAND%"=="-h" goto :help
if "%COMMAND%"=="--help" goto :help

echo ❌ Unknown command: %COMMAND%
echo Use '%0 help' for usage information
pause
exit /b 1

:build
echo ℹ️  Building and starting application...
call :setup_env
call :setup_directories
call :build_image
call :start_services
goto :end

:start
echo ℹ️  Starting services...
call :start_services
goto :end

:stop
echo ℹ️  Stopping services...
docker-compose down
echo ✅ Services stopped
goto :end

:restart
echo ℹ️  Restarting services...
docker-compose down
call :start_services
goto :end

:status
echo ℹ️  Service Status:
docker-compose ps
echo.
echo ℹ️  Resource Usage:
docker stats --no-stream %CONTAINER_NAME% 2>nul || echo ⚠️  Container not running
goto :end

:logs
echo ℹ️  Showing logs (Ctrl+C to exit)...
docker-compose logs -f
goto :end

:clean
echo ℹ️  Cleaning up...
docker-compose down
for /f "tokens=*" %%i in ('docker images -q bcp-dashboard 2^>nul') do docker rmi %%i 2>nul
docker system prune -f
echo ✅ Cleanup complete
goto :end

:help
echo Usage: %0 [command]
echo.
echo Commands:
echo   build    - Build and start the application (default)
echo   start    - Start the services
echo   stop     - Stop the services
echo   restart  - Restart the services
echo   status   - Show service status
echo   logs     - Show service logs
echo   clean    - Clean up containers and images
echo   help     - Show this help message
goto :end

:setup_env
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    if exist .env.example (
        copy .env.example .env >nul
        echo ✅ Created .env file from .env.example
    ) else (
        echo ⚠️  Creating basic .env file...
        (
            echo DASHBOARD_ENV=production
            echo VERSION=1.0.0
            echo HOST_PORT=8000
            echo TIMEZONE=Europe/Paris
            echo LOG_LEVEL=INFO
            echo DEVELOPMENT_MODE=false
            echo DEBUG_MODE=false
        ) > .env
        echo ✅ Created basic .env file
    )
) else (
    echo ✅ .env file exists
)
exit /b 0

:setup_directories
echo ℹ️  Setting up required directories...

REM Create logs directory
if not exist logs mkdir logs

REM Ensure UPLOADED_REPORTINGS exists
if not exist UPLOADED_REPORTINGS (
    echo ⚠️  UPLOADED_REPORTINGS directory not found. Creating...
    mkdir UPLOADED_REPORTINGS
    mkdir "UPLOADED_REPORTINGS\I___Situation_comptable_et_états_annexes"
    mkdir "UPLOADED_REPORTINGS\II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires"
    mkdir "UPLOADED_REPORTINGS\III___Etats_relatifs_à_la_réglementation_prudentielle"
    echo ✅ Created UPLOADED_REPORTINGS directory structure
)

echo ✅ Directory setup complete
exit /b 0

:build_image
echo ℹ️  Building Docker image...

REM Set build arguments
for /f "tokens=*" %%i in ('powershell -command "Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'"') do set BUILD_DATE=%%i
set VCS_REF=unknown
set VERSION=1.0.0

REM Build with docker-compose
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ❌ Failed to build Docker image
    pause
    exit /b 1
)

echo ✅ Docker image built successfully
exit /b 0

:start_services
echo ℹ️  Starting services...

REM Start in detached mode
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    docker-compose logs
    pause
    exit /b 1
)

REM Wait a moment for startup
timeout /t 5 /nobreak >nul

REM Check if container is running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services started successfully
    
    REM Get the port
    for /f "tokens=2 delims==" %%i in ('findstr HOST_PORT .env 2^>nul') do set PORT=%%i
    if "!PORT!"=="" set PORT=8000
    
    echo ℹ️  Dashboard available at: http://localhost:!PORT!
    echo ℹ️  Health check: http://localhost:!PORT!/health
    
    REM Show logs for a few seconds
    echo ℹ️  Showing startup logs...
    timeout /t 10 /nobreak >nul
    
) else (
    echo ❌ Failed to start services
    docker-compose logs
    pause
    exit /b 1
)
exit /b 0

:end
echo.
echo 👋 Script completed
pause
