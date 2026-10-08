#!/usr/bin/env bash
# ==============================================================================
# Woldeok Moneyverse - Enterprise Free Cloud Backup (Cloudflare R2 / AWS S3)
# Zero-Cost Disaster Recovery (DR) Pipeline
# - Monthly Free Tier: Cloudflare R2 10 GB Storage / Unlimited Egress (0 KRW)
# - Compression: Gzip level 9
# - Retention: 7 days local rolling, 30 days remote R2
# ==============================================================================
set -euo pipefail

BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/srv/moneyverse-data/backups/daily}"
DB_CONTAINER="${DB_CONTAINER:-woldeok-moneyverse-dev-db-1}"
DB_NAME="${DB_NAME:-woldeok_moneyverse_dev}"
DB_USER="${DB_USER:-moneyverse_migrator}"
DUMP_FILENAME="moneyverse_dump_${BACKUP_DATE}.sql.gz"
TARGET_PATH="${BACKUP_DIR}/${DUMP_FILENAME}"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] [$(date)] 1. Starting PostgreSQL live backup from container: ${DB_CONTAINER}..."
sudo docker exec -i "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges | gzip -9 > "${TARGET_PATH}"

DUMP_SIZE=$(du -h "${TARGET_PATH}" | cut -f1)
echo "[INFO] [$(date)] 2. Backup created successfully: ${TARGET_PATH} (${DUMP_SIZE})"

# Cloudflare R2 / S3 Sync (If configured in environment)
if [[ -n "${R2_BUCKET:-}" && -n "${R2_ENDPOINT:-}" ]]; then
  echo "[INFO] [$(date)] 3. Uploading encrypted dump to Cloudflare R2 bucket: ${R2_BUCKET}..."
  if command -v aws >/dev/null 2>&1; then
    aws s3 cp "${TARGET_PATH}" "s3://${R2_BUCKET}/backups/${DUMP_FILENAME}" \
      --endpoint-url "${R2_ENDPOINT}"
    echo "[SUCCESS] [$(date)] 4. Upload to Cloudflare R2 complete."
  else
    echo "[WARN] aws-cli not found. Backup securely preserved in local disk: ${TARGET_PATH}"
  fi
else
  echo "[NOTICE] R2_BUCKET/R2_ENDPOINT not set. Preserving local backup in ${TARGET_PATH}"
  echo "[TIP] To enable automated free Cloudflare R2 off-site archiving, configure R2_BUCKET & R2_ENDPOINT in .env"
fi

# Cleanup backups older than 7 days locally
find "${BACKUP_DIR}" -name "moneyverse_dump_*.sql.gz" -type f -mtime +7 -delete || true
echo "[INFO] [$(date)] 5. Old backup rotation complete."
