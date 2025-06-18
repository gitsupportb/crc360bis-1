# BCP2S Unified Container

A single Docker container that consolidates all BCP Securities Services dashboard services into one unified deployment called **BCP2S**.

## 🏗️ Architecture

The BCP2S container includes all 7 services:

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| **Main Dashboard** | Next.js | 3000 | Central navigation hub with integrated AML Center |
| **Rep Watch** | Next.js | 3010 | Risk monitoring and analysis |
| **Documents Service** | Next.js | 3003 | Document management |
| **Calculs Service** | Next.js | 3005 | Risk calculation tools |
| **AMMC Service** | Django | 8080 | Regulatory reporting |
| **BAM Service** | Django | 8000 | Banking operations |

**Note:** The AML Center is now integrated into the Main Dashboard and accessible at `http://localhost:3000/amlcenter`

## 🚀 Quick Start

### Option 1: Use the Manager (Recommended)
```bash
bcp2s-manager.bat
```

### Option 2: Direct Commands

**Start Production Container:**
```bash
start-bcp2s.bat
# or
docker-compose -f docker-compose.new.yml --profile unified up -d
```

**Start Development Container:**
```bash
docker-compose -f docker-compose.new.yml --profile unified-dev up -d
```

## 📋 Management Scripts

### Windows Scripts
- `bcp2s-manager.bat` - Interactive management menu
- `start-bcp2s.bat` - Quick start script
- `test-bcp2s.bat` - Service testing script

### Linux/Mac Scripts
- `start-bcp2s.sh` - Quick start script

## 🌐 Service URLs

Once the container is running, access services at:

- **Main Dashboard**: http://localhost:3000
- **Rep Watch**: http://localhost:3010
- **Documents**: http://localhost:3003
- **Calculs (R-SENSE)**: http://localhost:3005
- **AML Center**: http://localhost:5000
- **AMMC Service**: http://localhost:8080
- **BAM Service**: http://localhost:8000

## 🔧 Container Modes

### Production Mode (`unified` profile)
- Optimized builds
- Production-ready configuration
- Minimal resource usage
- Built using `Dockerfile.bcp2s`

### Development Mode (`unified-dev` profile)
- Hot reload enabled
- Volume mounting for live code changes
- Development configuration
- Built using `Dockerfile.bcp2s-dev`

### Individual Services (`individual` profile)
- Each service runs in its own container
- Useful for development and debugging
- Same as original docker-compose.yml setup

## 🛠️ Management Commands

### Start Services
```bash
# Production mode
docker-compose -f docker-compose.new.yml --profile unified up -d

# Development mode
docker-compose -f docker-compose.new.yml --profile unified-dev up -d

# Individual services
docker-compose -f docker-compose.new.yml --profile individual up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.new.yml --profile unified down
```

### View Logs
```bash
# All services
docker logs bcp2s-unified

# Specific service logs
docker exec bcp2s-unified supervisorctl tail -f main-dashboard
docker exec bcp2s-unified supervisorctl tail -f ammc-service
docker exec bcp2s-unified supervisorctl tail -f bam-service
```

### Restart Services
```bash
# Restart entire container
docker-compose -f docker-compose.new.yml --profile unified restart

# Restart specific service inside container
docker exec bcp2s-unified supervisorctl restart main-dashboard
```

## 🔍 Health Monitoring

### Health Check Endpoint
- **URL**: http://localhost:3000/api/health
- **Response**: JSON with service status

### Service Status Check
```bash
test-bcp2s.bat
```

### Manual Testing
```bash
curl http://localhost:3000/api/health
curl http://localhost:8080/admin/
curl http://localhost:8000/
```

## 📁 File Structure

```
├── Dockerfile.bcp2s           # Production unified container
├── Dockerfile.bcp2s-dev       # Development unified container
├── docker-compose.new.yml     # Comprehensive compose file
├── supervisord.conf           # Production service management
├── supervisord-dev.conf       # Development service management
├── bcp2s-manager.bat          # Interactive management tool
├── start-bcp2s.bat           # Windows quick start
├── start-bcp2s.sh            # Linux/Mac quick start
├── test-bcp2s.bat            # Service testing
└── README-BCP2S.md           # This file
```

## 🐛 Troubleshooting

### Container Won't Start
1. Check Docker is running: `docker version`
2. Check port conflicts: `netstat -an | findstr "3000\|8080\|8000"`
3. View build logs: `docker-compose -f docker-compose.new.yml --profile unified build`

### Service Not Responding
1. Check container status: `docker ps --filter "name=bcp2s"`
2. View service logs: `docker logs bcp2s-unified`
3. Check specific service: `docker exec bcp2s-unified supervisorctl status`

### Performance Issues
1. Allocate more resources to Docker Desktop
2. Use development mode for faster startup
3. Use individual services for debugging

## 🔄 Migration from Original Setup

To migrate from the original multi-container setup:

1. Stop existing containers: `docker-compose down`
2. Start BCP2S: `start-bcp2s.bat`
3. All services will be available on the same ports

## 📊 Resource Usage

The unified container typically uses:
- **Memory**: 2-4 GB RAM
- **CPU**: 2-4 cores recommended
- **Disk**: ~2 GB for images
- **Network**: All services on bridge network

## 🔐 Security

- Non-root user execution
- Isolated network
- Health checks enabled
- Supervisor process management
