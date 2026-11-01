# Backend B v721 — Mini-showdown financial settlement integrity

## Status
- [x] Source review: main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, AGENTS/README, EN/KO plans, PR/QA/CI.
- [x] P0 chosen: POST /api/v1/engagement/dopamine/mini-showdown returns client-selected `outcome` and 1.9x `payout` as successful settlement without any verified ledger receipt, stake debit, server RNG or idempotency.
- [ ] RED tests reproduce fabricated payout and require HTTP 503 with no money movement.
- [ ] GREEN: fail-closed controller; keep existing session/consent/CSRF gates and privacy headers.
- [ ] Validate focused, full suites, lint/typecheck/build, isolated PG, official exact-SHA Test and remote CI; mark unmet gates BLOCKED.
- [ ] Coordinate frontend C: existing mini-showdown modal fabricates payout on API failure; Backend-only fix does not fix UI.
- [ ] Record SHA, CI, PR, merge/production decision and cleanup.

## Bounded design
Reject all authenticated mini-showdown settlement requests with `503 MINI_SHOWDOWN_SETTLEMENT_UNAVAILABLE` until DB-owned atomic stake, server-authoritative dice and idempotent ledger receipts exist. No fake zero, payout, or client-trusted result; no new table, migration, direct DB grants, wallet mutation, Test or Production deploy. This is a safety stop, **not** feature completion. Frontend must independently stop showing a WLD payout when backend refuses. User's existing mandate authorizes fail-closed fixes; the full future settlement design remains unapproved.

## Checkpoints
- Start: miniPC Debian 13.6, backend/frontend/nginx/docker active; `moneyverse-mcp` TasksCurrent 988/1027 (risk of EAGAIN/EPIPE). GitHub main fetched, last B v720 #2313 and C v1259 #2314 reviewed; no mini-showdown PR identified.
