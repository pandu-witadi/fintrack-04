#!/bin/bash

# FinTrack MongoDB Backup and Restore Script
# Usage:
#   ./fintrack.sh --backup --file db-2025-11-10.tgz
#   ./fintrack.sh --restore --file db-2025-11-10.tgz

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/fintrack-04}"
BACKUP_DIR="./mongodb_backups"
DUMP_DIR="mongodump_temp"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Parse MongoDB URI to extract components
parse_mongodb_uri() {
    local uri=$1
    
    # Remove protocol
    local rest="${uri#mongodb://}"
    
    # Extract auth if present
    if [[ $rest == *"@"* ]]; then
        local auth="${rest%%@*}"
        rest="${rest#*@}"
        MONGO_USER="${auth%%:*}"
        MONGO_PASS="${auth#*:}"
    fi
    
    # Extract host and port
    local host_port="${rest%%/*}"
    MONGO_HOST="${host_port%%:*}"
    MONGO_PORT="${host_port##*:}"
    [[ $MONGO_PORT == $MONGO_HOST ]] && MONGO_PORT="27017"
    
    # Extract database name
    MONGO_DB="${rest##*/}"
    [[ -z $MONGO_DB ]] && MONGO_DB="fintrack-04"
}

# Print usage
usage() {
    echo -e "${YELLOW}FinTrack MongoDB Backup and Restore Script${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 --backup --file <filename>"
    echo "  $0 --restore --file <filename>"
    echo ""
    echo "Examples:"
    echo "  $0 --backup --file db-2025-11-10.tgz"
    echo "  $0 --restore --file fintrack_mongodb_2025-11-10.tgz"
    echo ""
    echo "Environment Variables:"
    echo "  MONGODB_URI    MongoDB connection string (default: mongodb://localhost:27017/fintrack-04)"
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

# Check if mongodump and mongorestore are available
check_mongo_tools() {
    if ! command -v mongodump &> /dev/null; then
        error "mongodump not found. Please install MongoDB tools."
    fi
    if ! command -v mongorestore &> /dev/null; then
        error "mongorestore not found. Please install MongoDB tools."
    fi
    log "MongoDB tools found"
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
    
    log "Starting MongoDB backup..."
    log "MongoDB URI: $MONGODB_URI"
    
    # Remove temporary dump directory if exists
    rm -rf "$DUMP_DIR"
    mkdir -p "$DUMP_DIR"
    
    # Run mongodump
    if [[ -n $MONGO_USER ]] && [[ -n $MONGO_PASS ]]; then
        mongodump --uri="$MONGODB_URI" --out="$DUMP_DIR" || error "mongodump failed"
    else
        mongodump --uri="$MONGODB_URI" --out="$DUMP_DIR" || error "mongodump failed"
    fi
    
    log "Database dumped successfully"
    
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
    
    log "Starting MongoDB restore..."
    log "Archive: $archive_path"
    log "MongoDB URI: $MONGODB_URI"
    
    # Remove temporary dump directory if exists
    rm -rf "$DUMP_DIR"
    mkdir -p "$DUMP_DIR"
    
    # Extract archive
    log "Extracting archive..."
    tar -xzf "$archive_path" -C "$DUMP_DIR" || error "Failed to extract archive"
    
    # Run mongorestore
    if [[ -n $MONGO_USER ]] && [[ -n $MONGO_PASS ]]; then
        mongorestore --uri="$MONGODB_URI" "$DUMP_DIR" || error "mongorestore failed"
    else
        mongorestore --uri="$MONGODB_URI" "$DUMP_DIR" || error "mongorestore failed"
    fi
    
    # Clean up temporary directory
    rm -rf "$DUMP_DIR"
    
    log "${GREEN}Restore completed successfully!${NC}"
}

# List backups function
list_backups() {
    log "Available backups:"
    if [[ -d $BACKUP_DIR ]]; then
        ls -lh "$BACKUP_DIR"/*.tgz 2>/dev/null || echo "No backups found"
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
    
    # Parse MongoDB URI
    parse_mongodb_uri "$MONGODB_URI"
    
    # Check MongoDB tools
    check_mongo_tools
    
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
