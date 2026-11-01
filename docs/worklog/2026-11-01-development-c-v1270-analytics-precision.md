# Development C v1270 — Admin Analytics Exact Financial Evidence

## Before work — 2026-11-01 18:45 KST
- Source: `origin/main` `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`; English plan SHA256 prefix `0e18217e147699db`, Korean plan `2a384f4c842eac8e`.
- Debian 13.6 miniPC reachable; backend/frontend/bot/MCP/desktop/nginx/docker active; development PostgreSQL connected. Original main checkout has unrelated `implementation_plan.md` edits; untouched.
- Reviewed AGENTS.md, README.md, README/README.ko.md, canonical and Korean living plans, 110 open PRs, latest C #2356, B #2353, A #2350 and QA v1443. No open PR targets admin analytics quintiles/stock capitalization.
- **P1 evidence:** `frontend/src/app/admin/analytics/analytics-client-view.tsx` converts `total_net_worth`, `current_price`, and `shares_outstanding` to JS Number and exports rounded wealth. Precision beyond 2^53 is lost; malformed successful API values silently become zero. The existing admin-only Nest `/api/v1/admin/users` and `/api/v1/admin/stocks` supply decimal integer strings from SQL read models; no new DB grants or writes needed.
- **Design / constraints:** Keep admin session guard and read-only API contracts; calculate wealth quintiles and stock market-cap rankings in BigInt, reject malformed/duplicate input, show unknown rather than fabricated zero, preserve CSV exact integer values and responsive/accessible UI. Reuse existing server APIs; no monetary mutation. TDD RED→GREEN; no other contributor changes.
- **Plan:** (1) failing exactness/invalid-source tests; (2) precision helpers; (3) web/CSV wiring and accessible errors; (4) focused and whole-repo gates; (5) main re-fetch, PR and release hold.
- Status: IN PROGRESS; release HOLD until every required gate passes.

## In progress
- Pending RED/GREEN and source-level implementation.

## Finished
- Pending.

### Checkpoint 18:47 KST
- TDD RED: missing helper module; integration assertions reproduced incorrect rounded stock cap and absent invalid-source alert (2 failures / 8 passes); parser contract RED twice. Initial Vitest DOM run without NODE_ENV=test produced React.act environment errors; corrected environment and reran.
- GREEN: exact BigInt quintiles, capitalization ranking, invalid-source fail-closed, API envelope validation, CSV exact integer export; 19 focused frontend tests PASS across 3 files.
- Responsive chart layout preserved; source-failure warnings use `role=alert`, valid empty uses `role=status`; no new API, DB, schema or finance write. Existing authenticated admin users/stocks read APIs reused.
- `origin/main` re-fetched mid-task. Full gates and CI remain pending; DRAFT / RELEASE HOLD.
