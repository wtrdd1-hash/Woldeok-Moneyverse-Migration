# Hourly A — Private Security Activity History and CSV (2026-10-30)

## Before work — 08:25 KST
- Source main `62c6cd038951d65c94b709302bdaec6e75b080b6`; branch `auto/hourly-a-security-events-export-20261030-0825` in independent worktree.
- Debian 13 miniPC: backend, frontend, bot, MCP, nginx and Docker active; DEV database connected. Disk `/srv` 97% used (3.3 GiB free); avoid heavy installs, images and cleanup of other owners' files.
- Open PRs 34, remote branches 40 at baseline; no deletion authorized. Existing A PRs cover support, wallet, shop, work, storage, collections. Security events history/export is separate.
- Main repository policy and English/Korean project plan reviewed; existing DB migration 214 supplies `account_recent_security_events(actor,20)` with owner filtering, no new grants or migration needed.
- Observed P1 gap: security page fetches 20 owner-scoped events but displays only five, with no private download; avoid implying complete historical archive.
- Goal: render up to 20 verified events, add owner-authenticated private CSV download, preserve Android JSON API, enforce no-store/noindex and reject malformed evidence. No new sensitive event metadata, financial writes, or schema changes.
- Release policy: Draft PR/HOLD until exact SHA CI, isolated PG, Test E2E and GitOps gates pass. Never change Production on partial evidence.

## In progress
- [ ] TDD RED for CSV and full history; [ ] implementation; [ ] unit/integration/PG/security checks; [ ] main/PR re-audit.

## Finished
- Pending verification; no merge, Test or Production deployment planned without all gates.
