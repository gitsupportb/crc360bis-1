# BCP2S ERP Dashboard - Docker Setup

This project is a comprehensive Enterprise Resource Planning (ERP) system for BCP Securities Services, consisting of multiple microservices running in Docker containers.

## 🏗️ Architecture

The system consists of 7 services:

1. **Main Dashboard** (Next.js) - Port 3000 - Central navigation hub
2. **Rep Watch** (Next.js) - Port 3010 - Risk monitoring and analysis
3. **Documents Service** (Next.js) - Port 3003 - Document management
4. **Calculs Service** (Next.js) - Port 3005 - Risk calculation tools
5. **AML Service** (Node.js/Express) - Port 5000 - Anti-Money Laundering
6. **AMMC Service** (Django) - Port 8080 - Regulatory reporting
7. **BAM Service** (Django) - Port 8000 - Banking operations

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 4GB of available RAM
- Ports 3000, 3003, 3005, 3010, 5000, 8000, 8080 available

### Option 1: Using the startup scripts

**Windows:**
```bash
docker-start.bat
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Option 2: Manual Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

## 📋 Service URLs

Once all services are running, you can access:

- **Main Dashboard**: http://localhost:3000
- **Rep Watch**: http://localhost:3010
- **Documents**: http://localhost:3003
- **Calculs (R-SENSE)**: http://localhost:3005
- **AML Center**: http://localhost:5000
- **AMMC Service**: http://localhost:8080
- **BAM Service**: http://localhost:8000

## 🛠️ Development

### Individual Service Management

Start a specific service:
```bash
docker-compose up main-dashboard
docker-compose up rep-watch
docker-compose up docs-service
# etc.
```

View logs for a specific service:
```bash
docker-compose logs -f main-dashboard
```

### Rebuilding Services

If you make changes to the code:
```bash
# Rebuild specific service
docker-compose build main-dashboard

# Rebuild all services
docker-compose build
```

## 🔧 Troubleshooting

### Port Conflicts
If you get port conflict errors, check what's running on the ports:
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Memory Issues
If services fail to start due to memory:
- Increase Docker Desktop memory allocation
- Close other applications
- Start services individually

### Service Dependencies
Services have dependencies. If one fails, others might not work properly. Check logs:
```bash
docker-compose logs
```

## 🛑 Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove everything including images
docker-compose down --rmi all -v
```

## 📁 Project Structure

```
├── docker-compose.yml          # Main orchestration file
├── Dockerfile.main            # Main dashboard container
├── app/
│   ├── dashboard/bcp2s-risk-platform/
│   │   ├── Dockerfile         # Rep Watch service
│   │   ├── AMMC/
│   │   │   └── Dockerfile     # AMMC Django service
│   │   └── components/myfirstproject/
│   │       └── Dockerfile     # BAM Django service
│   ├── documents/bcp-docs-platforme/
│   │   └── Dockerfile         # Documents service
│   ├── calculs/bcp2s-risk-platform/
│   │   └── Dockerfile         # Calculs service
│   └── aml/LBCFT WEBAPP (1)/LBCFT WEBAPP/
│       └── Dockerfile         # AML service
├── docker-start.sh            # Linux/Mac startup script
└── docker-start.bat           # Windows startup script
```

## 🔒 Security Notes

- All services run in development mode
- Default Django secret keys are used (change for production)
- No authentication is configured (add for production)
- SQLite databases are used (consider PostgreSQL for production)

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Ensure all ports are available
3. Verify Docker Desktop is running
4. Try rebuilding: `docker-compose build --no-cache`
