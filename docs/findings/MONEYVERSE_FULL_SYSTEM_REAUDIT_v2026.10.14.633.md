# Woldeok Moneyverse — Live Site, Local Host, GitHub and Database Re-analysis (v2026.10.14.633)

**Date:** 2026-10-14 KST · **State:** AUDIT / BLOCKED · **English canonical** · [한국어](MONEYVERSE_FULL_SYSTEM_REAUDIT_v2026.10.14.633.ko.md)

This report contains observed facts, source-code findings, and acceptance blockers. It does **not** approve production deployment, assert exploitation, or supersede the living product plan. No production runtime, balances, database ACLs, feature switches, or other agents' worktrees were changed.

## 1. Scope, authority and identities

Documentation precedence was read from `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/DOCUMENT_CATALOG.md`, `docs/planning/PROJECT_PLAN.{md,ko.md}`, `docs/planning/INTEGRATED_PLANNING_MASTER.{md,ko.md}`, the full-route UI specification, and v603/v624/v628 audits. **Planning authority remains v2026.10.05.530 in AUTHORITY_DRIFT/BLOCKED state**; newer source or runtime versions do not silently override it.

- Inspected two GitHub repositories: `wtrdd1-hash/Woldeok-Moneyverse-Migration` and `wtrdd1-hash/woldeok-moneyverse-app`.
- Existing local web `main`: `f22e29e1` (stale); remote `main` initially `b2e5e675`, mid-audit changed to **`28bd1e85e6c85094c00197f65bfd18fd2f44f7a5`** (v224), so the isolated audit worktree was refreshed before documentation.
- Live systemd production symlink: `/srv/moneyverse-data/releases/prod-v600`. Separate test symlink: `test-v618-7fa3f245bbc3` with exact test application SHA `7fa3f245bbc3b308ae3e26ff3bfb0fbc70ba4642`. The live backend `/api/version` returns `{"id":"unknown"}`, so production's exact source SHA is **not verified**.
- Tracked web files: **3,946**; docs Markdown: **1,864**; backend TS files: **494**; frontend TSX files: **703**; Next page templates: **164** including **34** admin pages; SQL migration files: **268** numbered 002–269. These are *inventory counts, not manually verified feature counts*.
- Android GitHub `main`: `e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3` (2026-09-30); the legacy local Android checkout is not a usable Git repository because `.git/HEAD` is absent. An isolated fresh clone was inspected without modifying the legacy folder.

## 2. P0 — verified production database privilege boundary failure

**Observed, not hypothetical ACL:** The running `moneyverse-backend` process has `NODE_ENV=production` and its `DATABASE_URL` targets `127.0.0.1:5433/woldeok_moneyverse_dev` as **`moneyverse_app`**. Authentication secrets were not printed. This is the **same** database independently inspected with read-only SQL.

- PostgreSQL `public` has **241** regular/partitioned tables. Effective `moneyverse_app` rights: SELECT **238**, INSERT **237**, UPDATE **237**, DELETE **237**.
- `account_balances`, `ledger_transactions`, `users`, and `auth_sessions` show explicit ACL `moneyverse_app=arwdDxtm`; `audit_logs` is deletable by the app role. The role is not superuser and does not inherit the migrator role; rights are real explicit ACL grants.
- The database contains **549** public-schema functions, **485** `SECURITY DEFINER` functions, and **11** such functions are executable by `PUBLIC`. Access does **not** prove a function is abusable; examine signatures and inside-function authorization one at a time.
- `public.schema_migrations` shows **266** applied migrations, highest numbered **268** (latest `applied_at` 2026-10-11). Source migration **269** has not been evidenced as applied; PR #834 adds migration **270**, but it is not on current `main` and its listed revocations target only certain domain tables.
- This contradicts the strict read-only/direct-write-denial architecture in `AGENTS.md` and increases blast radius if database credentials or a SQL query boundary are compromised. **Do not blindly revoke on the live database:** inventory role-dependent queries, prove exact migration state, rehearse narrowly scoped ACL changes and rollback in isolated Test, then verify real user transactions and ledger reconciliation.

**Acceptance:** app role cannot directly INSERT/UPDATE/DELETE protected balances, ledger, users, audit, policy and mint tables; only individually audited transaction functions have EXECUTE; no unsafe PUBLIC SECURITY DEFINER calls; all functional and unauthorized-role DB tests pass at an exact Test SHA, with production backup/rollback evidence.

## 3. P0/P1 — economic integrity, authorization and source-to-UI gaps

| ID / priority | Current evidence | Required outcome |
| --- | --- | --- |
| ECON633-01 / P0 | `frontend/src/app/api/treasury/claim/route.ts:29-58` selects fixed 500/1200/3000 WLD and returns `ok:true` claiming wallet payment, without a ledger transaction. The file SHA-256 matched `production-current`. | Disable real-payment assertions until a server-authoritative, idempotent receipt is returned. |
| AUTH633-01 / P0 candidate | `frontend/src/app/api/admin/treasury/grants/route.ts` and v628 review found no real admin/ledger settlement boundary for approval; current production file matched audited main. PR #833 proposes repair, not merged. | Admin role + CSRF + reauthentication + transaction receipt; ordinary member negative tests. |
| ECON633-02 / P1 | `frontend/src/app/api/treasury/proposals/route.ts:97-104,239-254`: file overwrite, repeatable vote count, no account-scoped unique voter; `apply-grant/route.ts:107` uses static applicant ID. | Per-user unique vote, durable DB transactions, verified account identity, concurrent/duplicate tests. |
| AUTH633-02 / P1 | `backend/src/admin/admin-backup.controller.ts:33` has Session/Authenticated/Consent/CSRF guards, but not a role-based AdminGuard on the controller. | Require admin authorization and step-up for backup trigger; deny ordinary authenticated users. |
| NAV633-01 / P1 | Frontend grant review was reported to call `GET /api/v1/admin/treasury/grants`; production Nest backend probe answered **404**, while frontend has a mock fallback. Admin blog/grants menu links are missing from current main navigation; PR #833 adds entries. | Reconcile API contract and route; expose role-appropriate navigation; make failures explicit, never silent fake records. |
| ECON633-03 / P1 | Newly merged v224 Mint/Central Bank services keep issuance batches and burn certificates in application-memory arrays (`backend/src/mint/mint.service.ts`), although route names and UI imply official monetary operations. Not in production release as verified by SHA. | Mark simulation explicitly or implement approved settlement/ledger, audit, durable state, idempotency, dual control and Test role-negative cases before release. |
| SEC633-01 / P1 | Current `frontend/src/app/api/admin/seo-audit/route.ts:13-53` returns hard-coded “100%” and indexed percentages; default-secret, public IndexNow and concurrent JSON-write issues are detailed in v603. | Replace with provenance-bound service metrics; fail closed on missing keys; rate-limit and authenticate submission routes. |

