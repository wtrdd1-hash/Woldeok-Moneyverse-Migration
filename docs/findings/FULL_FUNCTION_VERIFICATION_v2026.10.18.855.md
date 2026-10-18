# v2026.10.18.855 — Complete Service Functional Verification (Evidence-Based)

**Review date:** 2026-10-18 (Asia/Seoul)  
**Source:** `origin/main` `11db3054` after mid-audit rebase (initial `fe689c4b`)  
**Runtime currently observed:** public Production and public Test both `e54e6843df27e01c00e0d409ddb9818f754d2c4c` (older than main)  
**Authority:** `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/PROJECT_PLAN.md`, `AGENTS.md`, `docs/RELEASING.md`. The root `implementation_plan.md` is historical and is not proof of deployment.

## Executive finding

**NOT all functions are verified as operational.** Healthy services and successful unit tests are only partial acceptance. This audit confirms broad code/HTTP health, one actual savings simulation account-isolation defect (fixed in a candidate branch), and an existing Production P0 financial integrity release blocker. It does not claim successful authenticated end-to-end transactions or actual browser/mobile viewport checks.

## Evidence matrix

| Scope | Executed | Finding |
|---|---|---|
| Frontend | Full Vitest 243 files | **1,276 PASS** after account-isolation fix; no failures |
| Backend including real database | **NEW disposable PostgreSQL 17** container, all **276** current migrations, distinct `moneyverse_app`/`moneyverse_migrator` credentials | **1,836 PASS**, **34 SKIPPED** across 217 files (214 pass, 3 skipped) |
| Misconfigured stale-DB comparison | Clone of older 214-migration Test CI DB | 69 failed with wrong role; 17 still failed with corrected roles; **all 17 disappear on a fresh current-schema DB**. Not Production defects. |
| TypeScript | `pnpm typecheck` | PASS |
| Lint | `pnpm lint` | 0 errors, **1,060 warnings** across repository; not warning-free |
| Frontend build | Next production build, source SHA-specified | PASS |
| API contract | `pnpm api:contract:check` | PASS, 179 documented endpoints; 637 controller methods inspected by generator |
| HTTP route inventory | 166 pages: 135 static / 31 dynamic, 34 admin | Production, Public Test and isolated v806 canary **each**: 151 raw 200, 13 raw 307, 2 raw 404 for deliberately nonexistent fixture IDs; **no 5xx** in 498 one-off GET/HEAD examples |
| Language response | Local canary homepage with CF-IPCountry=KR/US/JP/CN | Corresponding `ko/en/ja/zh` response headers; localized blog and glossary routes returned 200. Did **not** certify translated content, real caller IP or locale persistence. |
| Session/API security | Unauthenticated canary `/bank`, `/api/v1/banking/standing` | 307 login redirect and 401 API; `/admin`/`/wallet` may stream HTTP 200 containing Next redirect instructions but no private rendered payload. Not an admin authenticated acceptance. |
| System services | MCP read-only system status, Nginx/systemd/DB/Docker | Processes available; feature switches reported enabled, not proof of game transactions or Discord DM delivery |
| Live money integrity | **Read-only** `scripts/release/verify-financial-readiness.mjs` against actual Production service DB | **BLOCKED** — see critical findings below |

## Findings and priority

### F855-P0-01 — Production journal/authorization gate remains BLOCKED

- `moneyverse_app` retains direct `INSERT/UPDATE/DELETE` permissions on protected `account_balances`, `accounts`, `system_treasury_vaults` tables; must not trust an application role to adjust member money directly.
- Production has 40 observed balance rows; **19** have uncertified posting/balance differences totaling **+4,779,188 WLD** and **5** have balances without any ledger postings totaling **+2,627,807 WLD**. These numbers are *differences to certify*, not confirmed lost or stolen value. Individual transaction debit/credit imbalance count was 0.
- Required: independently attest provenance and opening balances; move remaining monetary writes to atomic scoped ledger functions; tighten role privileges on a disposable Production-schema clone; verify restore/recovery, authenticated flow and zero-downtime cutover. Never insert artificial compensating balances to force a green check.

