# Development A — Season Event WLD Cost Sorting (2026-10-31 09:25 KST)

## Before work — v1
- Source main: `761a55a094fb9dd383d213e817305e68c79fa23c`; separate `auto/hourly-a-20261031-0925-season-cost-sort` worktree.
- Read AGENTS.md, README.md, both integrated planning documents, recent QA and open PR/CI inventory. Planning PRs are DRAFT/HOLD; do not modify their files.
- Scope: member season event discovery sort by exact WLD cost ascending/descending, preserving authenticated/consent-checked GET and existing PostgreSQL `season_active_events()` SECURITY DEFINER function. No migration, ledger, privileges or payment changes.
- Backend GET `/api/v1/seasons/events?sort=cost_asc|cost_desc` with duplicate/unknown query rejection; default existing DB order. Web `/seasons` links and Android app-api proof of exact integer-string ordering. Fail closed on invalid upstream 200, no caching for member requests.
- Test plan: RED->GREEN controller/service + page/app gateway; large WLD exact ordering; invalid/duplicate sort; malformed responses; SQL function/ACL; full lint/typecheck/build/unit/integration, PostgreSQL, candidate CI, official exact-SHA Test. Never merge/deploy without all required evidence.
- Risks: existing Production release path #1984, app-role privileges #993, official Test exact-SHA/backup restore blocked. Preserve all unique branches.

## In progress — v2
- Pending.

## Finished — v3
- Pending verification.
