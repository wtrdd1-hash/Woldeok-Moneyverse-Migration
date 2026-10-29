# C v1159 — Admin treasury revenue/expenditure evidence visibility

## BEFORE WORK — 2026-10-29 15:09 KST
- Source main: `679cb5904f779a1b2067f10809fcca83e31dbe91`; branch `auto/hourly-c-treasury-flow-evidence-v1159-20261029-1509`, independent worktree.
- Debian 13 miniPC seven services active; PostgreSQL development connection available. Original repository has unrelated uncommitted files; untouched.
- Read AGENTS.md, README.md, README/README.ko.md, canonical EN/KO project plans, latest main/CI, active A/B/C/QA PRs. Existing B draft #1852 owns API 503 contract; QA handoff #1853 owns missing UI. Do not duplicate B backend, A help, C gallery or QA work.
- Verified defect: `frontend/src/app/admin/treasury/treasury-view.tsx` silently omits revenue and expenditure sections when `apiOrNull` returns null; `page.tsx` already uses `force-dynamic` and authenticated API no-store. This is evidence unavailable, **not zero**.
- [x] Investigate contracts and independent workspace.
- [ ] TDD RED for independent missing revenue/expenditure, genuine 200 empty zero, mobile/a11y, and server route no-store behavior.
- [ ] GREEN implementation and focused regression.
- [ ] Full build, lint, typecheck, tests, API contract, real PostgreSQL, security, CI and exact-SHA Test gates.
- [ ] Re-fetch main/plans; final PR and release decision.

## IN PROGRESS
Pending.

## FINISHED
Pending. No deployment authorized without every gate PASS.

### RED checkpoint — 15:12 KST
- Added four regression cases to the existing treasury view suite, mocked unrelated server-action dialogs to avoid browser `node:crypto` import; `NODE_ENV=test` required for React act.
- Confirmed expected RED: 3 failures for missing independent unavailable sections, 5 PASS. Existing unrelated 200-zero test assertion was adjusted to scope legitimate totals.
- No production code modified at this checkpoint. Release remains HOLD.

### GREEN checkpoint — 15:15 KST
- Added explicit independent accessible status Cards with 44px retry links, responsive wrapping, and no unknown WLD totals. Verified 200-empty ledger still shows real zero.
- Added server-page integration tests for independent null/200 responses, admin guard, force-dynamic/noindex; existing authenticated `api` defaults to `cache: no-store`.
- Focused test suite 11 PASS / 0 FAIL on Debian miniPC. No backend, DB, finance or deployment changes; depends on B draft #1852 for 503 source contract.
- Mid-run `origin/main` advanced `679cb5904` -> `95a8fdb85` (release documentation only, no touched frontend files). Canonical project plan header remains v1452; integrated master changed and will be reviewed before final rebase.
