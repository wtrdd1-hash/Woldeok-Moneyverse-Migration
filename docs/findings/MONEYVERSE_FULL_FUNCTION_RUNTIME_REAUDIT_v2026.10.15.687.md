# Moneyverse full code/function/runtime re-audit — v2026.10.15.687

**Decision: BLOCKED for full-function acceptance and Production promotion.** This is a source/automated-test/read-only-runtime audit, not a declaration that every function works. Date: 2026-10-15 KST.

## Authority, concurrency and exact revision
- Official document hierarchy: AGENTS.md; DOCS_INDEX.md; planning/INTEGRATED_PLANNING_MASTER.md and Korean companion; PROJECT_PLAN; docs/RELEASING.md; API_CATALOG_MASTER; prior v603/v605/v675 acceptance and v683 Treasury investigations. Planning authority v530 (UI) and v523/v542/v543 (money invariants) remain binding until explicit adoption; later plans are not releases.
- Started from GitHub main `69bc8c14`; while running this audit main advanced to `69463989` via SEO fix #867. Changed SEO code/planning was reviewed and merged **into this isolated task branch only**, merge `60b164c8`. No shared main, another agent's worktree or production release was edited.
- v687 task branch: `audit/full-function-runtime-v2026.10.15.687`. The full baseline suites and initial build below were run on `69bc8c14`; post-merge targeted SEO tests and TypeScript typecheck were run on `60b164c8`. Do not relabel baseline tests as if rerun at latest SHA.

## Observed code and service scope
- Main (baseline) tracked 4,245 files, 163 Next page components (including 33 admin pages), 82 Nest controllers, 63 Next API handlers, 422 test/spec files, 270 numbered SQL migration files. Inventory is not functional acceptance.
- System-status MCP: backend, frontend, Discord bot, MCP, Nginx, Docker active; PostgreSQL connected. Casino, work, automated policy and stock corporate-action switches reported enabled. Enabled does not prove correct or safe execution.
- Observed release symlinks: `production-current -> prod-v600`; `test-current -> test-v618-7fa3f245bbc3`. Test manifest applicationSourceSha=`7fa3f245bbc3b308ae3e26ff3bfb0fbc70ba4642`; Production root `.moneyverse-release.json` absent. Latest GitHub main is a different source generation. Exact-SHA promotion/provenance acceptance fails.
- Backend /health on ports 3000, 3100 returned HTTP 200; anonymous stocks API 200 and viewer API 401. No backend/frontend ERROR keyword matched within a 30-minute journal sample, but this is not exhaustive error review.
- Correct host and forwarded HTTPS headers were used to GET 30 non-mutating anonymous routes per local frontend port (3001 Production, 3101 Test, 3203 other local): each returned **25 HTTP 200, 2 HTTP 307, 2 HTTP 404, 1 HTTP 401**. /bank and /support redirect anonymous users to login (not an error); /app-api/v1/account/identities correctly rejects anonymous requests (not proof of authenticated correctness). /business and /tools/compound-interest returned 404, but source routes are /businesses and /tools/compound-calculator or localized compound-interest-calculator; no current frontend href to the tested aliases was confirmed. Treat these as route alias/documentation drift, **not a proven broken user link**. Initial 308-only smoke used incorrect Host/proto; discarded and rerun correctly.

## Executed isolated checks
| Gate | Actual result | Qualification |
| --- | --- | --- |
| `pnpm install --frozen-lockfile --ignore-scripts --offline` | PASS | isolated v687 worktree only |
| `NODE_ENV=test` contract | 31 passed | `69bc8c14` |
| `NODE_ENV=test` DB package static tests | 7 passed | does not apply SQL to a live DB |
| `NODE_ENV=test` Nest backend | 1,185 passed, **391 skipped** | DB integration tests skipped; no real-money acceptance |
| `NODE_ENV=test` Next frontend | 1,206 passed | jsdom navigation/canvas unimplemented diagnostics also emitted |
| `pnpm typecheck` | PASS | on baseline and after v685 merge |
| `pnpm build` | PASS, 590 static pages | initial main baseline; not full live browser acceptance |
| `pnpm api:contract:check` | PASS, 179 endpoints / 637 controller methods | initial baseline |
| `pnpm lint` | 0 errors, **1,089 warnings** | lint warning debt remains |
| `pnpm qa:route-ledger:test` | 3 passed | tests QA rules, not 5-pass route browser run |
| Bot `npm --prefix bot test` | 4 passed after offline npm ci | first run failed because task workspace lacked youtube-dl-exec; not a product failure |
| `node --check bot/scripts/qa_ads_sponsorblock_verification.mjs` | **FAIL** (SyntaxError at line 7) | genuine tracked source issue |
| After upstream SEO merge: 3 Nest SEO test files | 20 passed | `60b164c8`, not all backend tests |
| After upstream SEO merge: 3 Next SEO test files | 14 passed | `60b164c8`, not all frontend tests |

