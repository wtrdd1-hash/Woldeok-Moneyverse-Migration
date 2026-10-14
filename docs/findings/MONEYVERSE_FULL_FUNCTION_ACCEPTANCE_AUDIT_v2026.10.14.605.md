# Woldeok Moneyverse — Complete functional verification audit v2026.10.14.605

> **State: BLOCKED FOR FULL FUNCTION ACCEPTANCE.** This is a read-only, source-based and bounded runtime verification report, **not** proof every individual interaction works, not a penetration test and not a Production approval. English canonical; see the Korean counterpart.

## 1. Source identity, authoritative references and methodology

- Verification time: **2026-10-14 13:54–14:10 KST**, authorized Debian 13 $pc. Audited latest `origin/main=c56af867ad8f7556e53f895b0bb294c4bfc8a02d`, isolated branch `audit/full-function-acceptance-20261014-v605`; Android main `e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3`.
- First and midpoint GitHub fetch returned the same SHA `c56af867`. The source and tests use this immutable identity. Main shared worktree and concurrent Gemini changes were not touched.
- Documents consulted: `AGENTS.md`, DOCUMENTATION_POLICY, DOCUMENT_CATALOG, DOCS_INDEX, authoritative PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, PLANNING_GAP_CLOSURE, SECURITY_MASTER_PLAN, v603 audit, recent v604 bot operations and v602 strategy/SEO findings.
- Source inventory (counts, **not** exhaustive manual review): **3,938 Git-tracked files**, 164 Next page templates, 80 Nest controller source files, 63 Next route-handler files, 190 backend `*.test.ts` files (including 52 DB integration tests), 213 frontend test files. Source build was performed in a new isolated worktree with `pnpm install --frozen-lockfile --ignore-scripts`; no application/DB/production code was edited.
- Effective service units use `/srv/moneyverse-data/releases/production-current` -> **prod-v600**. Isolated Test alias -> **test-v541-gsc-aa4b6387**. The audit's latest main **is not certified to be the current production or Test deployed SHA**; do not treat prod GET smoke checks as c56 acceptance.
- Security boundary: Read-only anonymous HTTP GET samples, local unit/static checks, a read-only query of the **development database** through $pc. Did **not** use authenticated mutations, real monetary operations, logins, secrets, production DB writes, migrations, deployments or feature-switch changes.

## 2. Actual test evidence

| Gate / exact command | Result | Qualification |
| --- | --- | --- |
| `pnpm install --frozen-lockfile --ignore-scripts --prefer-offline` | **PASS**, exit 0 | Isolated workspace, 842 dependencies prepared |
| `pnpm typecheck` | **PASS**, exit 0 | Contract + DB + Nest backend + Next frontend |
| `pnpm build` | **PASS**, exit 0 | Full workspace build; Next static/dynamic route compilation |
| Backend `vitest run --exclude '**/*.db.test.ts'` | **PASS**: 1,162 passed, 29 skipped, 0 failed, 137 files pass / 1 skipped | All database-backed tests excluded; several tests use mocks |
| Frontend `vitest run` with inherited NODE_ENV=production | **FAIL**: 790 pass / 379 fail | **Invalid React testing environment**: React production export lacks `act`. This initial count must not be mistaken for 379 separate product bugs. |
| Frontend `NODE_ENV=test vitest run` | **FAIL**: **1,134 passed / 35 failed**, 19 files failed of 213 | Corrected testing environment reveals genuine contract/test mismatches needing triage |
| Database package `pnpm --filter @moneyverse/database test` | **PASS**: 7 / 7 | SQL qualification and migration source parity; NOT dev/prod DB application parity |
| Bot `pnpm bot:test` | **PASS** 4 / 4 after linking preinstalled bot dependencies | First attempt failed solely on missing `youtube-dl-exec` in isolated bot/node_modules; extra QA script still has syntax error |
| `pnpm lint` | Exit **0**, 0 errors, **1,057 warnings** | Warnings are technical debt, not vulnerability count |
| `pnpm api:contract:check` | **FAIL** | 179 endpoints generated from 624 controller methods; three tracked contract documents differ. Generated worktree changes were restored, not committed. |
| QA: backup, release, route ledger `node --test ...` | **PASS**: 12 / 12 | Contract tests only, not real authenticated 5-pass route E2E |
| Bot extra `node --check bot/scripts/qa_ads_sponsorblock_verification.mjs` | **FAIL** | Invalid quoted multiline string at line 7; previously reported SEC-603-10 still exists |
| Android `./gradlew testDebugUnitTest --offline` | **BLOCKED** | Offline Foojay Gradle resolver plugin absent |
| Android `./gradlew testDebugUnitTest` | **BLOCKED** | Online resolves initial plugin but Android SDK/ANDROID_HOME not installed on this workstation; no mobile unit tests actually ran |

