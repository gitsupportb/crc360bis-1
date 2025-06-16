#!/bin/bash

# BCP Securities Services - Docker Build Script
# Builds and manages the Docker container for the reporting dashboard

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="bcp-securities-dashboard"
IMAGE_NAME="bcp-dashboard"
COMPOSE_FILE="docker-compose.yml"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Check if docker-compose is available
check_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed. Please install it and try again."
        exit 1
    fi
    log_success "docker-compose is available"
}

# Create .env file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        log_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            log_success "Created .env file from .env.example"
        else
            log_warning "Creating basic .env file..."
            cat > .env << EOF
DASHBOARD_ENV=production
VERSION=1.0.0
HOST_PORT=8000
TIMEZONE=Europe/Paris
LOG_LEVEL=INFO
DEVELOPMENT_MODE=false
DEBUG_MODE=false
EOF
            log_success "Created basic .env file"
        fi
    else
        log_success ".env file exists"
    fi
}

# Ensure required directories exist
setup_directories() {
    log_info "Setting up required directories..."
    
    # Create logs directory
    mkdir -p logs
    
    # Ensure UPLOADED_REPORTINGS exists
    if [ ! -d "UPLOADED_REPORTINGS" ]; then
        log_warning "UPLOADED_REPORTINGS directory not found. Creating..."
        mkdir -p UPLOADED_REPORTINGS
        
        # Create basic structure
        for category in "I___Situation_comptable_et_états_annexes" "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires" "III___Etats_relatifs_à_la_réglementation_prudentielle"; do
            mkdir -p "UPLOADED_REPORTINGS/$category"
        done
        
        log_success "Created UPLOADED_REPORTINGS directory structure"
    fi
    
    # Set proper permissions
    chmod -R 755 UPLOADED_REPORTINGS logs
    
    log_success "Directory setup complete"
}

# Build the Docker image
build_image() {
    log_info "Building Docker image..."
    
    # Set build arguments
    export BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
    export VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    export VERSION=${VERSION:-1.0.0}
    
    # Build with docker-compose
    docker-compose build --no-cache
    
    log_success "Docker image built successfully"
}

# Start the services
start_services() {
    log_info "Starting services..."
    
    # Start in detached mode
    docker-compose up -d
    
    # Wait a moment for startup
    sleep 5
    
    # Check if container is running
    if docker-compose ps | grep -q "Up"; then
        log_success "Services started successfully"
        
        # Get the port
        PORT=$(grep HOST_PORT .env | cut -d'=' -f2 || echo "8000")
        
        log_info "Dashboard available at: http://localhost:$PORT"
        log_info "Health check: http://localhost:$PORT/health"
        
        # Show logs for a few seconds
        log_info "Showing startup logs..."
        timeout 10 docker-compose logs -f || true
        
    else
        log_error "Failed to start services"
        docker-compose logs
        exit 1
    fi
}

# Stop services
stop_services() {
    log_info "Stopping services..."
    docker-compose down
    log_success "Services stopped"
}

# Show status
show_status() {
    log_info "Service Status:"
    docker-compose ps
    
    echo ""
    log_info "Resource Usage:"
    docker stats --no-stream $CONTAINER_NAME 2>/dev/null || log_warning "Container not running"
}

# Show logs
show_logs() {
    log_info "Showing logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Clean up
cleanup() {
    log_info "Cleaning up..."
    
    # Stop services
    docker-compose down
    
    # Remove images
    docker rmi $(docker images -q bcp-dashboard) 2>/dev/null || true
    
    # Clean up unused resources
    docker system prune -f
    
    log_success "Cleanup complete"
}

# Main script
main() {
    echo "🏦 BCP Securities Services - Docker Build Script"
    echo "================================================"
    
    case "${1:-build}" in
        "build")
            check_docker
            check_compose
            setup_env
            setup_directories
            build_image
            start_services
            ;;
        "start")
            check_docker
            check_compose
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            start_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  build    - Build and start the application (default)"
            echo "  start    - Start the services"
            echo "  stop     - Stop the services"
            echo "  restart  - Restart the services"
            echo "  status   - Show service status"
            echo "  logs     - Show service logs"
            echo "  clean    - Clean up containers and images"
            echo "  help     - Show this help message"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
