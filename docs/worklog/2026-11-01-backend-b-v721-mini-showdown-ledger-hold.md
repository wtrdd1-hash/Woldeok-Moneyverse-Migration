# Backend B v721 — Mini-showdown financial settlement integrity

## Status
- [x] Source review: main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, AGENTS/README, EN/KO plans, PR/QA/CI.
- [x] P0 chosen: POST /api/v1/engagement/dopamine/mini-showdown returns client-selected `outcome` and 1.9x `payout` as successful settlement without any verified ledger receipt, stake debit, server RNG or idempotency.
- [x] RED tests reproduce fabricated payout and require HTTP 503 with no money movement.
- [x] GREEN: fail-closed controller; keep existing session/consent/CSRF gates and privacy headers.
- [x] Validate focused, full suites, lint/typecheck/build, isolated PG, official exact-SHA Test and remote CI; mark unmet gates BLOCKED.
- [x] Coordinate frontend C: existing mini-showdown modal fabricates payout on API failure; Backend-only fix does not fix UI.
- [x] Record SHA, CI, PR, merge/production decision and cleanup.

## Bounded design
Reject all authenticated mini-showdown settlement requests with `503 MINI_SHOWDOWN_SETTLEMENT_UNAVAILABLE` until DB-owned atomic stake, server-authoritative dice and idempotent ledger receipts exist. No fake zero, payout, or client-trusted result; no new table, migration, direct DB grants, wallet mutation, Test or Production deploy. This is a safety stop, **not** feature completion. Frontend must independently stop showing a WLD payout when backend refuses. User's existing mandate authorizes fail-closed fixes; the full future settlement design remains unapproved.

## Checkpoints
- Start: miniPC Debian 13.6, backend/frontend/nginx/docker active; `moneyverse-mcp` TasksCurrent 988/1027 (risk of EAGAIN/EPIPE). GitHub main fetched, last B v720 #2313 and C v1259 #2314 reviewed; no mini-showdown PR identified.

### RED/GREEN checkpoint
- RED `1ae9b576e541fd03459c1673333cad461f54b9a5`: isolated Vitest 4/4 failed **for the intended reason**; HTTP 200 and client-forged 1,900,000,000 WLD payout for a 1,000,000,000 WLD stake were observed. This is a fabricated response, not proof of credited WLD.
- GREEN: isolated Vitest 4/4 PASS; HTTP 503 with `MINI_SHOWDOWN_SETTLEMENT_UNAVAILABLE`, no payout/success/transactionId, `private, no-store`, `noindex`, `no-referrer`. No database call or new migration.
- Resource note: regular MCP-cgroup Vitest aborted (SIGABRT) under saturated task limit; isolated `systemd-run --scope --uid=debian -p TasksMax=128` executed the tests without changing any other automation.
- Mid-run origin/main remained `f13bbce273ffc65e8576170992d82ea00c27a1c9`.

## Validation and release verdict (2026-11-01 13:21 KST)
- **Verified code SHA:** `6abaf2a1f6f6e6e1ba0572d5c2e3a54c7d75e57f`. Draft/HOLD PR #2316. C frontend handoff issue #2317, and PR #2306 notified.
- **RED/GREEN:** 4/4 intentional RED failures on pre-fix code; final focused 4/4 PASS, including actual Nest HTTP 503 and privacy headers.
- **Backend full:** 2,954 PASS / 517 SKIP, 0 FAIL in independent systemd scope. **Frontend full:** 2,899 PASS / 2 FAIL, same expired admin session fixtures tracked #2292; not green.
- **Full Typecheck:** PASS. **Lint:** PASS with 0 errors / 1,022 existing warnings. **Full Backend/Frontend Build:** PASS.
- **Contract:** 41 PASS. **Database package:** 62 PASS / 4 SKIP. **Mobile app-api contract:** 184 endpoints PASS. **Security/release/backup unit checks:** 22 PASS.
- **Isolated PostgreSQL 17.11:** 316 forward migrations applied to disposable DB; 48 real PG integration PASS / 2 SKIP; app role `ledger_transactions DELETE=false`, `account_balances UPDATE=false`. Container cleaned; no shared or Production DB change.
- **Production dependency audit:** PASS / 0 known vulnerabilities. **All dependency audit:** FAIL / 9 vulnerabilities (8 moderate, 1 low).
- **Integrated `pnpm test`:** FAIL due same two admin console frontend fixtures; cannot claim all required gates pass.
- **GitHub CI on code SHA:** classify/policy/release-input PASS; runtime-check and verify/runtime-check FAIL at frontend admin console fixture assertions; CI lint/typecheck/build/PG migration steps PASS. This is not a successful CI run.
- **Official Test exact SHA:** FAIL `backend_version_unverified`, `frontend_version_unverified`. Read-only public Test backend/frontend both `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not candidate. Host identity verifier fails `systemdProcessDirectory is not defined`. No authenticated Test E2E or independent restore attestation.
- **Production:** read-only backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, frontend reports non-SHA `1793450413898`; no release provenance for candidate. No merge/Test/Production deployment.
- **Collaboration:** Frontend mini-showdown modal still fabricates payout after failed HTTP request; #2317 tracks C ownership. Backend-only stop is not a complete user flow. Other A/C/QA/Gemini branches, schedules and runtime unchanged.
- **Main authority:** origin/main `f13bbce273ffc65e8576170992d82ea00c27a1c9` re-fetched before final decision. Planning Draft #2315 v1602 reviewed; no ownership overlap.
- **Final gate:** PARTIAL / BLOCKED, PR remains Draft/HOLD. Do not merge or promote until mandatory gates pass, frontend remediation lands, exact-SHA Test E2E/restore and GitOps approvals are independently verified.