## 3. Frontend failures — exact test-file grouping

These are **35 assertion failures across 19 files**; passing compilation cannot make them accepted. A failed source-text assertion may mean a stale test, not automatically a broken page.

| Area | Failed assertions | Key files / next action |
| --- | ---: | --- |
| Casino routes/themed UI | 7 | `src/app/casino/dice.test.ts` (5), `game-theme-regression.test.ts` (2); reconcile redirected `/casino` -> `/arcade` with obsolete casino screen assertions and policy |
| Commerce/profitability click contract | 3 | `src/app/e2e-click-profitability.test.ts`; real user simulation still requires end-to-end authority |
| Notifications/races | 5 | `notification-center-modal.race.test.tsx` (3), `account/notifications/unread-count.test.ts` (2); concurrency and stale state proof required |
| Responsive/UI/contrast | 9 | `color-contrast-regression.test.ts` (2), `mobile-responsive-regression.test.ts` (2), `brand-responsive.test.ts` (1), `site-header-responsive.test.tsx` (1), `admin/admin-mobile-responsive.test.ts` (2), `truncated-list.test.tsx` (1) |
| SEO + public routing | 6 | `search-indexing.test.ts` (2), `seo-routes.test.ts` (2), `guide/guide.test.ts` (2) |
| Admin/SEO/developer | 2 | `admin/seo/admin-seo.test.tsx` (1), `developer/developer-access.test.ts` (1) |
| Gateway/services | 2 | `lib/app-gateway.test.ts` (1), `lib/service-impact.test.ts` (1) |
| Calculator | 1 | `tools/compound-calculator/compound-calculator.test.tsx` (1) |

**Release gate**: Each failed test must be classified as a real regression, intentional feature change with updated authority/contract, or a defective test. Neither deleting a failing assertion nor relabeling failures as tests is acceptable without proof.

## 4. Read-only runtime and development DB

- Sampled **63 HTTPS anonymous GET endpoints**, including calculator categories, stocks/bank/treasury/work/advisor, public SEO pages, locale variants, admin page and sitemap; **61 returned HTTP 200, one `/business` returned HTTP 404, one stock-calculator longtail URL disconnected on the first request**. Retest found the latter HTTP 200. `/businesses` returned 200 and is the actual route. First sequential GET of `/status` timed out, later retries returned 200. These are bounded public accessibility signals, not user flow acceptance.
- `/app-api/v1/account/identities` returned **401 when anonymous**, not evidence that previously reported **authenticated** 500 is fixed. The Nest private `http://127.0.0.1:3000/health` returned 200; `/api/v1/auth/viewer` without session returned 401 and `/api/v1/stocks` 200.
- Dev DB (explicitly **`woldeok_moneyverse_dev`**, not production): 241 public tables, 549 public functions, 485 SECURITY DEFINER functions. 831 ledger transactions and 1,692 postings (846 credits/846 debits); query grouping postings by transaction found **0 unbalanced**, **0 transactions without postings**. This is a snapshot-level integrity signal, not a transactional concurrency or production reconciliation proof.
- Dev database schema_migrations has **266 rows**. The current source contains **268 numbered migration files 002–269**; the development DB has **no applied filename with number 237 or 269**. **GAP-605-DB-01**: classify whether #237 was deliberately bypassed/renamed and whether #269 is pending. Do not apply migrations automatically. Static source parity 7/7 passing does not negate database application drift.
- Live feature switches in development DB show casino, stock corporate action, economy_auto_policy, etc. enabled; existence of a switch does not prove the functionality or regulatory authorization.

## 5. Domain-by-domain acceptance matrix

State terms: `SOURCE_TESTED` = unit/source gates; `PUBLIC_GET` = unauthenticated reachability; `BLOCKED` = unresolved gate; `NOT_VERIFIED` = no safe authenticated/e2e proof. A domain can have multiple states.

