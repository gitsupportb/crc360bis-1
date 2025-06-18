#!/bin/bash

echo "🚀 Starting BCP2S Unified Container..."
echo ""

# Check if Docker is running
if ! docker version >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🛑 Stopping any existing BCP2S containers..."
docker stop bcp2s-unified >/dev/null 2>&1 || true
docker rm bcp2s-unified >/dev/null 2>&1 || true

echo "🔨 Building BCP2S unified container..."
docker-compose -f docker-compose.new.yml --profile unified build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check the logs above."
    exit 1
fi

echo "🚀 Starting BCP2S unified container..."
docker-compose -f docker-compose.new.yml --profile unified up -d

if [ $? -eq 0 ]; then
    echo "✅ BCP2S container started successfully!"
    echo ""
    echo "🌐 All Services Available:"
    echo "  📊 Main Dashboard:     http://localhost:3000"
    echo "  📈 Rep Watch:          http://localhost:3010"
    echo "  📄 Documents Service:  http://localhost:3003"
    echo "  🧮 Calculs Service:    http://localhost:3005"
    echo "  🛡️  AML Service:        http://localhost:5000"
    echo "  📋 AMMC Service:       http://localhost:8080"
    echo "  🏦 BAM Service:        http://localhost:8000"
    echo ""
    echo "🔍 Health Check:        http://localhost:3000/api/health"
    echo ""
    echo "📋 Container Management:"
    echo "  View logs: docker logs bcp2s-unified"
    echo "  Stop: docker-compose -f docker-compose.new.yml --profile unified down"
    echo "  Restart: docker-compose -f docker-compose.new.yml --profile unified restart"
    echo ""
    echo "🔍 Checking container status..."
    sleep 3
    docker ps --filter "name=bcp2s-unified"
    echo ""
    echo "📊 Service Status (wait 30 seconds for all services to start):"
    sleep 5
    echo -n "  Main Dashboard: "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
    echo ""
    echo -n "  AMMC Service: "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/admin/
    echo ""
    echo -n "  BAM Service: "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/
    echo ""
else
    echo "❌ Failed to start BCP2S container"
    echo "📋 Checking for errors..."
    docker-compose -f docker-compose.new.yml --profile unified logs --tail=50
fi