No authenticated browser, mobile simulator, real Discord voice/gateway, production SQL transaction, financial negative-idempotency/security suite, disaster restore, whole-app five-pass browser, exact-SHA Test frontend/backend acceptance or pre-existing-session continuity was executed. No local Chromium binary was available for browser E2E; all such scopes are **UNVERIFIED**.

## Risk register / independently verifiable findings
**F687-01 — P0: live DEV DB privilege boundary failure.** Read-only PostgreSQL SELECT via the dedicated DB tool identified `woldeok_moneyverse_dev`: 241 public tables, app-role SELECT on 238, and INSERT/UPDATE/DELETE on **237** each. There are 485 SECURITY DEFINER functions of which **11** are executable by PUBLIC. This conflicts with least privilege / function-scoped money invariants. Applied `schema_migrations` 266; source SQL files 270. Explicit 237, 269, 270, 271 migration filename probes returned none; 268 did exist. These are the **development DB** tool's measurements: do not assert without independent runtime identity proof that the authoritative Production app connects to this same database. Validate Production role effective grants separately, apply only reviewed forward-only migrations on independently restored Test, add negative SQL privilege tests. No privileges/schema were mutated in this audit.

**F687-02 — P0: false Treasury reconciliation in current main.** `backend/src/admin/treasury/treasury.repository.ts` around lines 506 and 879 unconditionally returns `status: 'RECONCILED'`, `discrepancy_amount_wld: '0'`, with ledger total copied from vault total. This is not independent reconciliation. Separate draft PRs #862/#865/#866 report significant fiscal/subsidiary mismatch (unsigned 15,139,295 WLD at that audit time), synthetic fund/income risks and blocked money migrations; those drafts must not be conflated with a deployed fix. Retain financial release STOP until independent canonical ledger/vault reconciliation and DB ACL security negatives pass.

**F687-03 — P0: PvP stake settlement bypasses canonical ledger and lacks unit-of-work transaction.** `backend/src/casino/pvp-arena.repository.ts` around lines 239–390 uses `parseFloat`, `Math.random` for wager outcome, direct `UPDATE public.account_balances` of loser, winner and treasury, then separate room/notification writes. It contains a `SELECT ... FOR UPDATE` via queryOne without an enclosing transaction, so its lock may not cover the multi-query settlement; direct projection updates do not establish balanced ledger postings. `backend/src/casino/pvp-arena.controller.ts` registers guarded POST rooms/join actions. Anonymous internal API GET /api/v1/arena/rooms returned 401 on both instances (authentication boundary; does not demonstrate safe authenticated settlement). Do not run real wagers on Production for diagnosis. Require fail-closed containment review, canonical Economy Core stored operation, idempotency, atomic rollback/fault-injection/parallel join tests and auditable cryptographic randomness. Also inspect other direct-balance writers (bonds/FX/pension/SWF/marketplace/stock league) separately.

**F687-04 — P0/P1: release identity/financial approval mismatch.** Production is `prod-v600` with missing root manifest; Test `v618` is not latest main `69463989`. An old deployment returning 200 is not evidence of current fixes. Do not promote without immutable provenance, Test exact-SHA, DB compatibility, authenticated cross-account negative tests, session continuity and no-downtime rollback validation.

**F687-05 — P1: tracked Discord sponsor-block QA script SyntaxError.** `bot/scripts/qa_ads_sponsorblock_verification.mjs:7` contains an unterminated/newline string; `node --check` exits 1. Bot's four actual unit tests pass after installing bot dependencies, but standalone QA coverage fails.