| Domain | Evidence | Current acceptance decision |
| --- | --- | --- |
| Authentication, consent, OAuth, session/2FA | Backend units, anonymous 401 | **NOT_VERIFIED**: signup, logout, recovery, OAuth callback, admin step-up E2E |
| Wallet, ledger, reconciliation, transfer | Development DB zero-unbalanced snapshot; backend unit | **NOT_VERIFIED**: real money actions, app-role privilege, idempotency/races; dev migration drift |
| Stocks, trade engine, chart, whale/copy, derivatives | Public GET /stocks, unit/source | **NOT_VERIFIED**: order placement and settlement not exercised |
| Bank, credit/loans, bonds/repo | Public GET /bank; backend unit | **NOT_VERIFIED**: repayment, fees, balance guards and accrual under live DB |
| Treasury, grants, DAO, citizen dividends | Public GET /treasury; prior code review | **BLOCKED**: file-based voting duplication and fake payout success from SEC-603 remain |
| Casino, games, fairness, jurisdiction | /casino GET, dev switch enabled | **BLOCKED**: 7 frontend test failures and policy/redirect authority drift |
| Work, employment, skills/early game | /work GET and backend unit | **NOT_VERIFIED**: reward DB functions and full user loop |
| Business, guilds, crowdfunding, enterprises | /businesses GET; /business 404 | **NOT_VERIFIED**: user activities and financial settlement; verify all links point to canonical path |
| Community, board, support, notifications | /support GET; frontend tests | **BLOCKED**: 5 notification race/unread failures, no authenticated flow |
| Admin, audit, backup, security and operations | Anonymous /admin/seo GET; source | **BLOCKED**: source lacks AdminSessionGuard in backup trigger; authenticated 2FA negative E2E absent |
| SEO, locale, sitemap, calculators, blog | Sitemap 1,012 locs; GET sample; build; frontend tests | **BLOCKED**: route/indexing tests, calculated rendering assertions, mock metrics & IndexNow control; cannot claim indexed |
| Economy AI, autonomous SWF, monetary controls | Service running, backend units only | **NOT_VERIFIED**: safe bounded decisions, permissioned fund flow and DB-backed audit |
| Discord bot, music, outbound notifications | Bot 4/4 tests, service active | **SOURCE_TESTED**, **NOT_VERIFIED**: Discord gateway delivery and voice-session E2E |
| Android + mobile BFF API | Android repository cloned, API 179 generated | **BLOCKED**: missing SDK and schema contract drift; no authenticated mobile interoperability |
| Infrastructure, release, backups, monitoring | Services active, backup/release QA 12/12, /health 200 | **NOT_VERIFIED**: backup restore, staging exact-SHA E2E, failover and zero-downtime promotion |

## 6. Still-present source risks from v603

The latest main retains the static default internal credential fallback, missing role guard for admin backup triggers, unauthenticated IndexNow submission handler, JSON-file DAO without durable actor identity, grant applicant fixed ID, and treasury claim returning payment success without a ledger call. These are confirmed **source indicators**; no live vulnerability was exploited. See [v603 security audit](MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.md) for exact line/file risk descriptions and remediation gates.

## 7. Prioritized fixes and release gates

1. **P0 safety/financial truth and API authorization**: fail-closed internal secrets; admin backup role and reauthentication; DAO unique vote ledger; durable grant ownership; no success without canonical ledger receipt; IndexNow authorization/rate limits.
2. **P1 reliability and Test green**: triage each of 35 React test failures and fix product or update approved contracts; notifications races, mobile responsive, admin SEO, calculator SEO, casino re-routing. Restore generated mobile contract parity; investigate source/dev migrations 237 and 269 without applying blindly.
3. **P1 staging acceptance**: regenerate isolated staging from the exact remediation SHA; run DB-backed negative/transaction tests with dedicated isolated DB, logged-in admin/member E2E across all routes with five passes and backend health; verify key Product/SEO/locale flows against current requirements.
4. **P2 operational hygiene**: pin NODE_ENV=test for Vitest, reduce 1,057 lint warnings; fix bot QA script syntax; provide Android SDK then run emulator/unit/API compatibility; verify bot live session safely; clean obsolete links and source-vs-release manifests.
5. A remediation requires a **new code branch**, CI green, exact-SHA isolated Test, database integrity and stakeholder review before an independently authorized **zero-downtime Production** rollout. This v605 report contains **no production changes**.

## 8. Evidence and limitations

- Raw sanitised evidence: `docs/findings/evidence/function-audit-v605/runtime-get-smoke.json`, `frontend-failure-groups.json`, `audit-summary.json`. Local uncommitted logs retain full command output under `/srv/moneyverse-tasks/function-acceptance-audit-20261014-v605/` for follow-up; secrets are not included in GitHub.
- GitHub combined commit status lookup returned **no status entries** and PR-triggered workflow lookup returned no associated run; **not evidence CI passed**.
- Full program functional correctness requires test accounts, isolated current-sha Test backend/database and authenticated, permission-aware E2E. These were outside the safe read-only boundary for this task and must not be silently declared complete.
