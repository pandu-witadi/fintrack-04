#!/bin/bash

# FinTrack Docker Upload Directory Backup and Restore Script
# Backs up and restores the upload directory from the Docker container
# Usage:
#   ./docker-fintrack-upload.sh --backup --file db-2025-11-10
#   ./docker-fintrack-upload.sh --restore --file fintrack_upload_db-2025-11-10.tgz
#   ./docker-fintrack-upload.sh --list

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="fintrack-app"
UPLOAD_CONTAINER_PATH="/app/backend/upload"
BACKUP_DIR="./upload_backups"
DUMP_DIR="upload_temp"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Print usage
usage() {
    echo -e "${YELLOW}FinTrack Docker Upload Directory Backup and Restore Script${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 --backup --file <filename>"
    echo "  $0 --restore --file <filename>"
    echo "  $0 --list"
    echo ""
    echo "Examples:"
    echo "  $0 --backup --file db-2025-11-10"
    echo "  $0 --restore --file fintrack_upload_db-2025-11-10.tgz"
    echo "  $0 --list"
    echo ""
    echo "Notes:"
    echo "  - Requires Docker Compose services to be running"
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

# Check if Docker is running and container exists
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker not found. Please install Docker."
    fi

    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        error "Container '${CONTAINER_NAME}' is not running. Start Docker Compose first: docker compose up -d"
    fi

    log "Docker container '${CONTAINER_NAME}' is running"
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

    log "Starting upload directory backup from Docker container..."
    log "Container: $CONTAINER_NAME"
    log "Container path: $UPLOAD_CONTAINER_PATH"

    # Remove temporary directory if exists
    rm -rf "$DUMP_DIR"
    mkdir -p "$DUMP_DIR"

    # Copy upload directory from container to host
    log "Copying upload directory from container..."
    docker cp "$CONTAINER_NAME:$UPLOAD_CONTAINER_PATH" "$DUMP_DIR/upload" || error "Failed to copy upload directory from container"

    # Check if copied directory has content
    if [[ -z $(ls -A "$DUMP_DIR/upload" 2>/dev/null) ]]; then
        log "Warning: Upload directory is empty, creating empty backup"
    fi

    # Create tar.gz archive
    local archive_name="fintrack_upload_${filename}.tgz"
    local archive_path="$BACKUP_DIR/$archive_name"

    log "Creating compressed archive: $archive_name"
    tar -czf "$archive_path" -C "$DUMP_DIR" upload/ || error "Failed to create archive"

    # Clean up temporary directory
    rm -rf "$DUMP_DIR"

    # Display file size
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

    log "Starting upload directory restore to Docker container..."
    log "Archive: $archive_path"
    log "Container: $CONTAINER_NAME"
    log "Container path: $UPLOAD_CONTAINER_PATH"

    # Remove temporary directory if exists
    rm -rf "$DUMP_DIR"
    mkdir -p "$DUMP_DIR"

    # Extract archive
    log "Extracting archive..."
    tar -xzf "$archive_path" -C "$DUMP_DIR" || error "Failed to extract archive"

    # Remove existing upload content in container
    log "Clearing existing upload directory in container..."
    docker exec "$CONTAINER_NAME" sh -c "rm -rf $UPLOAD_CONTAINER_PATH/*" || error "Failed to clear upload directory in container"

    # Copy restored files to container
    log "Copying restored files to container..."
    docker cp "$DUMP_DIR/upload/." "$CONTAINER_NAME:$UPLOAD_CONTAINER_PATH/" || error "Failed to copy files to container"

    # Clean up temporary directory
    rm -rf "$DUMP_DIR"

    log "${GREEN}Restore completed successfully!${NC}"
    log "Files restored to container: $CONTAINER_NAME:$UPLOAD_CONTAINER_PATH"
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
    # Show help if no arguments
    if [[ $# -eq 0 ]]; then
        usage
        exit 0
    fi

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

    # Check Docker (not needed for list)
    if [[ $action != "list" ]]; then
        check_docker
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

# Run main function with error handling
if ! main "$@"; then
    exit 1
fi