**F687-06 — P1: bank credit rating uses fabricated borrower parameters / numeric conversion.** `backend/src/bank/bank.controller.ts` around lines 175–191 inserts defaults `accountAgeDays:30`, `jobLevel:5`, `historicalRepaymentsCount:3`, `overdueRepaymentsCount:0` for the current user, and calls `Number` on balance values. Ratings derived this way are not valid personal repayment histories; values > Number.MAX_SAFE_INTEGER lose precision. Verify a domain-authoritative credit model and replace dummy input before claiming real user scoring.

**F687-07 — P2: alias and source-of-truth drift.** /business and /tools/compound-interest produce 404, while actual alternative routes exist. Current main integrated planning explicitly calls for alias/canonical review. No direct broken UI navigation link proved; avoid an invented redirect that harms SEO. AGENTS.md legacy Kubernetes guidance also conflicts with currently observed Debian/systemd runtime and newer RELEASING policy; maintain the current deployment authority explicitly.

## Domain-level acceptance matrix
| Domain | Evidence in this audit | Acceptance |
| --- | --- | --- |
| Auth/OAuth/session/admin 2FA | guest 401, isolated unit suites | UNVERIFIED authenticated/reauth |
| Wallet, cash, transfers, Economy Core | dev 831 transactions / 1692 postings, 0 imbalances in snapshot | BLOCKED until real negative, precision and role tests |
| Stocks, candles, watchlists, trade, market-news AI | anonymous /stocks and stock API 200; unit tests | UNVERIFIED trade/AI provenance |
| Bank, lending, credit, savings | bank guest redirect; fake credit-input code | PARTIAL / F687-06 |
| Treasury, grants, fiscal/pension/bonds/SWF | hardcoded status, release-blocked drafts | BLOCKED P0 |
| Casino, PvP, fairness, wager settlement | unit coverage, registered guarded writes, direct SQL | BLOCKED P0 |
| Work/tasks/rewards | /work guest 200; unit tests | UNVERIFIED reward idempotency |
| Business, marketplace, guild, auction | /businesses 200, old alias 404; direct balance hotspots | UNVERIFIED transaction safety |
| Shop, purchases, entitlement | /shop 200; unit suites | UNVERIFIED actual purchase/reversal |
| Community/board/gallery/notifications | anonymous pages, unit suites | UNVERIFIED authenticated/action paths |
| Admin, backup, security, observability | /admin routes HTML 200 guest shell; no admin E2E | UNVERIFIED role/2FA |
| SEO, i18n, calculators, blog | baseline green, v685 SEO targeted 34 passed, alias 404 | SOURCE-PASS, not deployed proof |
| AI policy/news/advisor | /advisor HTML 200, feature flag enabled | UNVERIFIED model/freshness/effects |
| Discord bot/gateway/music | bot 4/4; QA script SyntaxError | PARTIAL / F687-05 |
| Android and mobile API | 179 endpoint contract check green | UNVERIFIED APK/simulator |
| Infra, release, backup, rollback | health 200, identities drift, no exact Test | BLOCKED release |

## Prioritized resolution / release gate
1. **P0**: before any money-affecting acceptance: independent restored PostgreSQL Test; minimum app table grants, PUBLIC EXECUTE checks, pending migrations (no modifications to applied files); Treasury fiscal reconciliation and source-of-funds; block/rebuild direct balance writers starting with PvP, double-spend and large integer controls.
2. **P1**: preserve v685 SEO fix integration, test/auth E2E real role and session paths, replace fabricated credit inputs, repair QA script, check virtual economy and admin menu flows on mobile/desktop, no false operation-success receipts.
3. **P2**: address lint warnings and verified alias/canonical issues, real bot/Android integration and end-to-end accessibility.
4. Gate: green tests/CI at the **same candidate SHA**, DB restored-Test real SQL positive and negative results, logged-in full-route five-pass UI, backup/restore and session continuity, zero-downtime promotion and rollback proof. Do not switch Production until gates pass.

**Mutation ledger:** No source logic, feature switches, DB grants, Production/Test release symlinks, member account balances, financial transactions or deployment modified. Only this isolated task branch's audit/documentation files were created/updated.
