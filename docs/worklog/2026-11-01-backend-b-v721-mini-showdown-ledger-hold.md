# Backend B v721 — Mini-showdown financial settlement integrity

## Status
- [x] Source review: main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, AGENTS/README, EN/KO plans, PR/QA/CI.
- [x] P0 chosen: POST /api/v1/engagement/dopamine/mini-showdown returns client-selected `outcome` and 1.9x `payout` as successful settlement without any verified ledger receipt, stake debit, server RNG or idempotency.
- [x] RED tests reproduce fabricated payout and require HTTP 503 with no money movement.
- [x] GREEN: fail-closed controller; keep existing session/consent/CSRF gates and privacy headers.
- [ ] Validate focused, full suites, lint/typecheck/build, isolated PG, official exact-SHA Test and remote CI; mark unmet gates BLOCKED.
- [ ] Coordinate frontend C: existing mini-showdown modal fabricates payout on API failure; Backend-only fix does not fix UI.
- [ ] Record SHA, CI, PR, merge/production decision and cleanup.

## Bounded design
Reject all authenticated mini-showdown settlement requests with `503 MINI_SHOWDOWN_SETTLEMENT_UNAVAILABLE` until DB-owned atomic stake, server-authoritative dice and idempotent ledger receipts exist. No fake zero, payout, or client-trusted result; no new table, migration, direct DB grants, wallet mutation, Test or Production deploy. This is a safety stop, **not** feature completion. Frontend must independently stop showing a WLD payout when backend refuses. User's existing mandate authorizes fail-closed fixes; the full future settlement design remains unapproved.

## Checkpoints
- Start: miniPC Debian 13.6, backend/frontend/nginx/docker active; `moneyverse-mcp` TasksCurrent 988/1027 (risk of EAGAIN/EPIPE). GitHub main fetched, last B v720 #2313 and C v1259 #2314 reviewed; no mini-showdown PR identified.

### RED/GREEN checkpoint
- RED `1ae9b576e541fd03459c1673333cad461f54b9a5`: isolated Vitest 4/4 failed **for the intended reason**; HTTP 200 and client-forged 1,900,000,000 WLD payout for a 1,000,000,000 WLD stake were observed. This is a fabricated response, not proof of credited WLD.
- GREEN: isolated Vitest 4/4 PASS; HTTP 503 with `MINI_SHOWDOWN_SETTLEMENT_UNAVAILABLE`, no payout/success/transactionId, `private, no-store`, `noindex`, `no-referrer`. No database call or new migration.
- Resource note: regular MCP-cgroup Vitest aborted (SIGABRT) under saturated task limit; isolated `systemd-run --scope --uid=debian -p TasksMax=128` executed the tests without changing any other automation.
- Mid-run origin/main remained `f13bbce273ffc65e8576170992d82ea00c27a1c9`.
