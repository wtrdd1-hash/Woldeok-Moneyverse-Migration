# Moneyverse Remediation Implementation Task Matrix (Proposed) — v2026.10.16.713

> **For future implementing agents:** read the [master proposed spec](PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.md) and [P0 finance design](P0_FINANCIAL_AND_DATABASE_REMEDIATION_DESIGN_v2026.10.16.713.md) first; use Superpowers `using-git-worktrees`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`. **Implementation is NOT approved by this plan's existence.**
>
> [한국어 작업별 계획](REMEDIATION_IMPLEMENTATION_TASK_MATRIX_v2026.10.16.713.ko.md).

**Goal:** every production-visible feature has a verified, actor-scoped, evidence-backed end-to-end path; financial changes conserve WLD and database least privilege; site and app work correctly for intended locales; exact-SHA, isolated Test and zero-downtime release rules stay enforceable.

**Tech stack:** PostgreSQL 17, NestJS, Next.js App Router 16, TypeScript, Vitest, Node test runner, Kotlin/Compose/Retrofit/Gradle, Nginx, systemd and GitHub Actions.

**Versioning & gate:** draft task IDs T713-01..26 are sequence identifiers, not deploy versions. Each accepted implementation slice gets a new monotonic project update version and a standalone branch. Do not choose SQL migration numbers before a current-main and authoritative deployed-schema check. RED–GREEN–REFACTOR and actual evidence are mandatory for each task.

## Common execution protocol for every task

- [ ] Read latest GitHub `main`, documentation governance, adopted finance/UI specs, exact relevant file, PRs and active mini-PC worktree; record origin SHA and assigned owner; no overlapping agent file writes.
- [ ] Declare **actor / route / BFF / backend / SQL/worker / result** mapping and observable failing scenario; document exact source SHA, runtime identity and test environment.
- [ ] Write regression test that fails on the observed issue (RED), verify it fails for the right reason, implement minimal controlled fix (GREEN), run full relevant tests, then refactor and verify again.
- [ ] Add 0/1/high-boundary, invalid, unauthorized, duplicate, concurrent, timeouts and unknown-result cases where money/auth involved.
- [ ] Record success/failure/skipped counts; not enough to run compiler or unauthenticated GET. Include EN/KO docs and internal/GitHub update, separate PR/CI, mid-work main recheck.
- [ ] After isolated Test acceptance, inspect latest main and rerun changed exact SHA; require backups, matching frontend/backend and database, surviving session, release/revert playbook. No automatic Production elevation merely because a PR exists.

## Phase 0 — Inventory and authority evidence (no runtime change)

### T713-01 P0: baseline plan/source/runtime/branch ownership
**Read:** `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/RELEASING.md`, v711 audit PR, v701 release and v710/v712 work.
**Deliver:** source/production/test/Android SHA register, mutually exclusive branch owner table, frontend route inventory (including 163 Next page components baseline), 82 controller + 78 BFF handler mapping.
**Test:** link/authority checker, file path validation, PR overlap diff; zero unowned P0 and zero unsupported implemented claims.
**Gate:** report discrepancies before code work; do not silently merge concurrent branch.

### T713-02 P0: DB authority and migration parity census
**Read:** `packages/database/migrations/*.sql`, `packages/database/migrate.sh`, `packages/database/test/migration-parity.test.ts`, `ops/security/v701-*.sql`.
**Deliver:** per DB role and table effective SELECT/INSERT/UPDATE/DELETE, every definer identity/owner/search_path/PUBLIC/EXECUTE, triggers and applied `schema_migrations(filename,checksum)`, migration gap and blast-radius graph.
**Test:** read-only principal queries then restored-Test negative GRANT/REVOKE; do not apply candidate 269–271 blindly.
**Gate:** DBA signs a forward-only migration and exact permission target matrix.

### T713-03 P0: direct monetary mutation dependency inventory
**Read:** `backend/src/casino/pvp-arena.repository.ts`, `stock/stock-league.repository.ts`, `admin/bonds/treasury-bond.repository.ts`, `admin/pension/national-pension.repository.ts`, `admin/fx/fx.repository.ts`, `admin/treasury/auto-swf.service.ts`, `marketplace/marketplace.service.ts`, `marketplace/black-market.repository.ts` and definer SQL.
**Deliver:** each reachable balance write, funding source, caller, actor, idempotency, ledger rows, outbox, reason for scoped exception, policy/switch condition. No production status inferred from grep alone.
**Test:** static check forbidding new direct financial DML in backend except approved definer implementation; baseline before enabling gate.

## Phase 1 — Finance truth and contained repair (P0)

### T713-04: independent reconciliation storage and read-path
**Modify candidate:** `backend/src/admin/treasury/treasury.repository.ts`, `treasury.service.ts`, `treasury.controller.ts`; create new numbered DB migration + isolated `backend/src/admin/treasury/*reconciliation*.db.test.ts`.
**Contract:** persistent reconciliation run stores snapshot H, separate account/ledger/fiscal/vault totals, mismatches, `PENDING/RECONCILED/DISCREPANCY/INCOMPLETE/UNAVAILABLE`, actor-scoped admin detail.
**RED:** before fix `RECONCILED` incorrectly returned under 1-WLD Test mismatch or SQL error.
**GREEN:** calculate independent totals at consistent snapshot and hold risky fiscal issue; no surprise balance correction.
**Pass:** deliberate 0/1 WLD difference, missing ledger, stale job, DB failure, overlapping writes and admin role tests.

### T713-05: safe visual state and fiscal action hold
**Modify candidate:** `frontend/src/app/admin/treasury/*`, `backend/src/admin/treasury/treasury.service.ts`, supporting BFF routes; user public treasury read as applicable.
**Contract:** wrong empty-green state removed, timestamp from stored completed run, readable hold reason and unique incident reference; strict separation of read vs disbursement rights.
**RED:** stale or failed reconcile appears green; admin able to disburse without accepted evidence.
**Pass:** unknown remains unknown, privileged disbursement denied, support info accessible, no positive UI from HTTP 200 alone.

### T713-06: domain-only canonical ledger command + SQL authorization
**Modify candidate:** new contiguous `packages/database/migrations/NNN-*.sql`, supporting `backend/src/core` domain DB adapter and `backend/src/core/financial-settlement-v653.db.test.ts`.
**Contract:** narrow actor-bound `commandId/requestHash/policyVersion/amountWld`, atomic posting+balance+domain+outbox and typed immutable receipt. Preserve existing adapted ledger schema; no app raw primitive EXECUTE.
**RED:** app direct write unexpectedly succeeds and duplicate/changed payload incorrectly credits twice.
**Pass:** all app forbidden financial DML denied after staged cutover, actor-scoped RPC succeeds, replay same key stable, conflicting payload rejected, no float/overflow.

### T713-07: PvP room settlement migration
**Modify candidate:** `backend/src/casino/pvp-arena.repository.ts`, `pvp-arena.controller.ts`, `pvp-arena.test.ts`; add `pvp-arena.db.test.ts`.
**Contract:** choose Model A one-loss debit / one-win profit / treasury fee; preserve transaction locks and crypto RNG; room, ledger and outbox single commit.
**RED:** direct balance mutation with no journal entries.
**Pass:** stake10,000→−10,000/+9,400/+600, one transaction, replay+two joiners+rollback+insufficient funds+2^53 and status checks; no duplicate stake debit.

### T713-08: market/stock league and auction escrow
**Modify candidate:** `backend/src/stock/stock-league.repository.ts`, `backend/src/marketplace/black-market.repository.ts` and respective Nest/BFF tests.
**Contract:** one fee movement per league entrant, one winning auction, refunded losing bids, confirmed seller/treasury payouts without synthetic WLD.
**RED:** double entry fee / double settlement / canceled bid leaves trapped balance.
**Pass:** 50 parallel join/claim events, refunds and ledger supply unchanged.

### T713-09: bonds/pension/FX/SWF/cross-domain migration
**Modify candidate:** `backend/src/admin/bonds/treasury-bond.repository.ts`, `admin/pension/national-pension.repository.ts`, `admin/fx/fx.repository.ts`, `admin/treasury/auto-swf.service.ts`; new tests per domain.
**Contract:** funded coupons, year/day conversion agreed, 95/5 pension allocation, treasury matching source, exact FX spread, no projected SWF yield counted as current cash.
**RED:** each direct balance mutation lacks ledger counterpart or insufficient funding accepted.
**Pass:** per domain isolated DB ledger reconciles, no issuance outside certificates and overflow/rounding safe.

### T713-10: conditional production privilege revoke and migration close-out
**Modify candidate:** newly numbered `packages/database/migrations/NNN-*.sql`, `packages/database/test/migration-parity.test.ts`, `backend/src/security/database-boundary.db.test.ts`.
**Contract:** only after T713-06..09 no direct DML callers, narrow EXECUTE and surviving auth-session allowances; search_path/default privileges resistant to future drift.
**RED:** any protected raw INSERT/UPDATE/DELETE allowed via app/PUBLIC/inherited role.
**Pass:** deny matrix for relevant tables and all valid domain calls, completed schema checksums and backup/rollback evidence. Separate approved finance release.

### T713-11: historical reconciliation, compensation and receipt integrity
**Read/modify candidate:** `backend/src/ledger-corrections.db.test.ts`, economy/treasury reports and administrative incident registry.
**Contract:** immutable discrepancy case, dual approval, compensating transaction with `reverses_transaction_id`, no past-row rewrite/no silent issuance.
**Pass:** verified opening balance and immutable journal before/after; exposed affected receipt status, no data loss.

## Phase 2 — Functional UX and protection

### T713-12 P0: auth/OAuth/consent/2FA identity and session chain
**Inspect:** `backend/src/auth`, `backend/src/security`, `frontend/src/app/auth`, `frontend/src/app/app-api`, `docs/planning/PROJECT_PLAN.md`.
**Tests:** register/login/logout/OAuth callback/provider unavailable, consent/age, cookie HttpOnly/SameSite/CSRF, step-up expiration, lost device, session across backend restart, anonymous 401 and cross-member 403, account identities actual signed-in response.
**Pass:** unrelated actor cannot fetch/mutate another account; no session loss after zero-downtime change.

### T713-13 P0: role-specific full-route CTA and API traceability
**Inspect:** `frontend/src/app/**/page.tsx`, `frontend/src/app/app-api/**/route.ts`, `backend/src/**/*controller.ts`, `packages/contract/src/route-map.ts`, `scripts/qa/generate-full-route-inventory.mjs`.
**Deliver:** inventory with page/action→BFF→Nest→DB/work→role/switch→test→receipt. Any missing route, impossible CTA, fake toast, step-up-only link becomes tracked defect.
**Pass:** all discovered routes sampled across five browser passes and mobile/desktop, explicit 401/403 vs 404 parity, no orphan backend action advertised as available.

### T713-14 P1: credit score, money precision and banking repayment
**Inspect:** `backend/src/bank/bank.controller.ts`, `credit-rating.service.ts`, related tests, actual actor loan/work history.
**Contract:** replace fixed age30/job5/repayments3/overdue0 with evidence-backed fields; if unavailable return `INSUFFICIENT_DATA` and labeled simulation separate from real decision; request WLD exact integers, no Number conversion.
**Pass:** two user histories produce validated differences; fabricated mock flags never used for real borrowing limit; >2^53 safe.

### T713-15 P1: member content, job rewards and state machine truth
**Inspect:** `frontend/src/app/work`, board, shop, notification, wallet receipt, first-session onboarding and `backend/src/work`.
**Contract:** action accepted vs ledger settled vs delivery confirmed separated; local-only save disclosed; claim loops idempotent; no guaranteed +10k fake wallet deposits.
**Pass:** server deny/error/retry updates UI honestly and receipt binds actor, 401/403, wallet delta and backend event.

### T713-16 P1: administrative DAO/grants/security controls
**Inspect:** `frontend/src/app/api/treasury/proposals/route.ts`, `frontend/src/app/api/treasury/apply-grant/route.ts`, `backend/src/admin`.
**Contract:** DB owner-bound unique vote and grant action, audited role/step-up, no JSON file blind writes, immutable receipt and unknown-outcome recovery.
**Pass:** duplicate votes/parallel approval do not double-count/pay; filesystem unwritable case returns explicit error, no fake success.

### T713-17 conditional P0: inter-service fallback secrets and exposed integrations
**Inspect:** `frontend/src/app/api/blog/generate/route.ts`, `frontend/src/app/api/discord/broadcast/route.ts`, `backend/src/seo/seo-daily-digest.service.ts` and related secrets guards.
**Contract:** independently configured high-entropy per-service credentials, fail closed when absent, rotate legacy, no static fallback or token in frontend bundle/logs.
**Pass:** absent/wrong auth 401/403 with no external side effects, valid scoped signature only; actual Production secret presence tested without ever printing values.

## Phase 3 — International growth, SEO and client operation

### T713-18 P1: v710 blog source reconciliation & international SSR
**Owner:** current v710 branch owner exclusively until handoff.
**Target files under v710:** `frontend/src/app/blog/page.tsx`, `blog/[slug]/page.tsx`, `blog/blog-data.ts`, `frontend/src/app/[locale]/blog`, `frontend/src/app/sitemap-blog.xml/route.ts`, `frontend/src/proxy.ts`.
**Contract:** KR/EN-US/JA-JP/ZH-CN distinct factual editor-reviewed content and localization state, self-canonical per URL, fully reciprocal hreflang and only eligible sitemaps, images/alt and source timestamps.
**Pass:** HTML actually localized in 4 anonymous curl/browser requests, no same-root canonical trap, mobile/desktop and signed-in language selection override; only after v710 integration.

### T713-19 P1: SEO admin provider evidence and claim removal
**Inspect:** `frontend/src/app/admin/seo`, SEO Next BFF and `backend/src/seo`.
**Contract:** `submitted`, `provider_ack`, `inspected_indexed`, `impressions`, `clicks` distinct with source and freshness; owner/admin RBAC and CSRF; no guaranteed star reviews/instant indexing.
**Pass:** GSC temporarily down -> unknown/stale, no false 0-indexed count; sitemap validates only indexable self-canonicals; source dates/countries safe.

### T713-20 P1: Android exact contract, version and device login
**Owner:** Android repo own PR, web API changes coordinated but not nested in same source branch.
**Inspect:** `app/build.gradle.kts`, `ApiClient.kt`, `MoneyverseApi.kt`, `ApiContractCompatibilityInterceptor.kt`, native UI screens.
**Contract:** versionName and User-Agent share generated version, authorized HTTPS debug Test/release Prod hosts, no automatic retry of ambiguous WLD POST, exact UTF-8/JSON amounts, cookies/CSRF, API contract 179-method source parity.
**Pass:** Gradle unit + instrumented physical/emulator login/account/wallet/transaction recovery and signing verification. Source read is not a build.

### T713-21 P1: Discord QA and webhooks
**Inspect:** `bot/scripts/qa_ads_sponsorblock_verification.mjs`, `bot/package-lock.json`, `bot/music.test.mjs`, integration route.
**Contract:** correct multiline string syntax, offline/reproducible bot dependency install; signature and external API rate limit/permission, voice disconnect/retry state and no secret echo.
**Pass:** syntax 0 error, bot tests 100%, mocked failures and actual authorized QA voice path; network/provider downtime not represented as app success.

### T713-22 P1: worker ownership & Outbox
**Inspect:** `backend/src/scheduler`, `backend/src/admin/treasury/auto-swf.service.ts`, AI news and stock scheduler, v697 release services.
**Contract:** persisted lease by job type + fencing token + command idempotency; takeover after lease expiry; atomic outbox claim, immutable publication and replay status.
**Pass:** two active backend generations cannot both commit the same economic job, no lost outbox on process kill, read-only job metrics across handover.

### T713-23 P2: warnings, accessibility, responsive and performance
**Inspect:** full ESLint warnings, `frontend/src/app/globals.css`, admin nav/sidebar, browser budget and server runtime logs.
**Contract:** prioritized unused vars/React effects/unsafe any and keyboard/touch targets; real p75 LCP/INP/CLS evidence before tuning; no disabling DB fsync/WAL, no destructive disk cleanup.
**Pass:** no new ESLint warnings from 1,088 baseline; relevant existing warnings reduced, WCAG 2.2 scenarios pass, no SLO regression.

### T713-24 P2: truthful documentation and operations catalog
**Inspect:** `DOCS_INDEX.md`, `docs/DOCUMENT_CATALOG.md`, `PROJECT_PLAN.md`, existing old marketing/release content.
**Contract:** distinguish planning, candidate code, Test verified and Production verified per feature, correct fabricated 4.9 review/instant indexing/guaranteed reward marketing, preserve historical records.
**Pass:** no broken links, bilingual paired references, exact historical-vs-current authority annotation.

## Phase 4 — Independent Test and release

### T713-25 P0: exact-SHA Test + negative security/ledger + all-route E2E
**Files:** existing `.github/workflows/ci.yml`, `scripts/release/verify-main-required-checks.mjs`, `scripts/qa/verify-full-route-qa-ledger.mjs`, `docs/RELEASING.md`.
**Pass:** every P0 needed DB test executed (none skipped), PostgreSQL migration/checksum verification, frontend/backend contract/build/test, protected role/CSRF/2FA, account conservation, live Test login pre/post restart, route × role × viewport five-pass artifacts, one same SHA across app/DB manifest.

### T713-26 P0: isolated Production blue-green and rollback acceptance
**Files:** actual Nginx/systemd host release scripts, `docs/RELEASING.md`, `docs/BACKUP.md`, v697/v701 exact runtime manifests.
**Pass:** last-known-good retained, backup restored successfully in independent environment, blue/green spare ports ready, unchanged preexisting auth session after cutover, source SHA matches, fiscal reconciliation zero, no double-job, public smoke 5 passes, roll back via verified Nginx pointer. Migration rollback only as independently approved forward correction.

## Failure triage and division of responsibility

**STOP/DO NOT PROMOTE:** unexplained money variance, duplicate WLD effect, unauthorized app financial DML, missed DB negative tests, Production/Test SHA mismatch, 2FA bypass, lost login session, two active economic job owners, missing backup restore, unapproved live migration. Failure in nonfinancial SEO content does not justify reverting live balances.

**Owners:** finance architecture/DBA owns T02–T11 and migration serial, web backend/QA owns T12–T17/T25, v710 editorial owns T18, SEO owns T19, Android repo owner owns T20, bot/ops owns T21–T23/T26, docs reviewer T01/T24. Exact assignment of people is pending; never infer another agent approved a change.

**Output per task:** exact baseline SHA, file diff, failing and passing test evidence, effective privilege or HTTP/UX capture, rollback, worklog start/middle/final, EN/KO update logs and GitHub PR. Implementation branch is never merged to Production solely due to a green PR summary.

**References:** official PostgreSQL 17, OWASP API Security Top 10, Google localized-versions, Next.js 16 generateMetadata and GitHub deployments linked in the two parent design documents.
