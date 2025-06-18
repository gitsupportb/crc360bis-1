#!/bin/bash

# CRC360 Docker Run Script
echo "🚀 Starting CRC360 Docker Container..."

# Start the container
docker-compose -f docker-compose.crc360.yml up -d

# Check if container started successfully
if [ $? -eq 0 ]; then
    echo "✅ CRC360 container started successfully!"
    echo "🌐 Application is running at: http://localhost:3000"
    echo "📊 Container name: CRC360"
    echo ""
    echo "📋 Available routes:"
    echo "   • Main Dashboard: http://localhost:3000"
    echo "   • AML Center: http://localhost:3000/amlcenter"
    echo "   • Rep Watch: http://localhost:3000/rep-watch"
    echo "   • DOC Secure: http://localhost:3000/docsecure"
    echo "   • R-Sense: http://localhost:3000/rsense"
    echo "   • Admin Panel: http://localhost:3000/admin"
    echo ""
    echo "🔧 Container management commands:"
    echo "   • View logs: docker logs CRC360"
    echo "   • Stop container: docker-compose -f docker-compose.crc360.yml down"
    echo "   • Restart container: docker-compose -f docker-compose.crc360.yml restart"
    echo "   • View status: docker-compose -f docker-compose.crc360.yml ps"
else
    echo "❌ Failed to start CRC360 container"
    exit 1
fi
