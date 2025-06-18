@echo off
echo 🚀 Building CRC360 Docker Container...

REM Stop and remove existing container if it exists
echo 🛑 Stopping existing CRC360 container...
docker-compose -f docker-compose.crc360.yml down

REM Remove existing image to ensure fresh build
echo 🗑️ Removing existing CRC360 image...
docker rmi crc360_crc360 2>nul

REM Build the new image
echo 🔨 Building new CRC360 image...
docker-compose -f docker-compose.crc360.yml build --no-cache

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ CRC360 Docker image built successfully!
    echo 📦 Image name: crc360_crc360
    echo 🏃 To run the container, use: docker-run-crc360.bat
) else (
    echo ❌ Failed to build CRC360 Docker image
    exit /b 1
)

pause
