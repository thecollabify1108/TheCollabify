#!/bin/bash

# Azure to DigitalOcean Backup Script
# Dumps PostgreSQL from Azure and uploads to DigitalOcean Spaces (S3 compatible)

# 1. Environment Variables (Should be loaded from 1Password/Env)
# DATABASE_URL: connection string
# DO_SPACES_KEY: DO access key
# DO_SPACES_SECRET: DO secret key
# DO_SPACES_BUCKET: bucket name 
# DO_SPACES_REGION: e.g. nyc3

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/backups"
FILE_NAME="collabify_prod_${TIMESTAMP}.sql.gz"

mkdir -p $BACKUP_DIR

echo "🚀 Starting Backup: ${FILE_NAME}"

# 2. Perform Dump
# Using pg_dump with the connection URL
pg_dump $DATABASE_URL | gzip > ${BACKUP_DIR}/${FILE_NAME}

if [ $? -eq 0 ]; then
    echo "✅ Dump successful. Uploading to DigitalOcean Spaces..."
    
    # 3. Upload to DO Spaces using s3cmd or AWS CLI
    # Assuming s3cmd is configured on the Droplet
    s3cmd put ${BACKUP_DIR}/${FILE_NAME} s3://${DO_SPACES_BUCKET}/backups/${FILE_NAME}
    
    if [ $? -eq 0 ]; then
        echo "🎉 Backup successfully uploaded to DigitalOcean Spaces!"
        # 4. Cleanup local file
        rm ${BACKUP_DIR}/${FILE_NAME}
    else
        echo "❌ Upload failed!"
        exit 1
    fi
else
    echo "❌ Dump failed!"
    exit 1
fi

# 5. Optional: Prune old backups (keep last 30 days)
# s3cmd ls s3://${DO_SPACES_BUCKET}/backups/ | ... logic here
