# C v1293 — Verified Member Conditional Stock Alerts (English canonical)

**2026-11-02 KST. Status: DRAFT / RELEASE HOLD.**

## Scope and provenance
Start main `a8541927c3a351d980454c66e95a3356c47e0722`, miniPC Debian 13.6. Read AGENTS, README English/Korean, living plans English/Korean, planning v1646 draft, QA v1460, A/B/C work and 195 open PRs. Full PR scan found earlier stock-league Draft #2250; overlapping local investigation was reverted before any commit. Unique P1 scope: owner conditional alert display and Android gateway. No financial write, SQL migration, direct grant, or Production/Test mutation.

## Observed defect and implementation
The authenticated `/stocks/alerts` page trusted unknown Nest `/stocks`, `/stocks/alerts`, `/stocks/alerts/events?limit=30` JSON. Malformed lists, duplicates, invalid WLD prices/basis points, dates or condition kinds could crash rendering or misstate owner alerts. A missing source was not distinguished from a verified empty list. Added strict, bounded parsing and fail-closed unavailable state with accessible retry, preserving verified-empty UI, symbol deeplink, existing CSRF-protected create/delete server actions and PostgreSQL owner-scoped functions `stock_alert_rules_list(uuid)` and `stock_alert_events_list(uuid,integer)`.

Android `/app-api/v1/stocks/alerts` and `/events` now reject malformed successful source bodies with 503 and force `private, no-store`, `noindex`, `no-referrer` on success/error/HEAD. Next page HTML paths, including localized routes, get private/noindex/no-referrer headers. Existing mobile API contract and financial ledger are unchanged.

## TDD and release gates
RED: missing parser import reproduced. GREEN: focused source, Android privacy and page integration tests pass. Exact SHA full lint/typecheck/build/unit/integration/security/app-api/real PostgreSQL/CI and official authenticated Test E2E remain separately evidenced. Any failing, skipped, unrun or incomplete required gate blocks merge and Production promotion. English original, Korean companion `2026-11-02-c-v1293-stock-alert-source.ko.md`. See isolated worktree evidence `/srv/moneyverse-data/tasks/mv-c-v1293-stock-league-20261102-1109/evidence/`.

## Rollback
Revert only this PR's frontend changes; no DB/ledger rollback needed. Do not delete overlapping unmerged PR #2250 or A/B/QA/Gemini worktrees. Main remains untouched.
