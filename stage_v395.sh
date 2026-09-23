#!/usr/bin/env bash
set -e

SRC=/home/debian/Woldeok-Moneyverse-Migration
TEST_DST=/srv/moneyverse-data/releases/test-9d248585-v395
PROD_DST=/srv/moneyverse-data/releases/prod-9d248585-v395
PREV_PROD=/srv/moneyverse-data/releases/prod-57eeaacc-v394

echo "=== [1/5] Creating release directories ==="
sudo rm -rf "$TEST_DST" "$PROD_DST"
sudo mkdir -p "$TEST_DST" "$PROD_DST"

echo "=== [2/5] Hard-linking base runtime from previous release $PREV_PROD ==="
sudo cp -al "$PREV_PROD/." "$TEST_DST/"

echo "=== [3/5] Syncing latest build artifacts and source using cp -a ==="
sudo cp -a "$SRC/docs" "$TEST_DST/"
sudo cp -a "$SRC/PROJECT_MEMORY.md" "$TEST_DST/" || true
sudo cp -a "$SRC/package.json" "$SRC/pnpm-lock.yaml" "$SRC/pnpm-workspace.yaml" "$TEST_DST/"
sudo cp -a "$SRC/packages/database/migrations" "$TEST_DST/packages/database/"
sudo cp -a "$SRC/frontend/src" "$TEST_DST/frontend/"
sudo rm -rf "$TEST_DST/frontend/.next"
sudo cp -a "$SRC/frontend/.next" "$TEST_DST/frontend/"
sudo cp -a "$SRC/backend/src" "$TEST_DST/backend/"
sudo rm -rf "$TEST_DST/backend/dist"
sudo cp -a "$SRC/backend/dist" "$TEST_DST/backend/"

echo "=== [4/5] Mirroring test release to prod release ==="
sudo rm -rf "$PROD_DST"
sudo cp -al "$TEST_DST" "$PROD_DST"

echo "=== [5/5] Setting file ownership to debian:debian ==="
sudo chown -R debian:debian "$TEST_DST" "$PROD_DST"

echo "=== Staging v395 release complete! ==="
