@echo off
echo 🚀 Building new BCP Dashboard container...

REM Stop and remove existing container if it exists
echo 🛑 Stopping existing container...
docker stop bcp-dashboard-new >nul 2>&1
docker rm bcp-dashboard-new >nul 2>&1

REM Remove existing image if it exists
echo 🗑️ Removing old image...
docker rmi bcp-dashboard-new >nul 2>&1

REM Build new image
echo 🔨 Building new Docker image...
docker build -f Dockerfile.main -t bcp-dashboard-new .

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo 🚀 Starting container...
    
    REM Run the new container
    docker run -d --name bcp-dashboard-new -p 3000:3000 --restart unless-stopped bcp-dashboard-new
    
    if %errorlevel% equ 0 (
        echo ✅ Container started successfully!
        echo 🌐 Dashboard available at: http://localhost:3000
        echo 🔍 Health check: http://localhost:3000/api/health
        echo.
        echo 📋 Useful commands:
        echo   View logs: docker logs bcp-dashboard-new
        echo   Stop container: docker stop bcp-dashboard-new
        echo   Restart container: docker restart bcp-dashboard-new
    ) else (
        echo ❌ Failed to start container
        exit /b 1
    )
) else (
    echo ❌ Build failed
    exit /b 1
)

pause
