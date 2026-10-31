# Backend B v701 — Marketplace ledger-settlement safety hold (DRAFT / RELEASE HOLD)

## Start / scope
- Started: 2026-10-31 23:35 KST. `origin/main` = `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`.
- Independent worktree: `auto/hourly-b-v701-marketplace-ledger-hold-20261031-2335`.
- QA v1423: Production app role has broad direct account balance DML; marketplace create/buy/bid SQL functions directly UPDATE account_balances without canonical ledger, but main already guards these three service calls; 552 Treasury-unlinked transactions and independent restore/Test identity remain blocked. No claim of actual member loss.
- Other work: B v699 Draft #2216 DB identity; B v700 uncommitted startup ACL gate; QA Draft #2220 host identity; C #2217/#2219, planning #2218. This change does not touch their files or deploy.
- Root cause: existing service holds listing create/buy and bids, **but** auction creation and P2P proposal/accept/confirm remain open. `confirmTrade` marks a trade COMPLETED without atomic asset/WLD transfer. Direct auction/trade proposals create misleading unsettled commitments.

## Plan / checkpoints
- [x] Read AGENTS, README, EN/KO planning, QA, open PR/CI; inspect affected backend + migration 232 and SQLSTATE error mapping.
- [x] RED: write service-level tests proving unsafe money/escrow/trade actions must fail with 503 before any SQL or broadcast; existing read/cancel/appraisal unaffected.
- [x] GREEN: extend existing service-level hold to four unguarded auction/trade mutations, keep explicit temporary hold and truthful HTTP error; preserve read and unwind paths.
- [x] Focused tests, lint/typecheck/build, full backend/frontend suites, isolated PostgreSQL 17.11 and package/security tests.
- [ ] Official exact-SHA Test, authenticated E2E, independent restore, strict full dependency audit and route-ledger certification remain blocked.
- [x] Re-fetch latest main and EN/KO plan; log exact SHAs, PR/CI and release HOLD. No main merge or Production without all gates.

## Contract / safety
- Affected mutation methods return HTTP 503 with stable code `MARKETPLACE_LEDGER_SETTLEMENT_UNCERTIFIED`, without SQL, WLD or item changes. Read-only listings/auctions/trades and cancellation/unwind remain available. Appraisal uses existing ledger-first SQL function. No API schema, DB migration or financial data changes.
- Backend-only containment is **not** a DB-layer privilege fix: existing direct SQL EXECUTE and Production role grants remain P0, and an independent forward-only migration/review is required before enabling writes.

## Checkpoint 23:38 KST
- RED 4/4 new cases failed before implementation; existing createListing/buyListing/bidAuction were already held in main, so no duplicate rewrite.
- GREEN added service-level holds to auction creation, P2P proposal, acceptance and confirmation; existing 3 holds preserved. Focused service/controller/appraisal suite 16/16 PASS.
- HTTP-level 4 additional route tests added to verify Nest 503 propagation and zero DB calls.

## Final validation checkpoint — 2026-10-31 23:51 KST
- Code commit: `3f7919eb597656f55a88bf9a94a058ebfc6f972e` (start/main still `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`). Draft/HOLD PR #2221; no merge, no deployment.
- TDD: four newly uncovered mutations failed before change; after adding four guards, focused Nest HTTP/controller/service/appraisal tests **20/20 PASS**. Existing listing create/buy/bid guards unchanged.
- Backend full **2,954 PASS / 517 SKIP**, frontend full **2,901 PASS** (first frontend serial run timed out after 210s; rerun with two workers completed successfully). Database unit **62 PASS / 4 SKIP**, contract **41 PASS**, mobile API contract check PASS, security/release **22 PASS**.
- Lint PASS, backend/frontend Typecheck PASS, full build PASS (initial overlapping Next build failed on lock, subsequent isolated build passed). No production or shared Test build/deploy.
- Disposable PostgreSQL **17.11**: all **316 migrations (002–317)** applied on fresh synthetic DB; `moneyverse_app` effective `account_balances UPDATE=false`, `ledger_postings DELETE=false`; container removed. First three harness attempts failed due synthetic migration-role initialization, corrected with a privileged **disposable migrator only**. This does not certify Production grants or migration checksums.
- Dependency audit: production dependencies no known vulnerabilities; strict full `pnpm audit` **FAIL: 9 advisories (1 low, 8 moderate)**. `--audit-level=high` returns 0 but is not a clean audit.
- Required full-route QA ledger check **FAIL**: `artifacts/qa/full-route-ledger.json` absent; no invented evidence.
- Public version read-only: Production `/api/version` = `353c6d5d...`; official Test = `bc8cd8a6...`, neither runs candidate `3f7919e...`. Authenticated official Test exact-SHA E2E, GitOps release and independent restore **BLOCKED**.
- GitHub CI for code SHA: classify/policy/release-input/runtime-check/verify-runtime/build PASS, production dispatch SKIPPED; does not override required Test/finance gates. Final worklog-only commit will require its own CI verification.
- Handoff: finance P0 #2191 comment linked to #2221; A/C must present paused auction/P2P actions while retaining read/cancel; QA must repair DB-level direct function/ACL bypass and canonical ledger settlement before enabling. **Backend-only containment is PARTIAL, not feature completion.**
- Environment safety: no Production/Test DB write, no service restart, no main merge, no financial transfer, no migration edit; only task-owned generated build ID and disposable PG container cleaned. Other A/C/QA/planning/Gemini branches and scheduled automations preserved. **RELEASE HOLD.**
