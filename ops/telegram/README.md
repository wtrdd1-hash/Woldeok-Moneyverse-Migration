# Moneyverse Telegram operational notifications (v2026.10.29.1510)

The **standalone** bridge scans read-only local systemd state and dual-disk utilization every two minutes and emits state transitions to the authenticated **private** Telegram chat. It is not a replacement for the site's member notification inbox. It never reads private account balances, bank account numbers, raw journal entries, TOTP, authentication sessions, or private messages. This source is intentionally free of Telegram credentials.

## Coverage / truth
- P0/critical: backend, frontend, Discord bot, Nginx, Docker service down; last QA, backup or verified blog job result not success; filesystem >=95%.
- Warning: QA/backup/verified-blog timer inactive, filesystem >=90%.
- Recovery: transition to healthy, exactly once; repeated unchanged failures are deduplicated. A daily 09:00 KST or later summary shows outstanding warnings.
- On-demand event types via CLI (for explicit integration by other *reviewed* jobs): system, website, database, qa, blog, finance, release, github, security, admin, ai and other. **This does not imply automatic per-transaction, per-member or per-commit forwarding.**
- Automated GitHub CI/release, treasury/bookkeeping, admin action, and article-per-publication triggers require separately reviewed producers; their detailed events are **not** wired in this version. Never represent a failed financial QA probe as a certified audit.

## Private setup (on the authorized host)
1. Deploy reviewed script to `/usr/local/lib/moneyverse-telegram/telegram_bridge.py`, mode 0755, and copy the service and timer to `/etc/systemd/system/`.
2. Create `/etc/moneyverse/telegram.env` owned by `debian`, mode 0600, containing only `TELEGRAM_BOT_TOKEN=...` (never commit or log its value). The directory and file must be inaccessible to unrelated accounts.
3. The systemd service runs as `debian` with `StateDirectory=moneyverse-telegram`; `/var/lib/moneyverse-telegram` mode 0700 contains the private pair-code, destination chat id and deduplication cursor.
4. Generate a random pairing code using `sudo -u debian python3 /usr/local/lib/moneyverse-telegram/telegram_bridge.py pair-code`. This action is network-free and does not need the bot token. Alternatively pre-create `pairing_code` in the state directory with a cryptographically random URL-safe string.
5. Send `/start <code>` in a **private** chat with `@woldeok_moneyverse_bot`. Group messages, wrong codes and other private chats are never registered. A completed registration is not silently re-bound.
6. `systemctl daemon-reload && systemctl enable --now moneyverse-telegram-alerts.timer`; trigger once with `systemctl start moneyverse-telegram-alerts.service`. Inspect logs **without environment dumps**.
7. Once paired, optionally run an explicit smoke event through the service environment and `emit --category system --severity INFO --message 'Moneyverse Telegram delivery check'`. Do not send confidential finance/member data.

## Safety and rollback
- Failed Telegram API requests retain unsent state so the next scan retries. Errors never print a token-bearing URL.
- Messages are plain text (not HTML); control characters and token/secret patterns are redacted, message size is bounded to 3200 characters. The bot only sends to the first valid paired chat, never to all observed users.
- No existing production app service needs a restart or database migration. Disable via `systemctl disable --now moneyverse-telegram-alerts.timer`; stop the oneshot if it is still running. Existing Moneyverse services are unaffected.
- Token is already exposed in the originating chat: rotate via BotFather when practicable, update only the host credential file and restart the notification timer. This version uses the owner-approved token despite the exposure.
- Run `python3 -m unittest discover -s ops/telegram -p 'test_telegram_bridge.py' -v` before deployment.
