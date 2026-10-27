# B v597 — P1 treasury donor ranking pagination boundary (Draft / release HOLD)

- Baseline main: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`. New isolated worktree/branch: `auto/hourly-b-treasury-donor-limit-v597-20261028-0235`.
- Collision avoidance: candidate club discovery patch was abandoned uncommitted after detecting existing Draft PR #1473 implementing that exact contract. No other worker's branch or worktree changed.
- Root cause: `GET /api/v1/admin/treasury/donations/top` used `Number(limit)` with truthiness fallback, accepting blank/whitespace, exponent and noncanonical numeric input. Direct service/repository calls had no bound and passed unsafe limits to PostgreSQL. Equal donation totals lacked deterministic ranking.
- Change: canonical decimal `limit` in [1, 100] or default 10; malformed, duplicate, unsafe or out-of-range values return HTTP 400 before SQL. Service/repository reject direct invalid values. Stable ranking by total WLD descending then user UUID ascending. Preserve admin/session/consent guards, response shape and `sum(amount_wld)::bigint::text` precision.
- Tests: RED 31 failing cases before implementation, then 33/33 controller/service/repository/HTTP tests PASS. Isolated PostgreSQL 17 synthetic fixture: 3/3 PASS for large WLD integer string, tie ordering, bounded reads and denied app-role writes. HTTP test replaces guards; not authenticated E2E.
- No migration, WLD/ledger mutation, shared DB changes, Production or official Test changes.
- Release HOLD: full root lint, migration parity and dependency audit have known failing gates; official Test exact-SHA authenticated financial E2E, GitOps release gate and Production smoke not completed. Draft PR only.
