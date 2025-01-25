#!/bin/bash
# example: ./scripts/create-app-local.sh "0000002.test" "Internal test app" "Peace and love" "test.zcauldron.com"

# Get input parameters
APP_ID=$1
APP_NAME=$2
APP_DESCRIPTION=$3
APP_DOMAIN=$4

# Execute the D1 command
npx wrangler d1 execute auth_storage --command "INSERT INTO apps (id, name, description, domain) VALUES ('$APP_ID', '$APP_NAME', '$APP_DESCRIPTION', '$APP_DOMAIN');"