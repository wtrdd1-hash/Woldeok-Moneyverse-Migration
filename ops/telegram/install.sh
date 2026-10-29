#!/usr/bin/env bash
# Deploy the reviewed independent Telegram monitor; does not touch Moneyverse app services.
set -euo pipefail
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ "$(id -u)" -ne 0 ]]; then
  echo "Must run as root on the approved Moneyverse host" >&2
  exit 2
fi
if [[ ! -f /var/lib/moneyverse-telegram/telegram.env ]]; then
  echo "Host-only /var/lib/moneyverse-telegram/telegram.env is missing" >&2
  exit 3
fi
if [[ "$(stat -c %a /var/lib/moneyverse-telegram/telegram.env)" != 600 ]]; then
  echo "Telegram credential file must be mode 0600" >&2
  exit 4
fi
install -d -m 0755 /usr/local/lib/moneyverse-telegram
install -m 0755 "${SOURCE_DIR}/ops/telegram/telegram_bridge.py" /usr/local/lib/moneyverse-telegram/telegram_bridge.py
install -d -o debian -g debian -m 0700 /var/lib/moneyverse-telegram
install -m 0644 "${SOURCE_DIR}/ops/systemd/moneyverse-telegram-alerts.service" /etc/systemd/system/moneyverse-telegram-alerts.service
install -m 0644 "${SOURCE_DIR}/ops/systemd/moneyverse-telegram-alerts.timer" /etc/systemd/system/moneyverse-telegram-alerts.timer
systemctl daemon-reload
systemctl enable --now moneyverse-telegram-alerts.timer
systemctl start moneyverse-telegram-alerts.service
systemctl is-active moneyverse-telegram-alerts.timer
echo "Monitor installed; no Moneyverse application services were restarted."
