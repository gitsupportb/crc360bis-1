#!/bin/bash

echo "🚀 Starting BCP2S ERP Dashboard with Docker..."
echo "Building and starting all services..."

# Build and start all services
docker-compose up --build

echo "✅ All services are running!"
echo ""
echo "📋 Service URLs:"
echo "  Main Dashboard:    http://localhost:3000"
echo "  Rep Watch:         http://localhost:3010"
echo "  Documents:         http://localhost:3003"
echo "  Calculs (R-SENSE): http://localhost:3005"
echo "  AML Center:        http://localhost:5000"
echo "  AMMC Service:      http://localhost:8080"
echo "  BAM Service:       http://localhost:8000"
echo ""
echo "🛑 To stop all services, press Ctrl+C or run: docker-compose down"
