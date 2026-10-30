# Development A — Owner session scope (2026-10-31 04:25 KST)

## BEFORE
- Connected to Debian 13.6 miniPC; backend/frontend/nginx/Docker active, development PostgreSQL connected. Main `761a55a094fb9dd383d213e817305e68c79fa23c` after admin PR #2045 merge. Canonical checkout has an unrelated untracked frontend/.build_id; isolated worktree only.
- Read AGENTS.md, README.md, English/Korean PROJECT_PLAN, QA v1404 inventory, A/B/C PRs and CI, planning Draft v1536 #2089. Avoid B pocket/ledger and C inventory; account session read scope is independent.
- Start 38 remote branches, 34 open PRs. Preserve all unique unmerged commits. No applied migration edit, no production writes or service restarts.
- Feature: authenticated owner may view **other active devices only** without seeing current device in that filtered list; default all-session view stays unchanged. Android app-api rejects duplicate scope and mismatched/forged success responses. Current session is never revoked by a filter.

## IN PROGRESS
- [ ] TDD RED on API/owner SQL result mapping, web parser/UI, Android app-api.
- [ ] Implement minimal backend+Next+Android gateway and verify GREEN.
- [ ] Verify actual PostgreSQL function and owner boundary, all mandatory gates and exact SHA.

## FINISHED
- Pending evidence. Never merge/deploy without all gates PASS.

## DURING (04:26–04:28 KST)
- RED: backend 3 FAIL; frontend/Android 6 FAIL / 1 PASS. GREEN after minimal implementation: backend 3 PASS; frontend/Android 7 PASS. Reused source SQL function; no migrations or new grants.
- Rechecked main and planning v1536. Added strict `scope=all|other` validation, owner session list filtering, private noindex Android response verification and accessible web links. Revoke actions continue using unfiltered owner session proof.
- Remaining: broader regression, actual PostgreSQL fixture, build/lint/typecheck/security/SEO and exact SHA CI.
