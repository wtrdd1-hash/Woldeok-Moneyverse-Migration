# Development A — Verified attendance status and unsafe reward hold (2026-10-25)

## Before work — 15:21 KST
- Debian 13.6 miniPC reachable; Backend/Frontend/Nginx/Docker active; root 92% used, data 55% used.
- Source `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent `auto/hourly-a-attendance-truth-20261025-1521` worktree.
- Read AGENTS.md, README.md, canonical English/Korean project plans and integrated master; inspected open PRs/CI. Other A/B/C/Gemini branches remain untouched.
- P0: `/tools` displays client-only fabricated attendance streak and 1M–100M WLD rewards; `POST /engagement/dopamine/attendance/spin` can insert attendance before ledger posting and has a fake success fallback when repository is unavailable. Financial settlement cannot be asserted without atomic DB receipt.
- Scope: authoritative read-only attendance status via existing PostgreSQL path, explicit unavailable/guest states, disable unsafe claim in backend and web gateway, Android app-api propagation, regression tests. No schema change, no Production DB write.
- TDD: write failing tests first, then implement; verify focused/full gates, record exact SHA and blockers. Do not merge or deploy without all gates.

## In progress
- [ ] RED regression tests
- [ ] Backend/API/frontend/app-api changes
- [ ] Isolated real-PostgreSQL read/ACL test
- [ ] Build, typecheck, lint, unit/integration, accessibility, SEO, security, CI

## Finished
- Pending evidence. Production release hold.

### RED checkpoint — 15:24 KST
- Backend new tests: 3 failed / 1 passed; Frontend new tests: 7 failed / 1 passed, demonstrating fabricated status/claim and UI assertions.
- Midpoint main re-fetched; plan EN/KO rechecked. Implementation follows in same isolated worktree.

### Implementation checkpoint — 15:28 KST
- Backend attendance reward POST and web/Android gateways now return 503 before any unsafe legacy settlement; absent DB repository never produces a fake success.
- `/tools` shows only verified read-only attendance status and explicitly states WLD payout is suspended; fabricated 1M–100M WLD prizes and client-generated streak removed.
- Backend status now derives from actual owner `MINT_TO_USER` ledger postings and matching attendance outbox events, not the absent `daily_attendance_logs` table.
- RED/GREEN: backend 7 focused PASS; frontend + Android 20 focused PASS; Android RED previously 2 failed, then both green.
- Isolated PostgreSQL `wdmv_v761_test_acl` (281 applied migrations): `moneyverse_app` SELECT ledger/postings/outbox/accounts permitted; ledger INSERT denied; exact status SQL executed under app role with 0 rows and `ROLLBACK`; no production-linked 5433 writes.
- Midpoint main SHA unchanged; release gate remains HOLD pending full tests, security and official Test exact SHA.

### Verification checkpoint — 15:34 KST
- Full Backend 1,321 PASS / 398 SKIPPED; full Frontend 1,407 PASS / 6 FAIL (SEO 3, login a11y, calculator registration link, admin M2). Database 15 PASS / 3 SKIPPED; contract 38 PASS; Android 179 endpoint contract PASS.
- Typecheck PASS, Lint PASS (0 errors / 1,124 warnings), Backend build PASS. Initial Frontend build BLOCKED by external symlinked node_modules; corrected with offline local install and final Frontend build PASS.
- Security audit: production High 2 FAIL; full Critical 2 / High 10 FAIL; bot Critical 1 / High 5 FAIL.
- Exact isolated PostgreSQL app-role SQL/ACL PASS for nonexistent actor, no fixture and no Production-linked 5433 write. Full authenticated finance E2E remains BLOCKED.
- Issue #1291 opened for atomic daily attendance settlement. Final main re-fetched and remains 1c5b84a1c45baafcca83f375a6f99698121e9bb5.
- Remote heads 158, open PRs 153, conflicts #1143/#1110/#1107. No branch deletion; unmerged work preserved.

## Finished — release gate HOLD
- [x] RED regression tests
- [x] Backend/API/frontend/app-api changes
- [x] Isolated real-PostgreSQL read/ACL test (zero-row fixture; no paid receipt)
- [x] Build, typecheck, lint, unit/integration, accessibility/SEO test execution, security scans
- [ ] Full Frontend PASS, security PASS, exact-SHA Test authentication/finance E2E, authorized GitOps — BLOCKED
- Main, official Test and Production unchanged. No Production rollback required. Never delete other workers' branches or disable scheduled development.
