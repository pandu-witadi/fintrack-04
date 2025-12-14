#!/bin/bash

# FinTrack Upload Directory Backup and Restore Script
# Backs up and restores the backend/upload directory containing picture files
# Usage:
#   ./fintrack.sh --backup --file db-2025-11-10.tgz --upload
#   ./fintrack.sh --restore --file fintrack_upload_2025-11-10.tgz --upload

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
UPLOAD_DIR="./backend/upload"
BACKUP_DIR="./upload_backups"
DUMP_DIR="upload_temp"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Print usage
usage() {
    echo -e "${YELLOW}FinTrack Upload Directory Backup and Restore Script${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 --backup --file <filename>"
    echo "  $0 --restore --file <filename>"
    echo ""
    echo "Examples:"
    echo "  $0 --backup --file db-2025-11-10.tgz"
    echo "  $0 --restore --file fintrack_upload_2025-11-10.tgz"
    echo ""
    echo "Notes:"
    echo "  - Backup files are stored in ./upload_backups/ directory"
    echo "  - Filename without .tgz extension will be auto-completed during backup"
    echo "  - Restore can accept filename with or without .tgz extension"
    echo ""
}

# Log function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Error function
error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

# Check if upload directory exists
check_upload_dir() {
    if [[ ! -d $UPLOAD_DIR ]]; then
        error "Upload directory not found: $UPLOAD_DIR"
    fi
    log "Upload directory found: $UPLOAD_DIR"
}

# Backup function
backup() {
    local filename=$1
    
    if [[ -z $filename ]]; then
        error "Filename is required for backup"
    fi
    
    # Remove .tgz extension if provided
    filename="${filename%.tgz}"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    log "Starting upload directory backup..."
    log "Source directory: $UPLOAD_DIR"
    
    # Remove temporary directory if exists
    rm -rf "$DUMP_DIR"
    mkdir -p "$DUMP_DIR"
    
    # Copy upload directory to temporary location
    if [[ -d $UPLOAD_DIR ]] && [[ ! -z $(ls -A "$UPLOAD_DIR" 2>/dev/null) ]]; then
        log "Copying upload directory..."
        cp -r "$UPLOAD_DIR" "$DUMP_DIR/upload" || error "Failed to copy upload directory"
    else
        log "Warning: Upload directory is empty or does not exist, creating empty backup"
        mkdir -p "$DUMP_DIR/upload"
    fi
    
    # Create tar.gz archive
    local archive_name="fintrack_upload_${filename}.tgz"
    local archive_path="$BACKUP_DIR/$archive_name"
    
    log "Creating compressed archive: $archive_name"
    tar -czf "$archive_path" -C "$DUMP_DIR" upload/ || error "Failed to create archive"
    
    # Clean up temporary directory
    rm -rf "$DUMP_DIR"
    
    # Display file size and file count
    local file_size=$(du -h "$archive_path" | cut -f1)
    log "${GREEN}Backup completed successfully!${NC}"
    log "Archive saved to: $archive_path"
    log "File size: $file_size"
}

# Restore function
restore() {
    local filename=$1
    
    if [[ -z $filename ]]; then
        error "Filename is required for restore"
    fi
    
    # Ensure filename ends with .tgz
    if [[ ! $filename == *.tgz ]]; then
        filename="${filename}.tgz"
    fi
    
    local archive_path="$BACKUP_DIR/$filename"
    
    # Check if file exists
    if [[ ! -f $archive_path ]]; then
        error "Archive not found: $archive_path"
    fi
    
    log "Starting upload directory restore..."
    log "Archive: $archive_path"
    log "Target directory: $UPLOAD_DIR"
    
    # Remove temporary directory if exists
    rm -rf "$DUMP_DIR"
    mkdir -p "$DUMP_DIR"
    
    # Extract archive
    log "Extracting archive..."
    tar -xzf "$archive_path" -C "$DUMP_DIR" || error "Failed to extract archive"
    
    # Backup current upload directory if it exists
    if [[ -d $UPLOAD_DIR ]]; then
        local backup_timestamp=$(date +"%Y%m%d_%H%M%S")
        local backup_name="upload_backup_${backup_timestamp}"
        log "Backing up current upload directory as: $backup_name"
        mv "$UPLOAD_DIR" "${UPLOAD_DIR}_${backup_timestamp}" || error "Failed to backup current upload directory"
    fi
    
    # Move extracted directory to target location
    log "Moving restored files to target location..."
    mv "$DUMP_DIR/upload" "$UPLOAD_DIR" || error "Failed to restore upload directory"
    
    # Clean up temporary directory
    rm -rf "$DUMP_DIR"
    
    log "${GREEN}Restore completed successfully!${NC}"
    log "Files restored to: $UPLOAD_DIR"
}

# List backups function
list_backups() {
    log "Available upload backups:"
    if [[ -d $BACKUP_DIR ]]; then
        if ls "$BACKUP_DIR"/*.tgz 1> /dev/null 2>&1; then
            ls -lh "$BACKUP_DIR"/*.tgz
        else
            echo "No backups found"
        fi
    else
        echo "No backups directory found"
    fi
}

# Main script
main() {
    local action=""
    local filename=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backup)
                action="backup"
                shift
                ;;
            --restore)
                action="restore"
                shift
                ;;
            --file)
                filename="$2"
                shift 2
                ;;
            --list)
                action="list"
                shift
                ;;
            --help|-h)
                usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Validate action
    if [[ -z $action ]]; then
        error "Action is required (--backup, --restore, or --list)"
    fi
    
    # Check upload directory exists (except for restore and list)
    if [[ $action != "restore" ]]; then
        check_upload_dir
    fi
    
    # Execute action
    case $action in
        backup)
            backup "$filename"
            ;;
        restore)
            restore "$filename"
            ;;
        list)
            list_backups
            ;;
    esac
}

# Run main function
main "$@"
