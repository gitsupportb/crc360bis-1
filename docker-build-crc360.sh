#!/bin/bash

# CRC360 Docker Build Script
echo "🚀 Building CRC360 Docker Container..."

# Stop and remove existing container if it exists
echo "🛑 Stopping existing CRC360 container..."
docker-compose -f docker-compose.crc360.yml down

# Remove existing image to ensure fresh build
echo "🗑️ Removing existing CRC360 image..."
docker rmi crc360_crc360 2>/dev/null || true

# Build the new image
echo "🔨 Building new CRC360 image..."
docker-compose -f docker-compose.crc360.yml build --no-cache

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ CRC360 Docker image built successfully!"
    echo "📦 Image name: crc360_crc360"
    echo "🏃 To run the container, use: ./docker-run-crc360.sh"
else
    echo "❌ Failed to build CRC360 Docker image"
    exit 1
fi
