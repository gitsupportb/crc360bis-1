# 🐳 BCP Securities Services - Docker Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the BCP Securities Services Reporting Dashboard using Docker containerization. The application manages 68 total reportings across three categories with advanced features including orange theming, calendar widgets, and comprehensive data management.

## 🏗️ Architecture

### **Application Stack:**
- **Frontend**: HTML5/CSS3/JavaScript (Vanilla JS)
- **Backend**: Python 3.11 HTTP Server
- **Data Storage**: JSON files + File system
- **External Dependencies**: CDN-based (Plotly.js, html2canvas)

### **Container Strategy:**
- **Single Container**: Lightweight Python-based web server
- **Volume Mounts**: Persistent data storage for uploads and configuration
- **Health Checks**: Built-in monitoring and reliability
- **Security**: Non-root user, security headers, proper permissions

## 🚀 Quick Start

### **Prerequisites:**
- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB available disk space
- Port 8000 available (configurable)

### **1. Clone and Setup:**
```bash
# Navigate to your project directory
cd /path/to/dashboard-prez-app

# Copy environment configuration
cp .env.example .env

# Edit configuration if needed
nano .env
```

### **2. Build and Run:**
```bash
# Build and start the container
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### **3. Access Dashboard:**
```bash
# Open in browser
http://localhost:8000

# Health check
curl http://localhost:8000/health
```

## 📁 Volume Configuration

### **Persistent Data Volumes:**

1. **`uploaded_reportings`**:
   - **Path**: `./UPLOADED_REPORTINGS` → `/app/UPLOADED_REPORTINGS`
   - **Purpose**: Stores all uploaded reporting files organized by category/report/year/month
   - **Structure**: `CATEGORY/REPORTING_NAME/YEAR/MONTH/files.xlsx`

2. **`dashboard_data`**:
   - **Path**: Docker volume → `/app/data`
   - **Purpose**: Application data, logs, and configuration files

3. **`dashboard_logs`**:
   - **Path**: Docker volume → `/app/logs`
   - **Purpose**: Application logs and monitoring data

### **Configuration Files:**
- **`ALL_REPORTINGS.json`**: Centralized reporting data (read-only mount)
- **Upload logs**: Automatically created in UPLOADED_REPORTINGS folder

## ⚙️ Configuration

### **Environment Variables (.env file):**

```bash
# Application Configuration
DASHBOARD_ENV=production
VERSION=1.0.0
HOST_PORT=8000
TIMEZONE=Europe/Paris

# Logging
LOG_LEVEL=INFO

# Development Mode (set to true for development)
DEVELOPMENT_MODE=false
DEBUG_MODE=false
```

### **Port Configuration:**
```bash
# Change host port (default: 8000)
HOST_PORT=9000
docker-compose up -d
```

## 🔧 Development Mode

### **Enable Development Mode:**
```bash
# In .env file
DASHBOARD_ENV=development
DEVELOPMENT_MODE=true

# Uncomment bind mount in docker-compose.yml
volumes:
  - .:/app:ro  # Enables live reload
```

### **Development Commands:**
```bash
# View logs
docker-compose logs -f bcp-dashboard

# Execute commands in container
docker-compose exec bcp-dashboard bash

