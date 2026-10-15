# Woldeok Moneyverse — Full Code, Planning and Function Audit (v2026.10.15.636)

**State: AUDIT / BLOCKED / AUTHORITY_DRIFT.** Observed on 2026-10-15 08:53–09:05 KST via the connected $pc tool and GitHub. **No production mutation, money transfer, migration, access-control change, feature-switch change, merge or deployment was performed.**

## 1. Authority and source identity

- Canonical authority order: `docs/DOCUMENTATION_POLICY.md` → `docs/planning/PROJECT_PLAN.md` (implementation authority) → `INTEGRATED_PLANNING_MASTER.md` (planning ledger) → adopted detailed specs → evidence. UI acceptance gate remains **v2026.10.05.530/BLOCKED** despite later implementation records v543/v625 and root `implementation_plan.md` v229 marketing-style release claims. Newer runtime evidence does not silently supersede product authority.
- Read `AGENTS.md`, `DOCS_INDEX.md`, `PROJECT_MEMORY.md`, the integrated master, project plan, enterprise roadmap, documentation governance, v603/v605/v630/v633 findings and recent repository history.
- Web source: `wtrdd1-hash/Woldeok-Moneyverse-Migration` main **`c03b0a9b9c3018e7257c4be1d02bcbbf44d59961`**. Initial and mid-work `git fetch origin main` agreed; 4,094 tracked files; 164 Next page templates (34 administrator), 82 Nest controllers, 62 Next API route files. Counts are inventory, **not** manual line-by-line review or functional certification.
- Android source: `wtrdd1-hash/woldeok-moneyverse-app` main **`e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3`**. The previous Android local directory had no `.git/HEAD`; freshly cloned the official main into the audit workspace. Unmerged Android PRs #23/#24/#25/#27 were not treated as shipping.
- **Actual systemd runtime:** frontend/backend work in `/srv/moneyverse-data/releases/production-current`, which targets **`prod-v600`**. `test-current` targets **`test-v618-7fa3f245bbc3`**. A later artifact `prod-v635-888311cc9240` exists with a manifest naming source SHA `888311cc` but is **not** the active symlink. `/srv/moneyverse` independently targets `prod-v600`. `APP_BASE_URL` is **https://easy-scraping.com**; do not mistake deprecated `moneyverse.wtrdd1.com` references for the active hostname.
- Backend process has `NODE_ENV=production` and points its DB URL at **127.0.0.1:5433 / woldeok_moneyverse_dev / moneyverse_app** (credential value not exposed). Backend/Frontend/bot/nginx/MCP/Docker services were active. Healthy processes do not imply feature acceptance.

## 2. Verified checks, exact-source isolated workspace

| Check | Evidence | Decision |
| --- | --- | --- |
| Frontend Vitest | 220 files / **1,206 passed**, 0 failed | PASS (unit/regression only) |
| Backend Vitest, excluding `*.db.test.ts` | 143 passed files, 1 skipped / **1,185 passed, 29 skipped** | PASS for non-DB suite; DB integration not run |
| Full TypeScript check (contract/database/backend/frontend) | Isolated clean dependency install, **PASS** | PASS; shared main backend `node_modules` links were broken, not a confirmed source error |
| `pnpm build` | Isolated exact-SHA build **PASS** | PASS; not a deployed E2E |
| `pnpm api:contract:check` | **PASS**, 179 endpoints, 637 controller methods; generated artifacts clean | PASS |
| Discord bot base `pnpm bot:test` | **4/4 PASS** after using existing host bot dependencies | PASS for limited music tests; real gateway untested |
| Bot additional advertising QA syntax | `node --check bot/scripts/qa_ads_sponsorblock_verification.mjs` **SyntaxError line 7** | FAIL |
| Anonymous HTTP smoke | public Next `/en`, `/ko`, blog, tools, stocks, SEO pages and sitemaps returned 200 after canonical redirect; `/en/business` 404, `/en/businesses` 200; unauthenticated identities and admin stocks 401; backend `/health` 200 | SAMPLE ONLY; no authenticated UI/E2E |
| Android build/device | Android SDK/emulator unavailable; PR release gates open | NOT TESTED |

