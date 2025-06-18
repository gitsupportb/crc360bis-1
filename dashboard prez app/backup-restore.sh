#!/bin/bash

# BCP Securities Services - Backup and Restore Script
# Manages data backup and restoration for the Docker deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="bcp-securities-dashboard"

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

# Create backup directory
setup_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_success "Created backup directory: $BACKUP_DIR"
    fi
}

# Backup uploaded reportings
backup_reportings() {
    log_info "Backing up uploaded reportings..."
    
    local backup_file="$BACKUP_DIR/reportings_$TIMESTAMP.tar.gz"
    
    if [ -d "./UPLOADED_REPORTINGS" ]; then
        tar -czf "$backup_file" -C . UPLOADED_REPORTINGS
        log_success "Reportings backed up to: $backup_file"
        
        # Show backup size
        local size=$(du -h "$backup_file" | cut -f1)
        log_info "Backup size: $size"
    else
        log_warning "UPLOADED_REPORTINGS directory not found"
    fi
}

# Backup Docker volumes
backup_volumes() {
    log_info "Backing up Docker volumes..."
    
    # Check if container is running
    if ! docker ps | grep -q $CONTAINER_NAME; then
        log_warning "Container is not running. Starting temporarily for backup..."
        docker-compose up -d
        sleep 5
    fi
    
    # Backup uploaded reportings volume
    local reportings_backup="$BACKUP_DIR/volume_reportings_$TIMESTAMP.tar.gz"
    docker run --rm \
        -v dashboard-prez-app_uploaded_reportings:/data:ro \
        -v "$(pwd)/$BACKUP_DIR":/backup \
        alpine tar czf "/backup/volume_reportings_$TIMESTAMP.tar.gz" -C /data .
    
    if [ -f "$reportings_backup" ]; then
        log_success "Volume reportings backed up to: $reportings_backup"
    fi
    
    # Backup application data volume
    local data_backup="$BACKUP_DIR/volume_data_$TIMESTAMP.tar.gz"
    docker run --rm \
        -v dashboard-prez-app_dashboard_data:/data:ro \
        -v "$(pwd)/$BACKUP_DIR":/backup \
        alpine tar czf "/backup/volume_data_$TIMESTAMP.tar.gz" -C /data .
    
    if [ -f "$data_backup" ]; then
        log_success "Volume data backed up to: $data_backup"
    fi
    
    # Backup logs volume
    local logs_backup="$BACKUP_DIR/volume_logs_$TIMESTAMP.tar.gz"
    docker run --rm \
        -v dashboard-prez-app_dashboard_logs:/data:ro \
        -v "$(pwd)/$BACKUP_DIR":/backup \
        alpine tar czf "/backup/volume_logs_$TIMESTAMP.tar.gz" -C /data .
    
    if [ -f "$logs_backup" ]; then
        log_success "Volume logs backed up to: $logs_backup"
    fi
}