# Restart service
docker-compose restart bcp-dashboard
```

## 📊 Dashboard Features

### **Core Functionality:**
- **68 Total Reportings**: Categories I (26), II (23), III (19)
- **Orange Theme**: Professional orange color palette
- **Calendar Widgets**: Date selection instead of dropdowns
- **Upload System**: Category-based file uploads with .xlsx validation
- **Progress Tracking**: Real-time completion monitoring
- **Email Notifications**: Admin panel with escalation hierarchies

### **Data Management:**
- **Centralized Data**: ALL_REPORTINGS.json as single source of truth
- **File Organization**: Structured folder hierarchy by category/report/date
- **Upload Logs**: Comprehensive tracking with timestamps
- **Completion Tracking**: Checkbox synchronization across tabs

### **UI Components:**
- **Main Dashboard**: Complete overview with tabs
- **All Reportings**: Three separate category tables
- **Monthly Tasks**: Downloadable table images named 'LIMITES REGLEMENTAIRES'
- **File Browser**: Complete folder structure with real file detection
- **Progression Overview**: Analytics with actual data integration

## 🔍 Monitoring and Health Checks

### **Health Check Endpoint:**
```bash
# Check application health
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-27T10:30:00",
  "version": "1.0.0",
  "environment": "production"
}
```

### **Log Monitoring:**
```bash
# View real-time logs
docker-compose logs -f bcp-dashboard

# View specific log files
docker-compose exec bcp-dashboard tail -f /app/logs/dashboard.log
```

### **Container Status:**
```bash
# Check container status
docker-compose ps

# View resource usage
docker stats bcp-securities-dashboard
```

## 🛠️ Maintenance

### **Backup Data:**
```bash
# Backup uploaded reportings
docker run --rm -v dashboard-prez-app_uploaded_reportings:/data \
  -v $(pwd):/backup alpine tar czf /backup/reportings-backup.tar.gz -C /data .

# Backup application data
docker run --rm -v dashboard-prez-app_dashboard_data:/data \
  -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
```

### **Update Application:**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Verify deployment
curl http://localhost:8000/health
```

### **Clean Up:**
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Remove images
docker rmi $(docker images -q bcp-*)
```

## 🔒 Security

### **Security Features:**
- **Non-root User**: Application runs as `bcpapp` user
- **Security Headers**: XSS protection, content type options, frame options
- **Resource Limits**: CPU and memory constraints
- **Network Isolation**: Custom bridge network
- **Read-only Mounts**: Configuration files mounted read-only

### **Security Best Practices:**
- Keep Docker and base images updated
- Regularly backup data volumes
- Monitor logs for suspicious activity
- Use HTTPS in production (configure reverse proxy)
- Restrict network access to necessary ports only

## 🚨 Troubleshooting

### **Common Issues:**

**Port Already in Use:**
```bash
# Change port in .env file
HOST_PORT=9000

# Or stop conflicting service
sudo lsof -i :8000
sudo kill -9 <PID>
```

**Permission Issues:**
```bash
# Fix volume permissions
sudo chown -R 1000:1000 ./UPLOADED_REPORTINGS
docker-compose restart bcp-dashboard
```

**Container Won't Start:**
```bash
# Check logs
docker-compose logs bcp-dashboard

# Check configuration
docker-compose config

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**File Upload Issues:**
```bash
# Verify folder structure exists
docker-compose exec bcp-dashboard ls -la /app/UPLOADED_REPORTINGS

# Check permissions
docker-compose exec bcp-dashboard ls -la /app/UPLOADED_REPORTINGS/
```

### **Debug Mode:**
```bash
# Enable debug logging
echo "LOG_LEVEL=DEBUG" >> .env
docker-compose restart bcp-dashboard

# View detailed logs
docker-compose logs -f bcp-dashboard
```

## 📞 Support

### **Getting Help:**
1. Check container logs: `docker-compose logs bcp-dashboard`
2. Verify health endpoint: `curl http://localhost:8000/health`
3. Check volume mounts: `docker-compose exec bcp-dashboard ls -la /app/`
4. Review configuration: `docker-compose config`

### **Performance Monitoring:**
```bash
# Monitor resource usage
docker stats bcp-securities-dashboard

# Check disk usage
docker system df

# Monitor logs size
du -sh ./logs/
```

## 🚀 Quick Start Commands

### **Build and Deploy:**
```bash
# Make scripts executable (Linux/Mac)
chmod +x docker-build.sh test-docker-deployment.sh backup-restore.sh

# Build and start (Linux/Mac)
./docker-build.sh build

# Build and start (Windows)
docker-build.bat build

# Test deployment
./test-docker-deployment.sh

# Access dashboard
open http://localhost:8000
```

