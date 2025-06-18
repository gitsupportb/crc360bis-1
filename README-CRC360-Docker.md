# CRC360 Docker Setup

This document provides instructions for running the CRC360 (Comprehensive Risk and Compliance 360°) application in a Docker container.

## Overview

CRC360 is a consolidated dashboard that integrates multiple risk management and compliance services:
- **AML Center**: Anti-Money Laundering compliance tools
- **Rep Watch**: Risk reporting and monitoring dashboard
- **DOC Secure**: Document management and security system
- **R-Sense**: Risk calculation and assessment platform
- **Admin Panel**: Centralized administration interface

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- At least 2GB of available RAM
- Port 3000 available on your host machine

## Quick Start

### For Windows Users

1. **Build the container:**
   ```cmd
   docker-build-crc360.bat
   ```

2. **Run the container:**
   ```cmd
   docker-run-crc360.bat
   ```

### For Linux/Mac Users

1. **Make scripts executable:**
   ```bash
   chmod +x docker-build-crc360.sh docker-run-crc360.sh
   ```

2. **Build the container:**
   ```bash
   ./docker-build-crc360.sh
   ```

3. **Run the container:**
   ```bash
   ./docker-run-crc360.sh
   ```

## Manual Docker Commands

If you prefer to use Docker commands directly:

### Build the image:
```bash
docker-compose -f docker-compose.crc360.yml build
```

### Run the container:
```bash
docker-compose -f docker-compose.crc360.yml up -d
```

### Stop the container:
```bash
docker-compose -f docker-compose.crc360.yml down
```

## Accessing the Application

Once the container is running, you can access the application at:

- **Main Dashboard**: http://localhost:3000
- **AML Center**: http://localhost:3000/amlcenter
- **Rep Watch**: http://localhost:3000/rep-watch
- **DOC Secure**: http://localhost:3000/docsecure
- **R-Sense**: http://localhost:3000/rsense
- **Admin Panel**: http://localhost:3000/admin

## Container Management

### View container status:
```bash
docker-compose -f docker-compose.crc360.yml ps
```

### View logs:
```bash
docker logs CRC360
```

### Restart the container:
```bash
docker-compose -f docker-compose.crc360.yml restart
```

### Update the application:
1. Stop the container: `docker-compose -f docker-compose.crc360.yml down`
2. Rebuild: `docker-compose -f docker-compose.crc360.yml build --no-cache`
3. Start: `docker-compose -f docker-compose.crc360.yml up -d`

## Data Persistence

The following data is persisted using Docker volumes:
- **Uploaded files**: `/app/uploads`
- **AML Center uploads**: `/app/app/amlcenter/uploads`
- **DOC Secure documents**: `/app/docsecureDOCS`
- **Public uploads**: `/app/public/UPLOADED_REPORTINGS`

## Troubleshooting

### Container won't start:
1. Check if port 3000 is available: `netstat -an | grep 3000`
2. Check Docker logs: `docker logs CRC360`
3. Ensure Docker has enough resources allocated

### Application not accessible:
1. Verify container is running: `docker ps`
2. Check if the port is properly mapped: `docker port CRC360`
3. Try accessing via container IP: `docker inspect CRC360 | grep IPAddress`

### Build failures:
1. Ensure you have enough disk space
2. Clear Docker cache: `docker system prune -a`
3. Check if all required files are present in the build context

## Environment Variables

The container uses the following environment variables:
- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`

## Health Check

The container includes a health check that verifies the application is responding on port 3000. You can check the health status with:
```bash
docker inspect CRC360 | grep Health -A 10
```

## Support

For issues related to the Docker setup, please check:
1. Docker logs: `docker logs CRC360`
2. Container status: `docker-compose -f docker-compose.crc360.yml ps`
3. System resources: `docker stats CRC360`
