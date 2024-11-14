#!/bin/bash

# Get the current timestamp
timestamp=$(date +%Y%m%d%H%M%S)

# Define the migration name
migration_name=$1

# Define the migrations directory path
migrations_dir="pkg/database/migrations"

# Create the migrations directory if it doesn't exist
mkdir -p "$migrations_dir"

# Create the migration files
touch "${migrations_dir}/${timestamp}_${migration_name}.up.sql"
touch "${migrations_dir}/${timestamp}_${migration_name}.down.sql"

echo "Created migration files:"
echo "${migrations_dir}/${timestamp}_${migration_name}.up.sql"
echo "${migrations_dir}/${timestamp}_${migration_name}.down.sql"