### **Management Commands:**
```bash
# View status
./docker-build.sh status

# View logs
./docker-build.sh logs

# Restart services
./docker-build.sh restart

# Stop services
./docker-build.sh stop

# Clean up
./docker-build.sh clean
```

### **Backup and Restore:**
```bash
# Create backup
./backup-restore.sh backup

# List backups
./backup-restore.sh list

# Restore from backup
./backup-restore.sh restore 20250127_143000

# Clean old backups
./backup-restore.sh clean 30
```

## 📋 Pre-deployment Checklist

### **Before First Deployment:**
- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] Port 8000 available (or configure different port)
- [ ] At least 2GB free disk space
- [ ] ALL_REPORTINGS.json file present
- [ ] UPLOADED_REPORTINGS folder structure exists

### **Verification Steps:**
- [ ] Container starts successfully
- [ ] Health check endpoint responds
- [ ] Main dashboard loads
- [ ] All 68 reportings data loads correctly
- [ ] File upload functionality works
- [ ] Volume mounts are persistent
- [ ] Logs are being generated

## 🔧 Advanced Configuration

### **Custom Network Configuration:**
```yaml
# In docker-compose.yml
networks:
  bcp-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
```

### **SSL/HTTPS Configuration:**
```bash
# Generate SSL certificates
mkdir -p ./certs
openssl req -x509 -newkey rsa:4096 -keyout ./certs/key.pem -out ./certs/cert.pem -days 365 -nodes

# Update .env file
ENABLE_HTTPS=true
SSL_CERT_PATH=/app/certs/cert.pem
SSL_KEY_PATH=/app/certs/key.pem

# Add volume mount in docker-compose.yml
volumes:
  - ./certs:/app/certs:ro
```

### **Production Scaling:**
```yaml
# In docker-compose.yml for production
deploy:
  replicas: 2
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 256M
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
```

## 📊 Monitoring and Observability

### **Health Monitoring:**
```bash
# Continuous health monitoring
watch -n 30 'curl -s http://localhost:8000/health | jq'

# Log monitoring with filtering
docker-compose logs -f bcp-dashboard | grep ERROR

# Resource monitoring
docker stats bcp-securities-dashboard
```

### **Log Analysis:**
```bash
# View application logs
docker-compose exec bcp-dashboard tail -f /app/logs/dashboard.log

# Search for specific events
docker-compose logs bcp-dashboard | grep "upload"

# Export logs for analysis
docker-compose logs bcp-dashboard > dashboard-logs-$(date +%Y%m%d).log
```

### **Performance Metrics:**
```bash
# Container performance
docker exec bcp-securities-dashboard ps aux

# Disk usage
docker exec bcp-securities-dashboard df -h

# Network connections
docker exec bcp-securities-dashboard netstat -tulpn
```

## 🔐 Security Hardening

### **Production Security Checklist:**
- [ ] Run container as non-root user (✅ implemented)
- [ ] Use security headers (✅ implemented)
- [ ] Limit container resources (✅ implemented)
- [ ] Use read-only file systems where possible
- [ ] Implement network segmentation
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

### **Security Scanning:**
```bash
# Scan Docker image for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image bcp-dashboard:latest

# Check container security
docker run --rm -it --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --label docker_bench_security \
  docker/docker-bench-security
```

## 🌐 Production Deployment

### **Reverse Proxy Configuration (Nginx):**
```nginx
server {
    listen 80;
    server_name dashboard.bcpsecurities.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Load Balancer Configuration:**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - bcp-dashboard

  bcp-dashboard:
    # ... existing configuration
    deploy:
      replicas: 3
```

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Docker Support**: Engine 20.10+, Compose 2.0+
**Production Ready**: ✅ Yes
