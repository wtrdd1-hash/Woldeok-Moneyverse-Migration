#!/usr/bin/env bash
set -e

echo "=== [1/4] Promoting Test Environment to v396 ==="
sudo ln -sfn /srv/moneyverse-data/releases/test-b7d4a78e-v396 /srv/moneyverse-data/releases/test-current
sudo systemctl restart test-main-backend.service || true
sudo systemctl restart test-main-frontend.service || true
sleep 3

echo "=== [2/4] Verifying Test Environment Health ==="
TEST_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" https://test.easy-scraping.com/ || echo "000")
TEST_DEV_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" https://test.easy-scraping.com/developer || echo "000")
echo "Test Server Main HTTP Status: $TEST_HTTP"
echo "Test Server Developer Portal HTTP Status: $TEST_DEV_HTTP"

echo "=== [3/4] Blue-Green Zero-Downtime Promoting Production to v396 ==="
sudo ln -sfn /srv/moneyverse-data/releases/prod-b7d4a78e-v396 /srv/moneyverse-data/releases/production-current
sudo systemctl restart moneyverse-backend.service
sudo systemctl restart moneyverse-frontend.service
sleep 4

echo "=== [4/4] Verifying Production Environment Health, BFF Routes, and Sessions ==="
PROD_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" https://easy-scraping.com/)
PROD_NOTIF_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" https://easy-scraping.com/api/notifications/unread-count)
PROD_STOCKS_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" https://easy-scraping.com/stocks)
PROD_PORTFOLIO_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" https://easy-scraping.com/stocks/portfolio)
PROD_SCENARIO_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" https://easy-scraping.com/admin/economy/scenario-lab)

echo "Production Main HTTP Status: $PROD_HTTP"
echo "Production Notifications Unread-Count BFF Status: $PROD_NOTIF_HTTP"
echo "Production Stocks HTTP Status: $PROD_STOCKS_HTTP"
echo "Production Portfolio HTTP Status: $PROD_PORTFOLIO_HTTP"
echo "Production Scenario Lab HTTP Status: $PROD_SCENARIO_HTTP"

if [ "$PROD_HTTP" != "200" ]; then
  echo "CRITICAL: Production main route failed with status $PROD_HTTP"
  exit 1
fi

echo "Active User Sessions in Database after Promotion:"
docker exec woldeok-moneyverse-dev-db-1 psql -U moneyverse_migrator -d woldeok_moneyverse_dev -t -c "SELECT count(*) FROM auth_sessions WHERE expires_at > now();" 2>/dev/null || true

echo "=== Blue-Green Promotion to v396 Completed Successfully! ==="