Raw execution logs and pre/mid/end checkpoints are stored under `/srv/moneyverse-tasks/audit-20261015` on the host, **not** pushed with secrets.

## 3. Defect registry and code ↔ plan mismatch

| ID / severity | Source or runtime evidence | Correct acceptance condition |
| --- | --- | --- |
| **AUD-636-01 / P0 DB ACL** | Read-only DB query: public tables 241; `moneyverse_app` can SELECT 238 / INSERT 237 / UPDATE 237 / DELETE 237. Explicit `account_balances` UPDATE/INSERT, `ledger_postings` INSERT, `users` UPDATE and `audit_logs` DELETE all **true**. Of 549 public functions, 485 are SECURITY DEFINER; 11 of those are PUBLIC EXECUTE. Process connects to this DB. | On disposable Test DB prove least-privilege ACL, use audited function boundaries, verify business paths, default ACL, append-only audit, ledger invariants, recovery and role-negative tests; staged forward-only migration. **Do not indiscriminately REVOKE on live DB.** |
| **AUD-636-02 / P0 Production drift / false payout indication** | `frontend/src/app/api/treasury/claim/route.ts`: current main returns HTTP 503 instead of unposted payout; active production `prod-v600` still contains `ok: true` response. `apply-grant/route.ts` similarly main 503 / active prod success. No money movement was attempted. | Only report settlement after authenticated idempotent canonical ledger receipt; deploy exact verified SHA via isolated Test and rollback-capable promotion. Until then disable misleading success paths. |
| **AUD-636-03 / P1 Duplicate voting + lost updates** | `frontend/src/app/api/treasury/proposals/route.ts`: authenticated PUT increments `votesCount + 1` and reads/rewrites JSON without voter identity uniqueness, concurrency protection or DB atomicity. Same file in main and prod. | Unique (proposal_id,user_id), atomic transaction, idempotency, same-user/different-user concurrent negative tests and audit receipt. |
| **AUD-636-04 / P1 Admin backup privilege** | `backend/src/admin/admin-backup.controller.ts:33` uses Session/Authenticated/Consent/CSRF guards, but no Admin role or step-up guard before `@Post('trigger')` which spawns a shell backup. Backend is not directly exposed to general public, but member-role abuse path requires testing. | Admin role guard and high-risk reauth; reject signed-in non-admin in real backend integration; restrict internal proxy. |
| **AUD-636-05 / P1 IndexNow request authority** | `frontend/src/app/api/indexnow/route.ts:8` accepts POST with arbitrary caller `urls` and no caller authentication in the route, then calls `submitToIndexNow`; unchanged in active prod. This is third-party submission abuse, **not** unrestricted SSRF. | Scheduler/admin authentication, CSRF/origin as appropriate, owned HTTPS URL validation, quotas and rate limiting. |
| **AUD-636-06 / P1 Release/SEO/admin route parity** | Admin sub-nav `/admin/blog` exists in main but not active prod; `frontend/src/proxy.ts`, `admin/seo-audit/route.ts`, grant/claim routes differ between main and active prod. Main admin SEO now uses console authorization and labels submission without claiming confirmed indexing; prod legacy differs. | Explicit feature-page→nav→backend→role→state E2E matrix and canonical-locale smoke on the active release. |
| **AUD-636-07 / P1 DB schema lineage** | DB `schema_migrations`: 266 applied, latest applied 2026-10-11 UTC, highest filename prefix 268. Files 269/270/271 in current main not recorded as applied; 237 also absent from DB history. | Verify checksums/dependency graph and intended exclusions; Test migration + app-role negative tests; no silent production migration. |
| **AUD-636-08 / P1 Android release parity** | Android main `versionCode=35`, `versionName=1.3.4`; `ApiClient.kt` uses constant 1.3.0; Android strings include test/password hints; SDK/device verification unavailable. Open PRs implement other API/build fixes but are unmerged. | No credentials/hints in release resources, BuildConfig-derived version, signed/debug separation and five-pass real-device authenticated E2E. |
| **AUD-636-09 / P1 SEO truthfulness / discoverability** | Selected calculator schema contains literal `ratingValue: '4.9'`/`'4.95'`; provenance of collected ratings not demonstrated. `/business` 404 while `/businesses` 200. Sitemap 200 is not proof of indexing; admin SEO must not claim it. | Remove unsupported review markup; verify canonical/hreflang, sitemap validity, indexed coverage, Korean/global keyword acquisition and conversion separately. |
| **AUD-636-10 / P2 Documentation integrity** | `DOCS_INDEX.md:3` includes literal `<<<<<<< HEAD`. `implementation_plan.md` v229 and enterprise roadmap state newer 'ready' claims despite authoritative UI gate v530 BLOCKED. | Resolve merge markers, preserve older records as historical, reconcile EN/KO authority and release evidence without retroactive completion claims. |
| **AUD-636-11 / P2 QA script** | Bot `qa_ads_sponsorblock_verification.mjs:7` fails syntax check. | Fix and enforce separate QA script in CI; base bot test pass does not cover it. |
| **AUD-636-12 / Conditional P0 authentication defaults** | Current blog/Discord/daily SEO sources contain `INTERNAL_API_SECRET || CRON_SECRET` fallback expressions. Previous v603 audit documents hardcoded fallback. Whether secrets are absent in production was not probed and no secret values were recorded. | Remove static defaults, fail closed when required secret missing, rotate shared credentials, add missing/invalid-auth tests. |

