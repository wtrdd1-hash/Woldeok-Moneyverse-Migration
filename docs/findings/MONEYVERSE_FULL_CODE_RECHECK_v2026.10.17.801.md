# Moneyverse Full Code, Runtime and Release Recheck — v2026.10.17.801

**English canonical** | [한국어](MONEYVERSE_FULL_CODE_RECHECK_v2026.10.17.801.ko.md)
**Status:** AUDIT / BLOCKED — evidence only; neither Test nor Production acceptance or application release.
**Observed:** 2026-10-17 21:45–22:02 KST using the authorized MiniPC MCP, isolated git worktree, read-only SQL snapshot, local HTTP probes, isolated JS test execution and GitHub.
**Authority:** docs/DOCUMENTATION_POLICY.md → docs/planning/PROJECT_PLAN.md → docs/planning/INTEGRATED_PLANNING_MASTER.md, plus AGENTS.md and docs/RELEASING.md. Historical assertions were not substituted for live proof.

## Exact source and environment identity

- Audited web application code: bca8d54a6ef5b2a4903429c9db02e662d2a66cd2 (v800). During review main advanced to 2a84687fd2d54608deec17c6651df32fe0025422; the sole intervening change was the non-authoritative root implementation_plan.md; no application code changed. Refetched and rechecked main.
- Observed Test GET /api/version: bca8d54a6ef5b2a4903429c9db02e662d2a66cd2, HTTP 200. Test /health: HTTP 200. But read-only release identity preflight with that candidate reports ok=false: manifest_sha_mismatch and frontend_artifact_sha_mismatch. Both physical frontend .next/BUILD_ID and manifest correspond to 50fb639556213e925086d0643bef35fb11ec1dd3. This is a concrete release blocker irrespective of backend health.
- Observed Production GET /api/version: 176ca04ecfbd673e7f1057cdf83a9b92ea8f8272 (v717), HTTP 200; /health HTTP 200. The active v717 backend/frontend service working directories match their immutable release paths. Older v600 processes coexist but are not sufficient to identify public traffic.
- Anonymous read-only Test GET spot checks: /, /stocks, /wallet, /work, /blog, /admin, /admin/api-health, /admin/blog, /tools, /ko, /en, /app-api/v1/content/status returned 200; /bank and /clubs returned 307; /news returned 404 and is not classified as a bug without an authoritative route requirement. 200 on admin pages does not prove an authorized admin flow.

## Live financial release gate — BLOCKED

Source: scripts/release/verify-financial-readiness.mjs, with its readFinancialSnapshot executed as a repeatable-read, READ ONLY SQL transaction and ROLLBACK; database woldeok_moneyverse_dev, role moneyverse_app. The original CLI could not resolve pg from the broken legacy checkout dependency link, so the same imported evaluator/read-only snapshot were executed using a separately installed release dependency; source was not edited.

| Measure | Observed |
| --- | ---: |
| Account-balance rows | 40 |
| Accounts with uncertified ledger/projection difference | 19 |
| Net unexplained difference | +4,779,188 WLD |
| Non-zero balances without postings | 5 |
| Such accounts' balance total | 2,627,807 WLD |
| Unbalanced debit/credit transactions | 0 |
| Transactions without postings | 0 |
| Core tables directly writable by application role | 5 of 5 inspected |

Writable protected tables: account_balances, accounts, ledger_transactions, ledger_postings, system_treasury_vaults. Release evaluator returned status BLOCKED, including direct_application_financial_dml and uncertified opening/ledger drift blockers. These are **uncertified differences**, not evidence of missing or misappropriated WLD. Do not plug differences or revoke grants against live data without provenance, disposable-clone tests and rollout/rollback verification.

## Source checks and test evidence

- Isolated pnpm offline install: 842 packages reused; no package download. Web worktree was separated from main and other agents.
- Full workspace typecheck: PASS (shared contract, database package, NestJS backend, Next.js frontend).
- Full ESLint: exit 0, 0 errors, **1,076 warnings**. Most observations are unused symbols/parameters; this is quality debt, not proof of a live incident.
- Frontend Vitest: **239 test files, 1,267 tests passed, zero failures**. Console included React act() warnings; these are test hygiene issues.
- Backend Vitest: **161 passed / 55 skipped test files; 1,253 passed / 396 skipped tests, zero failures**. The skipped cases include database-backed tests; do not count them as passing DB E2E.
- Financial read-only evaluator regression: **15/15 passed**. Full-route QA ledger verifier regression: **3/3 passed**. These validate guard implementations, not presence of completed QA evidence.
- Mobile API contract generation/check: PASS; contract tool reported 179 enriched endpoints and 637 discovered controller methods (the different counts reflect tool scopes and do not imply full route acceptance).
- Route inventory: **166 Next page routes, 34 administrator routes, 31 dynamic routes**; no duplicated page routes. Authenticated five-pass evidence for all routes, accessibility, locale and dynamic negative scenarios was not produced by this audit. v530 requirement remains BLOCKED.
- Source-level telemetry truth risk: frontend/src/app/admin/api-health/api-health-dashboard.tsx defaults missing globalSuccessRate to 100, averageLatencyMs to 8, isLiveTelemetry to true, and fallback CPU/RAM/cache values to 15/22/99.9. This is not measured live availability; render unknown/stale explicitly when authoritative telemetry is missing.
- CI inspection: v800 Auto Integrate and Promote workflow has a success result, while Build Production Release for that commit was skipped. Neither changes the observed live v717 Production identity nor makes current Test artifacts coherent.

## Android repository

- Repository: wtrdd1-hash/woldeok-moneyverse-app, main ee97ddf (2026-10-15), app version 1.3.5, compile/target SDK 36, debug backend test.easy-scraping.com, release backend easy-scraping.com. The legacy /home/debian checkout was incomplete, so the authorized GitHub repository was freshly cloned into an isolated audit path.
- Gradle offline task configuration succeeded. testDebugUnitTest did **not run** because ANDROID_HOME / sdk.dir is not configured on this host; build failure was SDK location not found. No APK or emulator acceptance is claimed.

## Prioritized actions and release decision

1. P0: Rebuild and stage a single exact-SHA immutable Test candidate; align Test backend, frontend artifact BUILD_ID and release manifest, then repeat host identity verification. Do not relabel an old frontend build as the new SHA.
2. P0: Reconcile opening-balance provenance and ledger/vault money conservation on a disposable Production-equivalent snapshot. Remove unnecessary app-role DML only after safe SECURITY DEFINER access and positive/negative regression are certified.
3. P0: Run the v530 five complete authenticated UI passes across 166 routes including 34 admin templates, 31 dynamic routes, locale switching, responsive geometry, keyboard access, and state-changing action/ledger evidence.
4. P1: Stop displaying synthetic success, latency and live flags when admin telemetry is unavailable; cover loading/stale/error states with regressions.
5. P1: Restore Android SDK tooling and execute app unit/build/real-device or emulator checks, plus isolated actual-DB integration suites.

**Decision:** Source-level/unit gates are substantially green; exact Test release identity and financial authorization/integrity are demonstrably **BLOCKED**. No data writes, schema migrations, feature-switch changes, Production cutover, branch integration or session modifications were performed during this audit.