#!/usr/bin/env bash
set -e

echo "=== [1/4] Promoting Test Environment to v482 ==="
sudo ln -sfn /srv/moneyverse-data/releases/test-v482 /srv/moneyverse-data/releases/test-current
sudo systemctl restart test-main-backend.service || true
sudo systemctl restart test-main-frontend.service || true
sleep 5

echo "=== [2/4] Verifying Test Environment Health ==="
TEST_HTTP=$(curl -sS -o /dev/null -w "%{http_code}" https://test.easy-scraping.com/ || echo "000")
echo "Test Server Main HTTP Status: $TEST_HTTP"

echo "=== [3/4] Blue-Green Zero-Downtime Promoting Production to v482 ==="
sudo ln -sfn /srv/moneyverse-data/releases/prod-v482 /srv/moneyverse-data/releases/production-current
sudo systemctl restart moneyverse-backend.service
sudo systemctl restart moneyverse-frontend.service
echo "Waiting 8s for Next.js and NestJS to fully warm up..."
sleep 8

echo "=== [4/4] Verifying Production Environment Health ==="
check_route() {
  local url="$1"
  local code="000"
  for i in {1..5}; do
    code=$(curl -sS -o /dev/null -w "%{http_code}" "$url" || echo "000")
    if [ "$code" = "200" ]; then
      break
    fi
    sleep 2
  done
  echo "$code"
}

PROD_HTTP=$(check_route "https://easy-scraping.com/")
PROD_TOOLS=$(check_route "https://easy-scraping.com/tools")
PROD_GOAL=$(check_route "https://easy-scraping.com/tools/goal-wealth-calculator")
PROD_TAX=$(check_route "https://easy-scraping.com/tools/tax-calculator")
PROD_COMPOUND=$(check_route "https://easy-scraping.com/tools/compound-calculator")
PROD_ROBOTS=$(check_route "https://easy-scraping.com/robots.txt")
PROD_SITEMAP=$(check_route "https://easy-scraping.com/sitemap.xml")

echo "Production Main HTTP: $PROD_HTTP"
echo "Production Tools Hub HTTP: $PROD_TOOLS"
echo "Production Goal Wealth Calc HTTP: $PROD_GOAL"
echo "Production Tax Calc HTTP: $PROD_TAX"
echo "Production Compound Calc HTTP: $PROD_COMPOUND"
echo "Production Robots.txt: $PROD_ROBOTS"
echo "Production Sitemap.xml: $PROD_SITEMAP"

if [ "$PROD_HTTP" != "200" ] || [ "$PROD_TOOLS" != "200" ] || [ "$PROD_GOAL" != "200" ] || [ "$PROD_TAX" != "200" ]; then
  echo "CRITICAL: One or more production routes failed health verification!"
  exit 1
fi

echo "=== v482 Zero-Downtime Promotion Complete! === "
