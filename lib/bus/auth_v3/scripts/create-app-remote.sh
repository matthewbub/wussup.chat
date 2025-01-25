#!/bin/bash
# example: ./create-app-remote.sh 0000001 "Internal Admin" "Root app for internal admin" "intl-admin.zcauldron.com"

# Get input parameters
APP_ID=$1
APP_NAME=$2
APP_DESCRIPTION=$3
APP_DOMAIN=$4

# Execute the D1 command
npx wrangler d1 execute auth_storage --remote --command "INSERT INTO apps (id, name, description, domain) VALUES ('$APP_ID', '$APP_NAME', '$APP_DESCRIPTION', '$APP_DOMAIN');"