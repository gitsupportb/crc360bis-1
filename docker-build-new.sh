#!/bin/bash

echo "🚀 Building new BCP Dashboard container..."

# Stop and remove existing container if it exists
echo "🛑 Stopping existing container..."
docker stop bcp-dashboard-new 2>/dev/null || true
docker rm bcp-dashboard-new 2>/dev/null || true

# Remove existing image if it exists
echo "🗑️ Removing old image..."
docker rmi bcp-dashboard-new 2>/dev/null || true

# Build new image
echo "🔨 Building new Docker image..."
docker build -f Dockerfile.main -t bcp-dashboard-new .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting container..."
    
    # Run the new container
    docker run -d \
        --name bcp-dashboard-new \
        -p 3000:3000 \
        --restart unless-stopped \
        bcp-dashboard-new
    
    if [ $? -eq 0 ]; then
        echo "✅ Container started successfully!"
        echo "🌐 Dashboard available at: http://localhost:3000"
        echo "🔍 Health check: http://localhost:3000/api/health"
        echo ""
        echo "📋 Useful commands:"
        echo "  View logs: docker logs bcp-dashboard-new"
        echo "  Stop container: docker stop bcp-dashboard-new"
        echo "  Restart container: docker restart bcp-dashboard-new"
    else
        echo "❌ Failed to start container"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi
