#!/bin/bash

# Get environment from argument or use staging as default
ENV=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${ENV}"

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

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists in container
if ! docker compose exec api test -f /app/pkg/database/${DB_NAME}; then
    echo "Database ${DB_NAME} does not exist in ${ENV} environment. Cannot create backup."
    exit 1
fi

# Create the backup
if ! docker compose exec api sqlite3 /app/pkg/database/${DB_NAME} ".backup '/app/pkg/database/backup_${TIMESTAMP}.db'"; then
    echo "Failed to create backup of ${DB_NAME}"
    exit 1
fi

# Copy the backup from the container
if ! docker compose cp api:/app/pkg/database/backup_${TIMESTAMP}.db "${BACKUP_DIR}/backup_${TIMESTAMP}.db"; then
    echo "Failed to copy backup from container"
    docker compose exec api rm /app/pkg/database/backup_${TIMESTAMP}.db 2>/dev/null
    exit 1
fi

# Remove the backup file from the container
docker compose exec api rm /app/pkg/database/backup_${TIMESTAMP}.db

echo "Backup created at ${BACKUP_DIR}/backup_${TIMESTAMP}.db for ${ENV} environment (${DB_NAME})" 