These findings document code paths and expected misuse conditions, **not proof of a successful attack or a change to any member's balance**. PR #833 `fix/ui-backend-truth-v2026.10.14.629` has two failing runtime-check jobs; dependent PR #834 `v630` reports eight successful checks against its **v629 base**, not independent main/production acceptance. Neither is merged into current main.

## 4. Frontend, responsiveness, SEO and acquisition

- `frontend/src/app/page.tsx` contains no server-rendered `<h1>` in the inspected source. A representative public page rendered HTTP 200 but still displayed fixed “100% Verified”, virtual KRW equivalence and finance figures whose measurement provenance is unproven.
- Mobile clipping heuristic `scripts/audit-mobile-clipping-sentinel.mjs`: **18/21 pass**, three text-pattern failures (`html/body max-width`, `overflow-x`, header session padding). This **does not prove actual visual clipping**. Prior admin SEO mobile tab/overflow and 34 admin-screen five-pass browser acceptance remain BLOCKED (v530/v624).
- SEO dashboard's apparent 99–100% indexing and global 4.9 rating snippets are not supported by observed Search Console/review datasets. URL submission, index inclusion, real rankings and conversions are distinct measurements. English/Korean and Japanese/Chinese finance content must be checked for correct per-locale canonical/hreflang, dated source assumptions, crawlability and conversion-path clarity.
- The home, robots and sitemap returned HTTP 200 through public HTTPS, but timing samples of roughly 2–7 seconds require repeat p50/p95, cache/RUM and browser CWV testing before calling it persistent slowness.
- Representative backend GET probes: `/health` **200**, `/api/v1/stocks` **200**, unauthenticated work/tasks **401**, marketplace/auctions **401** (expected protection), `/api/v1/admin/treasury/grants` **404**. Unauthenticated public `/app-api/v1/account/identities` returned **401**, which is *not* a reproduction of the older authenticated HTTP 500 defect.

## 5. Android, QA, CI and release

- Android `app/build.gradle.kts`: versionCode **35**, versionName **1.3.4**. Previous Android audit identifies a separate `ApiClient` UA version literal **1.3.0**; check the actual Kotlin code before changing release identity. `strings.xml:16` contains a `test_account_hint` resource with credentials-like wording; do not publish its value. Revoke any real shared test login after validation.
- Fresh latest-main Node built-in test selection: **12 passed / 0 failed** (backup restore evidence, mandatory checks, five-pass ledger fixtures). `bot/scripts/qa_ads_sponsorblock_verification.mjs` has a **confirmed JS syntax error** at line 7. Clean audit worktree has no installed root node_modules; full Nest/Next dependency-backed typecheck, all tests, build, Android Gradle, authenticated E2E and five complete browser passes were **not run**, so they are not passed.
- `main` v224 introduces bank/mint admin panels and service paths; fresh main CI results were still pending/skipped in the observed listing. **22 open pull requests** were observed; changes under review must not be treated as deployed.
- Backend, frontend, Discord bot, MCP, Nginx and Docker services were active; public HTTP health was 200. Host RAM ~39%, root disk ~58%. Service-active and HTTP-200 signals are necessary but insufficient functional acceptance.

## 6. Ordered remediation and evidence gates

1. **P0 database:** map effective ACLs and runtime dependencies, confirm all 11 PUBLIC executables and migration checksums, isolate a prod-like Test clone, deny direct protected-table mutation and restore DB immutability; demonstrate authorized and unauthorized flows and ledger reconciliation before zero-downtime rollout.
2. **P0 economic truth:** stop claiming successful WLD rewards/treasury grants/burns without a durable authoritative receipt; correct admin permissions, identity and duplicate-claim/vote guarantees.
3. **P1 UI ↔ API:** inventory each member/admin route with link, role, endpoint, error/empty state, persistence and receipt; merge reviewed v629/v630 fixes only after red CI gates are repaired and Test passes.
4. **P1 mobile & SEO:** authenticated visual tests across 320/360/390/430/768/1280px, keyboard/zoom/landscape, semantic H1, rating and indexing provenance, locale canonical and user-conversion measurement.
5. **Release:** exact source SHA → CI → isolated Test backend/DB/UI/security → snapshot and reversible zero-downtime production promotion, with post-promote verification. Documentation-only PR must not auto-promote.

**Verification boundary:** No balance changes, SQL writes, grants/revokes, switch toggles, source fixes, production redeployments, destructive checks, or authenticated monetary transactions were performed. An isolated worktree and a fresh Android clone were the only checkouts created.