**Distinguish:** static vulnerabilities ≠ demonstrated exploitation; source pass ≠ authenticated transaction success; GitHub merge ≠ active deployment; Next 200 page ≠ valid backend action.

## 4. Planning × capability matrix

- **Authentication/account** — unit checks passed, anonymous 401 confirmed; signed-in identity 500 regression, session persistence, admin 2FA and account lifecycle **UNVERIFIED**.
- **Wallet, ledger, mint/central bank, investments, banking, loans, pension, treasury** — frontend/backend static and unit tests pass, yet DB ACLs violate the core invariants; transactions and boundary audits **BLOCKED**.
- **DAO/grants/treasury** — production success-response divergence plus non-atomic votes and missing role receipts; **BLOCKED**.
- **Stock exchange/market charts, jobs, businesses, clubs, casino, community and notifications** — navigable code and passing unit tests do not establish connected authenticated executions; **PARTIAL / UNVERIFIED**.
- **Admin control tower and backups** — visible code surfaces, access-guard gaps and untested authenticated role E2E; **BLOCKED**.
- **SEO, blog, calculator, global localization, monetization** — route and unit coverage improved; active-vs-main menu/GeoIP differences, unsupported rating markup, real index/CTR/conversion data absent; **PARTIAL / UNVERIFIED**.
- **Discord and Android** — bot base tests PASS but live channel operations NOT TESTED; Android source inventoried but build/device gate NOT TESTED.
- **Infrastructure/backup/release** — services active and build passes, but exact SHA production/test acceptance and backup restoration evidence unavailable; **BLOCKED**.

## 5. Safe remediation sequence

1. P0: preserve rollback/backup evidence; isolate the app-role ACL + SECURITY DEFINER and true ledger semantics in a disposable DB, do not alter active balances.
2. P0: remove misleading payout success on production **through approved staged promotion**, not by cherry-picking untested files into production.
3. P1: admin backups and API auth hardening; user-bound idempotent treasury vote/grant; IndexNow protected gateway.
4. P1: migrate 269–271 with exact SHA, security regression; web-to-backend authenticated role E2E; admin 34 screens × 320/430px/200% × five passes; locale/canonical and Android gates.
5. P2: repair documentation conflict marker, bot QA syntax, legacy route aliases, structured data evidence and Android version/hints.
6. Before any merge/release: refetch `origin/main`, verify same SHA CI, isolated Test frontend/backend/DB readiness, user/admin session and durable ledger reconciliation, backup restore, zero-downtime alias switch with automated rollback, and post-promotion checks.

**Conclusion: the current main builds and its non-DB unit tests pass, but complete functional acceptance and production safety remain BLOCKED. This is a documented audit only, not implementation or promotion.**
