#!/bin/bash

# Get environment and backup file from arguments
ENV=${1:-staging}
BACKUP_FILE=$2

# Function to get database name based on environment
get_db_name() {
    local env=$1
    case $env in
        "production")
            echo "prod.db"
            ;;
        "staging")
            echo "staging.db"
            ;;
        "development")
            echo "dev.db"
            ;;
        "test")
            echo "test.db"
            ;;
        *)
            echo "dev.db"
            ;;
    esac
}

DB_NAME=$(get_db_name "$ENV")

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh [environment] <backup_file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Ensure database directory exists in container
docker compose exec api mkdir -p /app/pkg/database

# Copy the backup file to the container
if ! docker compose cp "$BACKUP_FILE" api:/app/pkg/database/restore.db; then
    echo "Failed to copy backup file to container"
    exit 1
fi

# Restore the backup
if ! docker compose exec api sqlite3 /app/pkg/database/${DB_NAME} ".restore '/app/pkg/database/restore.db'"; then
    echo "Failed to restore backup to ${DB_NAME}"
    docker compose exec api rm /app/pkg/database/restore.db 2>/dev/null
    exit 1
fi

# Clean up
docker compose exec api rm /app/pkg/database/restore.db

echo "Database restored from $BACKUP_FILE to ${ENV} environment (${DB_NAME})" 