#!/bin/bash

# BCP Securities Services - Docker Deployment Test Script
# Comprehensive testing of the containerized dashboard application

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
TIMEOUT=30

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

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

test_start() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "${BLUE}🧪 Test $TESTS_TOTAL: $1${NC}"
}

test_pass() {
    TESTS_PASSED=$((TESTS_PASSED + 1))
    log_success "PASS: $1"
}

test_fail() {
    TESTS_FAILED=$((TESTS_FAILED + 1))
    log_error "FAIL: $1"
}

# Wait for service to be ready
wait_for_service() {
    log_info "Waiting for service to be ready..."

    local count=0
    while [ $count -lt $TIMEOUT ]; do
        if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
            log_success "Service is ready"
            return 0
        fi

        sleep 1
        count=$((count + 1))
        echo -n "."
    done

    log_error "Service failed to start within $TIMEOUT seconds"
    return 1
}

# Test container status
test_container_status() {
    test_start "Container Status"

    if docker ps | grep -q $CONTAINER_NAME; then
        test_pass "Container is running"
    else
        test_fail "Container is not running"
        return 1
    fi
}

# Test health endpoint
test_health_endpoint() {
    test_start "Health Endpoint"

    local response=$(curl -s "$BASE_URL/health")
    if echo "$response" | grep -q '"status": "healthy"'; then
        test_pass "Health endpoint returns healthy status"
    else
        test_fail "Health endpoint not responding correctly"
        echo "Response: $response"
    fi
}

# Test main dashboard
test_main_dashboard() {
    test_start "Main Dashboard"

    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/complete_dashboard.html")
    if [ "$status_code" = "200" ]; then
        test_pass "Main dashboard loads successfully"
    else
        test_fail "Main dashboard failed to load (HTTP $status_code)"
    fi
}

# Test static assets
test_static_assets() {
    test_start "Static Assets"

    local assets=(
        "/ALL_REPORTINGS.json"
        "/reporting-data-manager.js"
        "/file-manager.js"
        "/data-integration-manager.js"
    )

    local failed_assets=0
    for asset in "${assets[@]}"; do
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$asset")
        if [ "$status_code" != "200" ]; then
            log_warning "Asset $asset failed to load (HTTP $status_code)"
            failed_assets=$((failed_assets + 1))
        fi
    done

    if [ $failed_assets -eq 0 ]; then
        test_pass "All static assets load successfully"
    else
        test_fail "$failed_assets static assets failed to load"
    fi
}

# Test data files
test_data_files() {
    test_start "Data Files"

    # Test ALL_REPORTINGS.json structure
    local json_response=$(curl -s "$BASE_URL/ALL_REPORTINGS.json")
    if echo "$json_response" | grep -q '"totalReportings": 68'; then
        test_pass "ALL_REPORTINGS.json contains expected data structure"
    else
        test_fail "ALL_REPORTINGS.json structure is invalid"
        echo "Response preview: $(echo "$json_response" | head -5)"
    fi
}

# Test volume mounts
test_volume_mounts() {
    test_start "Volume Mounts"

    # Check if UPLOADED_REPORTINGS directory is accessible
    if docker exec $CONTAINER_NAME sh -c "test -d /app/UPLOADED_REPORTINGS"; then
        test_pass "UPLOADED_REPORTINGS volume is mounted"
    else
        test_fail "UPLOADED_REPORTINGS volume is not accessible"
    fi

    # Check if logs directory is accessible
    if docker exec $CONTAINER_NAME sh -c "test -d /app/logs"; then
        test_pass "Logs volume is mounted"
    else
        test_fail "Logs volume is not accessible"
    fi
}

# Test file permissions
test_file_permissions() {
    test_start "File Permissions"

    # Check if application can write to UPLOADED_REPORTINGS
    if docker exec $CONTAINER_NAME sh -c "touch /app/UPLOADED_REPORTINGS/test_write.tmp 2>/dev/null"; then
        docker exec $CONTAINER_NAME sh -c "rm -f /app/UPLOADED_REPORTINGS/test_write.tmp"
        test_pass "Application has write permissions to UPLOADED_REPORTINGS"
    else
        test_fail "Application cannot write to UPLOADED_REPORTINGS"
    fi
}