# Backup configuration files
backup_config() {
    log_info "Backing up configuration files..."
    
    local config_backup="$BACKUP_DIR/config_$TIMESTAMP.tar.gz"
    
    # Files to backup
    local config_files=(
        "ALL_REPORTINGS.json"
        ".env"
        "docker-compose.yml"
        "Dockerfile"
    )
    
    local existing_files=()
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            existing_files+=("$file")
        fi
    done
    
    if [ ${#existing_files[@]} -gt 0 ]; then
        tar -czf "$config_backup" "${existing_files[@]}"
        log_success "Configuration backed up to: $config_backup"
    else
        log_warning "No configuration files found to backup"
    fi
}

# Full backup
full_backup() {
    log_info "Performing full backup..."
    
    setup_backup_dir
    backup_reportings
    backup_volumes
    backup_config
    
    # Create backup manifest
    local manifest="$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt"
    {
        echo "BCP Securities Services - Backup Manifest"
        echo "=========================================="
        echo "Timestamp: $(date)"
        echo "Backup ID: $TIMESTAMP"
        echo ""
        echo "Files included in this backup:"
        ls -la "$BACKUP_DIR"/*_$TIMESTAMP.*
    } > "$manifest"
    
    log_success "Full backup completed. Manifest: $manifest"
}

# List available backups
list_backups() {
    log_info "Available backups:"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        log_warning "No backups found"
        return
    fi
    
    echo ""
    echo "Backup files:"
    ls -la "$BACKUP_DIR"
    
    echo ""
    echo "Backup manifests:"
    find "$BACKUP_DIR" -name "backup_manifest_*.txt" -exec echo "📄 {}" \; -exec head -10 {} \; -exec echo "" \;
}

# Restore from backup
restore_backup() {
    local backup_id="$1"
    
    if [ -z "$backup_id" ]; then
        log_error "Please specify a backup ID (timestamp)"
        log_info "Use 'list' command to see available backups"
        return 1
    fi
    
    log_info "Restoring from backup: $backup_id"
    
    # Stop services
    log_info "Stopping services..."
    docker-compose down
    
    # Restore reportings
    local reportings_backup="$BACKUP_DIR/reportings_$backup_id.tar.gz"
    if [ -f "$reportings_backup" ]; then
        log_info "Restoring reportings..."
        rm -rf ./UPLOADED_REPORTINGS
        tar -xzf "$reportings_backup" -C .
        log_success "Reportings restored"
    fi
    
    # Restore volumes
    local volume_reportings="$BACKUP_DIR/volume_reportings_$backup_id.tar.gz"
    if [ -f "$volume_reportings" ]; then
        log_info "Restoring reportings volume..."
        docker volume rm dashboard-prez-app_uploaded_reportings 2>/dev/null || true
        docker volume create dashboard-prez-app_uploaded_reportings
        docker run --rm \
            -v dashboard-prez-app_uploaded_reportings:/data \
            -v "$(pwd)/$BACKUP_DIR":/backup \
            alpine tar xzf "/backup/volume_reportings_$backup_id.tar.gz" -C /data
        log_success "Reportings volume restored"
    fi
    
    local volume_data="$BACKUP_DIR/volume_data_$backup_id.tar.gz"
    if [ -f "$volume_data" ]; then
        log_info "Restoring data volume..."
        docker volume rm dashboard-prez-app_dashboard_data 2>/dev/null || true
        docker volume create dashboard-prez-app_dashboard_data
        docker run --rm \
            -v dashboard-prez-app_dashboard_data:/data \
            -v "$(pwd)/$BACKUP_DIR":/backup \
            alpine tar xzf "/backup/volume_data_$backup_id.tar.gz" -C /data
        log_success "Data volume restored"
    fi
    
    # Restore configuration
    local config_backup="$BACKUP_DIR/config_$backup_id.tar.gz"
    if [ -f "$config_backup" ]; then
        log_warning "Configuration backup found. Restore manually if needed:"
        log_info "tar -xzf $config_backup"
    fi
    
    # Restart services
    log_info "Restarting services..."
    docker-compose up -d
    
    log_success "Restore completed"
}

# Clean old backups
clean_backups() {
    local days="${1:-30}"
    
    log_info "Cleaning backups older than $days days..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "Backup directory does not exist"
        return
    fi
    
    local deleted=0
    while IFS= read -r -d '' file; do
        rm "$file"
        deleted=$((deleted + 1))
        log_info "Deleted: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$days -print0)
    
    # Clean old manifests
    while IFS= read -r -d '' file; do
        rm "$file"
        deleted=$((deleted + 1))
        log_info "Deleted: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "backup_manifest_*.txt" -mtime +$days -print0)
    
    if [ $deleted -eq 0 ]; then
        log_info "No old backups found to clean"
    else
        log_success "Cleaned $deleted old backup files"
    fi
}

# Main script
main() {
    echo "💾 BCP Securities Services - Backup & Restore"
    echo "=============================================="
    
    case "${1:-help}" in
        "backup"|"full")
            full_backup
            ;;
        "list")
            list_backups
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "clean")
            clean_backups "$2"
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  backup       - Perform full backup"
            echo "  list         - List available backups"
            echo "  restore ID   - Restore from backup (use timestamp ID)"
            echo "  clean [days] - Clean backups older than N days (default: 30)"
            echo "  help         - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 backup"
            echo "  $0 list"
            echo "  $0 restore 20250127_143000"
            echo "  $0 clean 7"
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
