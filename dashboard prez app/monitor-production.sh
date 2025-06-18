#!/bin/bash

# BCP Securities Services - Production Monitoring Script
# Comprehensive monitoring for the Docker deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
CONTAINER_NAME="bcp-securities-dashboard"
BASE_URL="http://localhost:8000"
HTTPS_URL="https://localhost:8443"
LOG_FILE="./logs/monitoring.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=400  # MB

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    echo "$(date): INFO - $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "$(date): SUCCESS - $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "$(date): WARNING - $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "$(date): ERROR - $1" >> "$LOG_FILE"
}

# Setup monitoring log
setup_monitoring() {
    mkdir -p logs
    touch "$LOG_FILE"
    log_info "Production monitoring started"
}

# Check container health
check_container_health() {
    log_info "Checking container health..."
    
    if docker ps | grep -q $CONTAINER_NAME; then
        log_success "Container is running"
        
        # Check container health status
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "unknown")
        if [ "$health_status" = "healthy" ]; then
            log_success "Container health check: HEALTHY"
        else
            log_warning "Container health check: $health_status"
        fi
    else
        log_error "Container is not running"
        return 1
    fi
}

# Check application endpoints
check_endpoints() {
    log_info "Checking application endpoints..."
    
    # Test HTTP health endpoint
    local http_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" 2>/dev/null || echo "000")
    if [ "$http_status" = "200" ]; then
        log_success "HTTP health endpoint: OK ($http_status)"
    else
        log_error "HTTP health endpoint: FAILED ($http_status)"
    fi
    
    # Test main dashboard
    local dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/complete_dashboard.html" 2>/dev/null || echo "000")
    if [ "$dashboard_status" = "200" ]; then
        log_success "Main dashboard: OK ($dashboard_status)"
    else
        log_error "Main dashboard: FAILED ($dashboard_status)"
    fi
    
    # Test file listing
    local files_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/UPLOADED_REPORTINGS/file_listing.json" 2>/dev/null || echo "000")
    if [ "$files_status" = "200" ]; then
        log_success "File listing: OK ($files_status)"
    else
        log_warning "File listing: FAILED ($files_status)"
    fi
}