# Test security headers
test_security_headers() {
    test_start "Security Headers"

    local headers=$(curl -s -I "$BASE_URL/complete_dashboard.html")

    local security_checks=0
    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        security_checks=$((security_checks + 1))
    fi
    if echo "$headers" | grep -q "X-Frame-Options"; then
        security_checks=$((security_checks + 1))
    fi
    if echo "$headers" | grep -q "X-XSS-Protection"; then
        security_checks=$((security_checks + 1))
    fi

    if [ $security_checks -ge 2 ]; then
        test_pass "Security headers are present"
    else
        test_fail "Missing security headers"
    fi
}

# Test logging
test_logging() {
    test_start "Application Logging"

    # Check if logs are being generated
    if docker exec $CONTAINER_NAME sh -c "test -f /app/logs/dashboard.log"; then
        local log_size=$(docker exec $CONTAINER_NAME sh -c "stat -c%s /app/logs/dashboard.log")
        if [ "$log_size" -gt 0 ]; then
            test_pass "Application is generating logs"
        else
            test_fail "Log file exists but is empty"
        fi
    else
        test_fail "Log file does not exist"
    fi
}

# Test resource usage
test_resource_usage() {
    test_start "Resource Usage"

    local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}" $CONTAINER_NAME)
    if [ $? -eq 0 ]; then
        test_pass "Container resource monitoring is working"
        log_info "Resource stats: $stats"
    else
        test_fail "Cannot retrieve container resource stats"
    fi
}

# Test dashboard functionality
test_dashboard_functionality() {
    test_start "Dashboard Functionality"

    # Test if the dashboard contains expected elements
    local dashboard_content=$(curl -s "$BASE_URL/complete_dashboard.html")

    local functionality_checks=0
    if echo "$dashboard_content" | grep -q "BCP Securities Services"; then
        functionality_checks=$((functionality_checks + 1))
    fi
    if echo "$dashboard_content" | grep -q "All reportings"; then
        functionality_checks=$((functionality_checks + 1))
    fi
    if echo "$dashboard_content" | grep -q "Monthly tasks"; then
        functionality_checks=$((functionality_checks + 1))
    fi

    if [ $functionality_checks -ge 2 ]; then
        test_pass "Dashboard contains expected functionality"
    else
        test_fail "Dashboard missing expected functionality"
    fi
}

# Performance test
test_performance() {
    test_start "Performance"

    local start_time=$(date +%s%N)
    curl -s "$BASE_URL/complete_dashboard.html" > /dev/null
    local end_time=$(date +%s%N)

    local response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

    if [ $response_time -lt 2000 ]; then  # Less than 2 seconds
        test_pass "Dashboard loads in acceptable time (${response_time}ms)"
    else
        test_warning "Dashboard load time is slow (${response_time}ms)"
    fi
}

# Main test execution
main() {
    echo "🧪 BCP Securities Services - Docker Deployment Tests"
    echo "===================================================="
    echo ""

    # Wait for service to be ready
    if ! wait_for_service; then
        log_error "Service is not ready. Aborting tests."
        exit 1
    fi

    echo ""
    log_info "Running comprehensive tests..."
    echo ""

    # Run all tests
    test_container_status
    test_health_endpoint
    test_main_dashboard
    test_static_assets
    test_data_files
    test_volume_mounts
    test_file_permissions
    test_security_headers
    test_logging
    test_resource_usage
    test_dashboard_functionality
    test_performance

    # Summary
    echo ""
    echo "📊 Test Summary"
    echo "==============="
    echo "Total Tests: $TESTS_TOTAL"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"

    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        log_success "🎉 All tests passed! Deployment is successful."
        echo ""
        log_info "Dashboard is available at: $BASE_URL"
        log_info "Health check: $BASE_URL/health"
        exit 0
    else
        echo ""
        log_error "❌ $TESTS_FAILED tests failed. Please check the deployment."
        exit 1
    fi
}

# Run main function
main "$@"
