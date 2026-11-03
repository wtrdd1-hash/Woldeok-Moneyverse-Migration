# v2026.11.03.1646 — Telegram transition correction worklog

Owner: Ops / ChatGPT; issue #2617; branch `fix/telegram-recovery-state-v1646`.

## Before (2026-11-03 KST)
- Source of truth: `docs/DOCUMENTATION_POLICY.md`, `docs/README.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/PROJECT_PLAN.md`, `ops/telegram/README.md`, earlier QA disk hygiene notes. Start/main mid-task SHA `e325d3ef827441f807734178cfcd8fe72d7061be`.
- Other workers: main checkout `sec/owasp-vulnerability-audit-20261102` has uncommitted changes; untouched. Independent worktree `/srv/moneyverse-data/build-workspaces/telegram-alert-v1646` created directly from origin/main.
- Incident: 11:00 QA v1627: exit=1, HTTP 16 pass / 9 external connection timeouts / auth-gated 1; scrubber 149 B deleted, both-disk cleaner 0 eligible. No database/financial mutations.
- Recovery: 11:42:08–11:43:31 manual start with `sudo -n systemctl`: QA 24 pass, 2 auth-gated, 0 fail, Result=success exit=0; timer next due 12:00 KST.
- Test endpoints on test.easy-scraping.com: `/api/health` 200, `/api/version` 200; test backend/frontend systemd ACTIVE.

## Patch and isolated test
- `ops/telegram/telegram_bridge.py`: within-severity disk changes are not events. Retain latest measurement. One-shot ACTIVE=activating/deactivating becomes PENDING and cannot trigger recovery before terminal success.
- `ops/telegram/test_telegram_bridge.py`: 3 regression tests: disk OK fluctuation and warning/critical/real recovery, PENDING preserves previous CRITICAL, and running oneshot snapshot PENDING.
- `python3 -m unittest discover -s ops/telegram -p 'test_*.py' -q`: 30 passed; targeted test suite 14 passed; compile and diff --check passed.

## Mid-work source recheck
- origin/main: `e325d3ef827441f807734178cfcd8fe72d7061be` unchanged at mid-check. Recheck immediately before remote production install.

## Production / post-check / rollback
- v2026.11.03.1646.1 follow-up: PR #2619 merged (main `e86dd41650a42fdafa02572979fc9e704383caf9`), upstream main and candidate script SHA256 `d69b72c451f38907d9dd020cb9895cde424442fa9f19cf71edd8a1e0a9408c10`. Pre-deploy host SHA256 `84dfb4672aee91f2aee04f5e1d943ed7317a6ffabd56e8c0de256a55277fff57` verified unchanged from initial; saved exact original under `/srv/moneyverse-data/ops-backups/telegram-v1646/telegram_bridge.py.pre` on data disk.
- Install exact merged candidate with root ownership 0755 (live SHA256 matches), without touching any credential/state/chat file. No restart of application/DB/QA services; only the one-shot Telegram alert checker invoked.
- At 2026-11-03 11:51:19 KST checker systemd `Result=success`, `ExecMainStatus=0`; timer active/enabled/waiting; QA `Result=success`; OS and data disk sampled healthy (53% / 37%). Private stored last severity and current snapshot agree (both disk OK, QA OK).
- Rollback, only if regression: `sudo install -o root -g root -m 0755 /srv/moneyverse-data/ops-backups/telegram-v1646/telegram_bridge.py.pre /usr/local/lib/moneyverse-telegram/telegram_bridge.py` followed by `sudo systemctl start moneyverse-telegram-alerts.service`. Protect state and credential files. Verified production in-scope; next hourly QA and external CDN/network root cause not yet certified.
- Check log: `journalctl -u moneyverse-telegram-alerts.service`; inspect no secrets. Public internal docs and release notes are attached. Incident #2617 stays open until root cause or sufficient uptime evidence is established.