# Monitor resource usage
check_resource_usage() {
    log_info "Checking resource usage..."
    
    # Get container stats
    local stats=$(docker stats --no-stream --format "{{.CPUPerc}}\t{{.MemUsage}}" $CONTAINER_NAME 2>/dev/null)
    
    if [ -n "$stats" ]; then
        local cpu_percent=$(echo "$stats" | cut -f1 | sed 's/%//')
        local memory_usage=$(echo "$stats" | cut -f2 | cut -d'/' -f1 | sed 's/MiB//')
        
        log_info "CPU Usage: ${cpu_percent}%"
        log_info "Memory Usage: ${memory_usage}MiB"
        
        # Check thresholds
        if (( $(echo "$cpu_percent > $ALERT_THRESHOLD_CPU" | bc -l) )); then
            log_warning "High CPU usage: ${cpu_percent}% (threshold: ${ALERT_THRESHOLD_CPU}%)"
        fi
        
        if (( $(echo "$memory_usage > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
            log_warning "High memory usage: ${memory_usage}MiB (threshold: ${ALERT_THRESHOLD_MEMORY}MiB)"
        fi
    else
        log_error "Could not retrieve container stats"
    fi
}

# Check disk usage
check_disk_usage() {
    log_info "Checking disk usage..."
    
    # Check uploaded reportings directory
    if [ -d "./UPLOADED_REPORTINGS" ]; then
        local upload_size=$(du -sh ./UPLOADED_REPORTINGS | cut -f1)
        log_info "Uploaded reportings size: $upload_size"
    fi
    
    # Check Docker volumes
    local volume_info=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}" 2>/dev/null)
    if [ -n "$volume_info" ]; then
        log_info "Docker system usage:"
        echo "$volume_info" | while read line; do
            log_info "  $line"
        done
    fi
}

# Check logs for errors
check_application_logs() {
    log_info "Checking application logs for errors..."
    
    # Check for recent errors in container logs
    local error_count=$(docker logs --since="1h" $CONTAINER_NAME 2>&1 | grep -i "error\|fail\|exception" | wc -l)
    
    if [ "$error_count" -gt 0 ]; then
        log_warning "Found $error_count error(s) in the last hour"
        
        # Show recent errors
        log_info "Recent errors:"
        docker logs --since="1h" $CONTAINER_NAME 2>&1 | grep -i "error\|fail\|exception" | tail -5 | while read line; do
            log_warning "  $line"
        done
    else
        log_success "No errors found in recent logs"
    fi
}

# Performance test
performance_test() {
    log_info "Running performance test..."
    
    local start_time=$(date +%s%N)
    curl -s "$BASE_URL/complete_dashboard.html" > /dev/null
    local end_time=$(date +%s%N)
    
    local response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
    
    log_info "Dashboard response time: ${response_time}ms"
    
    if [ $response_time -lt 1000 ]; then
        log_success "Performance: EXCELLENT (${response_time}ms)"
    elif [ $response_time -lt 3000 ]; then
        log_success "Performance: GOOD (${response_time}ms)"
    else
        log_warning "Performance: SLOW (${response_time}ms)"
    fi
}

# File system check
check_file_system() {
    log_info "Checking file system integrity..."
    
    # Check if file listing is up to date
    if docker exec $CONTAINER_NAME sh -c "test -f /app/UPLOADED_REPORTINGS/file_listing.json"; then
        local file_count=$(docker exec $CONTAINER_NAME sh -c "python3 /app/generate-file-listing.py 2>/dev/null | grep 'Total files found:' | awk '{print \$4}'" || echo "0")
        log_info "Total files in system: $file_count"
        
        if [ "$file_count" -gt 0 ]; then
            log_success "File system: Files detected"
        else
            log_info "File system: No files uploaded yet"
        fi
    else
        log_warning "File listing not found"
    fi
}

# Generate summary report
generate_summary() {
    log_info "Generating monitoring summary..."
    
    echo ""
    echo "📊 BCP Securities Services - Monitoring Summary"
    echo "=============================================="
    echo "Timestamp: $(date)"
    echo "Container: $CONTAINER_NAME"
    echo "Monitoring Log: $LOG_FILE"
    echo ""
    
    # Count recent log entries
    local success_count=$(grep -c "SUCCESS" "$LOG_FILE" | tail -1 || echo "0")
    local warning_count=$(grep -c "WARNING" "$LOG_FILE" | tail -1 || echo "0")
    local error_count=$(grep -c "ERROR" "$LOG_FILE" | tail -1 || echo "0")
    
    echo "Recent Status:"
    echo "  ✅ Successes: $success_count"
    echo "  ⚠️  Warnings: $warning_count"
    echo "  ❌ Errors: $error_count"
    echo ""
    
    if [ "$error_count" -eq 0 ] && [ "$warning_count" -eq 0 ]; then
        echo "🎉 System Status: HEALTHY"
    elif [ "$error_count" -eq 0 ]; then
        echo "⚠️  System Status: STABLE (with warnings)"
    else
        echo "🚨 System Status: NEEDS ATTENTION"
    fi
}

# Continuous monitoring mode
continuous_monitoring() {
    local interval=${1:-300}  # Default 5 minutes
    
    log_info "Starting continuous monitoring (interval: ${interval}s)"
    
    while true; do
        echo ""
        log_info "=== Monitoring Cycle Started ==="
        
        check_container_health
        check_endpoints
        check_resource_usage
        check_application_logs
        performance_test
        
        log_info "=== Monitoring Cycle Completed ==="
        
        sleep $interval
    done
}

# Main script
main() {
    echo "📊 BCP Securities Services - Production Monitoring"
    echo "=================================================="
    
    setup_monitoring
    
    case "${1:-check}" in
        "check")
            check_container_health
            check_endpoints
            check_resource_usage
            check_disk_usage
            check_application_logs
            performance_test
            check_file_system
            generate_summary
            ;;
        "continuous")
            continuous_monitoring "${2:-300}"
            ;;
        "health")
            check_container_health
            check_endpoints
            ;;
        "performance")
            performance_test
            ;;
        "logs")
            check_application_logs
            ;;
        "resources")
            check_resource_usage
            check_disk_usage
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  check        - Run complete monitoring check (default)"
            echo "  continuous   - Start continuous monitoring [interval_seconds]"
            echo "  health       - Check container and endpoint health"
            echo "  performance  - Run performance test"
            echo "  logs         - Check application logs for errors"
            echo "  resources    - Check resource usage and disk space"
            echo "  help         - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 check"
            echo "  $0 continuous 60"
            echo "  $0 health"
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
