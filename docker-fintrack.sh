#!/bin/bash

# FinTrack Docker MongoDB Backup and Restore Script
# Works with the Docker Compose setup (fintrack-mongodb container)
# Usage:
#   ./docker-fintrack.sh --backup --file db-2025-11-10
#   ./docker-fintrack.sh --restore --file fintrack_mongodb_db-2025-11-10.tgz
#   ./docker-fintrack.sh --list

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="fintrack-mongodb"
DATABASE_NAME="fintrack-04"
BACKUP_DIR="./mongodb_backups"
DUMP_DIR="mongodump_temp"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Print usage
usage() {
    echo -e "${YELLOW}FinTrack Docker MongoDB Backup and Restore Script${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 --backup --file <filename>"
    echo "  $0 --restore --file <filename>"
    echo "  $0 --list"
    echo ""
    echo "Examples:"
    echo "  $0 --backup --file db-2025-11-10"
    echo "  $0 --restore --file fintrack_mongodb_db-2025-11-10.tgz"
    echo "  $0 --list"
    echo ""
    echo "Notes:"
    echo "  - Requires Docker Compose services to be running"
    echo "  - Backup files are stored in ./mongodb_backups/ directory"
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

    log "Starting MongoDB backup from Docker container..."
    log "Database: $DATABASE_NAME"
    log "Container: $CONTAINER_NAME"

    # Remove temporary dump directory if exists
    rm -rf "$DUMP_DIR"
    mkdir -p "$DUMP_DIR"

    # Run mongodump inside the MongoDB container and copy to host
    log "Running mongodump inside container..."
    docker exec "$CONTAINER_NAME" mongodump --db="$DATABASE_NAME" --out=/tmp/mongodump || error "mongodump failed inside container"

    # Copy dump from container to host
    log "Copying dump from container to host..."
    docker cp "$CONTAINER_NAME:/tmp/mongodump/$DATABASE_NAME" "$DUMP_DIR/$DATABASE_NAME" || error "Failed to copy dump from container"

    # Clean up dump inside container
    docker exec "$CONTAINER_NAME" rm -rf /tmp/mongodump

    # Create tar.gz archive
    local archive_name="fintrack_mongodb_${filename}.tgz"
    local archive_path="$BACKUP_DIR/$archive_name"

    log "Creating compressed archive: $archive_name"
    tar -czf "$archive_path" -C "$DUMP_DIR" . || error "Failed to create archive"

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

    log "Starting MongoDB restore to Docker container..."
    log "Archive: $archive_path"
    log "Database: $DATABASE_NAME"
    log "Container: $CONTAINER_NAME"

    # Remove temporary dump directory if exists
    rm -rf "$DUMP_DIR"
    mkdir -p "$DUMP_DIR"

    # Extract archive
    log "Extracting archive..."
    tar -xzf "$archive_path" -C "$DUMP_DIR" || error "Failed to extract archive"

    # Copy dump to container
    log "Copying dump to container..."
    docker cp "$DUMP_DIR" "$CONTAINER_NAME:/tmp/mongorestore" || error "Failed to copy dump to container"

    # Run mongorestore inside the MongoDB container
    log "Running mongorestore inside container..."
    docker exec "$CONTAINER_NAME" mongorestore --db="$DATABASE_NAME" /tmp/mongorestore/$DATABASE_NAME || error "mongorestore failed inside container"

    # Clean up inside container
    docker exec "$CONTAINER_NAME" rm -rf /tmp/mongorestore

    # Clean up temporary directory
    rm -rf "$DUMP_DIR"

    log "${GREEN}Restore completed successfully!${NC}"
}

# List backups function
list_backups() {
    log "Available MongoDB backups:"
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