### F855-P1-02 — Authenticated member simulation history crossed accounts (candidate FIXED)

- Main v806 called `getStoredSavingsPots()` and `openSavingsPot()` without an account identity; all signed-in users of one browser read/write `wdmv_savings_pots_guest`. Legacy unattributed `wdmv_savings_pots_v1` could also be copied into multiple user-scoped keys by the storage helper.
- Fix in this isolated candidate: request authoritative member identity via the existing protected wallet read API, pass `userId` into all browser simulation reads/writes, remount on identity change, **fail closed** when identity lookup is unavailable, never import anonymous/legacy simulations into named member accounts.
- RED regression reproduced both failures; GREEN UI/storage tests passed. No real WLD ledger money flows altered. Already-created unattributed guest records remain unassigned; do not auto-claim ownership.

### F855-P1-03 — Historical “5-pass complete QA” sentinel created false confidence (candidate FIXED)

- Existing `scripts/qa/full-suite-5pass-qa.mjs` mislabeled HTTP status and raw HTML regex as genuine 5-viewport layout coverage, multilingual content correctness, 100T WLD stress tests and authenticated admin/ledger transaction coverage. The `x-moneyverse-role` header in requests is not a real signed-in session; client-side redirects are not confirmed workflows.
- Fix: relabel each check as an HTTP/static heuristic, emit `BLOCKED_E2E_EVIDENCE_REQUIRED` even when raw status counts are green, and make the smoke runner exit nonzero rather than asserting full-site functional acceptance. New `assessFullSiteAcceptance` validates distinct necessary evidence classes and has RED/GREEN coverage tests. The existing strict evidence-ledger verifier remains the release-quality source.

### F855-P1-04 — Runtime/main drift and missing acceptance gates

- Public Production and public Test still serve v805 (`e54e6843`), whereas merged v806 deposit UI and this v855 fix are newer. Code present on GitHub is not public Production proof.
- **Actual 166-route × five complete authenticated browser passes, 34 admin session workflows, real mobile 320–1280px DOM bounds, full CSRF/session restart, and end-to-end domain transaction receipts were not executed in this audit.** No local Chromium/Playwright binary was available.
- These remain **NOT VERIFIED**, not green by default. 34 skipped backend tests are similarly excluded from PASS.

### F855-P2-05 — Lint warning debt and partial UX simulation realism

- `pnpm lint` exits 0 but emits 1,060 warnings. Fix by high-risk priority in isolated reviewed changes, not an unreviewed repository-wide autofix.
- 7/30/90-day savings plan examples are **browser simulations, not real term-deposit contracts**. The real compound WLD bank deposit uses the separate ledger-backed bank transfer. Simulator completion must never be counted as a backend financial transaction.

## Precise completion criteria

- Finance P0 resolved and approved from authentic source and signed opening balance evidence; read-only finance gate green.
- Branch CI, immutable source/manifest/Next build ID and real public Test parity green; authenticated session survives zero-downtime switching.
- Real signed-in user E2E exercises for each material transaction class (bank, stock, shop, work, casino, bonds, treasury, chat, grants) with authoritative DB receipts, negative cases and isolation; role/ownership/admin/CSRF security passes.
- Browser-run accessible/mobile/locale tests, all static+dynamic pages and 34 admin pages with fixtures, including error states and 5 reruns.
- No false-positive claims from HTTP-only sweeps. Re-run staged Test and only then consider Production. **Production promotion NOT authorized by this report.**

## Audit artifacts

- Internal host-only evidence: `/tmp/mv-v855-fe-after-fix.log`, `/tmp/mv-v855-be-fresh-db.log`, `/tmp/mv-v855-front-build.log`, `/tmp/mv-v855-route-raw.json`, `/tmp/mv-v855-dynamic-results.json`, `/tmp/mv-v855-finance-gate-latest.json`, `/tmp/mv-v855-QA-proof.log`.
- Task journal: [worklog](../worklog/2026-10-18-all-functional-audit-v855.md). Korean counterpart: [한국어 감사보고서](FULL_FUNCTION_VERIFICATION_v2026.10.18.855.ko.md).
