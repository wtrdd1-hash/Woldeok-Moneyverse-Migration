# v2026.11.17.1 — Full administrator, financial and security LIVE QA

**Result: FAIL / SECURITY P0 / FINANCE P0 / RELEASE HOLD.**

## Authority and safe execution
- Date: 2026-11-17 KST. Operator: approved mini-PC debian13, isolated branch qa/admin-full-live-20261117-v2026.11.17.1, starting from origin/main 86777fb2d5.
- Read project authority in docs/planning/PROJECT_PLAN.md, docs/planning/INTEGRATED_PLANNING_MASTER.md, documentation policy, AGENTS.md and release procedure. Cross-checked source controllers, effective Nginx, actual API origins, Spring Java code, real PostgreSQL and actual frontend artifact.
- Executed actual public HTTPS GET (no cookies), source-versus-origin tests, HTML entry tests, safe Test GET, source unit/HTTP tests and real PostgreSQL REPEATABLE READ READ ONLY transactions. No production POST/PUT/DELETE, no OTP attack, no money issuance/payment, no service restart, no main merge, no production release.
- No credentials, personal identifiers or raw account balance payloads stored in GitHub documents; only aggregated results and safe route metadata. On-host HTTP status, header, latency and hash logs: /tmp/mv_adminqa_20261117/.

## Actual production results
- 38 static admin pages: HTTP 200 x37, HTTP 404 x1 (/admin/logs/system). 200 indicates HTML transport, **not authenticated end-to-end feature PASS**. Most private admin pages and API responses returned X-Robots-Tag: index, follow; blog admin was noindex, nofollow.
- 92 source-inventoried administrator GET endpoints: HTTP 200 x24, 401 x4, 403 x1, 404 x58, 503 x5. Many 404 endpoints are legacy Nest routes, so map each against the currently adopted Spring contract before labeling it a bug.
- Confirmed live BFF / Spring / Nest mismatch: anonymous public /api/v1/admin/security reports administrator roles and consoleSession open; public /api/v1/admin/me reports admin roles, whereas direct Spring :4550 and Nest :4500 both returned 401 to the same unauthenticated requests. Next rewrites /api/v1 to /app-api/v1 and forwards x-internal-token. Actual production frontend API_ORIGIN observed at Spring :4550 (not the previous documented Nest :4500).
- Finance access discrepancy: public Spring admin Treasury overview/revenue/expenditure/transactions, KDIC integrity and FX status returned 200 anonymously; representative direct Nest admin routes returned 401. No inference that an unauthorized finance POST succeeded.
- Explicit live failures: /api/admin/mint/status 503 MINT_POLICY_SOURCE_UNAVAILABLE; /api/admin/mint/orders 503; /api/admin/operations/storage 503; /api/admin/api-health/backup-inventory 503; /api/admin/seo/status 503; /api/admin/central-bank/status 404 source unavailable; /api/admin/economy/tax-policy 404 source failure.
- Official Test backend test-main-backend.service disabled/inactive: Test /api/v1/admin/treasury/overview HTTP 502, SWF BFF HTTP 500, Mint status HTTP 503. Test authenticated financial write E2E **BLOCKED, NOT RUN**.

## Confirmed P0 findings

### SEC-01 — Spring administrator auth default fail-open and CSRF disabled (P0)
Spring source spring-backend/src/main/java/com/moneyverse/api/config/SecurityConfig.java uses csrf(AbstractHttpConfigurer::disable), anyRequest().permitAll, wildcard CORS with credentials. Spring KDIC controller exposes POST assess-premiums, liquidity-loan and payout with default x-user-id=admin and no per-controller verified actor/role/OTP guard. Production unauthorized write has **NOT** been invoked; code-level risk is established. Default-deny Spring admin API with verified actor + role + recent step-up/OTP, CSRF/idempotency and separate scoped internal service identity.

### SEC-02 — Anonymous public admin role and console state via Next API proxy (P0)
Actual no-cookie public GET /api/v1/admin/security returns admin/superadmin and consoleSession open, unlike direct unauthenticated origins (both 401). Next frontend/src/app/app-api/v1/[...path]/route.ts adds privileged internal gateway token, and frontend runtime points to Spring. Internal token alone must not substitute for an administrator's verified session, especially in browser-accessible catch-all routes. Verify actor binding and remove any synthetic privilege. Never claim authenticated financial access is proved by this 200.

### FIN-01 — KDIC ledger integrity fabricated rather than queried (P0)
Spring KdicService.java lines 46–59 returns literal numericBalanced=true, transactionCount=14250, accountCount=42, treasuryRecordCount=42 and zero discrepancy with fresh checkedAt without querying PostgreSQL. The live API returns these constants. Authoritative production-linked PostgreSQL read-only canonical query at the same check found 943 transactions, 1950 postings, 43 accounts, 52 Treasury records. A 200 / numericBalanced:true is **not verified financial evidence** here.

### FIN-02 — KDIC financial operations fabricate success (P0)
Spring KdicService.java lines 61–116: assessPremiums catches DB update errors and still returns success:true plus a generated UUID, despite no committed receipt. injectEmergencyLiquidity and executePayout return success:true with synthetic UUIDs but contain no ledger mutation. @Transactional alone does not create a financial posting. Replace with canonical atomic ledger functions, committed receipt, idempotency and 503/409 fail-closed semantics. Do not perform actual production money writes as a QA probe.

### FIN-03 — Treasury/SWF fake success and fake empty data (P0)
Spring TreasuryService.java lines 120–168: SWF snapshot returns an enabled policy and empty assets on DB error; policy update returns status SUCCESS after a DB failure/missing receipt. Lines 219–247 always return empty transactions, empty revenue/expenditure and zero totals without any SQL query, while 52 Treasury history records exist in production DB. Consequently read-only HTTP 200 can misrepresent unavailable source as verified zero. SWF rebalance/liquidation currently fail closed 503 NOT_IMPLEMENTED (lines 174–182), which should be retained until canonical receipts are implemented.

### FIN-04 — End-to-end release and data provenance gaps (P0)
Deployed Spring version reports v2026.11.14-spring, the deployed immutable Next frontend predates origin/main 86777fb2d5 and lacks /admin/logs/system. Current exact-SHA source-level tests are not evidence that the deployed frontend/Java artifact passes. Test backend down; cannot certify signed-in OTP finance, idempotent real WLD writes, rollback, backup restore or continuity. Release HOLD.

## Verified real money SQL (read only)
Production-linked Docker PostgreSQL 17.11 database name woldeok_moneyverse_dev. One REPEATABLE READ READ ONLY snapshot:
- ledger_transactions: 943; ledger_postings: 1950; accounts: 43; Treasury vaults: 5; Treasury history: 52.
- Unbalanced postings by transaction: 0; journal without postings: 0; orphan transaction or account postings: 0; negative postings: 0; missing account-balance rows: 0.
- Applying the canonical Nest KDIC repository SQL account sign convention: stored-versus-journal mismatches: 0, absolute WLD difference: 0, unlinked Treasury history: 0.
- One negative account balance belongs to MINT system account with allow_negative=true; do not classify it as a defect without monetary policy evidence.
- Seven-day transactions at capture: 43; preceding 24 hours: 0. Balances withheld from GitHub report.
This validates snapshot journal constraints only. It cannot validate every payout authorization, historic legitimacy, full-source recirculation or Test writes.

## Executed test results and blind spots
| Surface | Measured | Interpretation |
|---|---|---|
| Live admin route entry | 37/38 HTTP 200; 1 404 | Non-authenticated HTML GET only |
| Live admin APIs | 24 200 / 4 401 / 1 403 / 58 404 / 5 503 | 404s need adopted contract triage |
| Real financial PostgreSQL | 943 tx / 1950 postings; 0 imbalance, 0 account mismatch | Read-only, no write authorization attested |
| Nest administrator full Vitest | 103 test files PASS / 23 SKIP; 655 test cases PASS / 112 SKIP | DB-dependent tests intentionally not run on production-linked DB |
| Next admin + BFF + app-gateway Vitest | 176 test files PASS / 968 test cases PASS | In-process/JSDOM, not real browser |
| Spring selected Gradle | 9 suites / 22 tests PASS | Existing tests do not catch KDIC hardcoded/fake-success or permitAll |
| Full signed-in browser/OTP E2E | NOT RUN | No verified administrator session |
| Financial POST on Production | NOT RUN | Prevent accidental money loss/issuance |
| Official isolated Test financial POST | NOT RUN | Test backend inactive and public GET 502 |
| Independent backup restore and production cutover | NOT RUN | Release gate blocked |

The first focused 144 Nest test cases were later included in the full 655-case run, so do not double-count. Frontend emitted React act() warnings and JSDOM navigation-not-implemented messages despite exit 0. These require test-harness cleanup, not a claim of live browser failure.

## Severity-driven remediation and acceptance
1. Immediately protect Spring admin routes with fail-closed authentication, verified admin actor, least-privileged internal token, CSRF, step-up OTP and denied anonymous financial POST. Add real HTTP 401/403 tests and ensure Next gateway cannot impersonate staff. Coordinate parallel security worktree to avoid collision.
2. Replace KDIC fake counters with canonical same-snapshot SQL; fail 503 if evidence unavailable. KDIC premium, bailout and payout must never return success without committed double-entry journal receipt and replay protection. Add zero-row/exception/rollback/duplicate/concurrency tests in isolated DB.
3. Remove SWF policy success fallback, synthetic enabled status, fabricated Treasury history/revenue/expenditure zero results. Serve typed unavailable vs verified empty; use actual ledger source and precise integer WLD strings.
4. Repair Mint 503 and other finance/auth routing drift; validate all 38 pages with a legitimate administrator browser session at 320px/desktop and Discord/Telegram OTP. Reconcile latest origin/main, Spring/Nest route contracts, Nginx routes and deployed immutable artifacts.
5. Restore official Test backend only after proving its isolated DB and preventing scheduler impact on other agents. Exact-SHA Spring/Nest/Next Test deploy, synthetic ledger finance API POST E2E, security negative tests, independent backup restore, rollback drill, canary and non-disruptive promotion required before deployment. A QA-only documentation commit is not an application release.

## Complete observed anonymous admin page matrix

| Path | HTTP | Duration (s) | X-Robots-Tag |
|---|---:|---:|---|
| /admin | 200 | 5.79 | index |
| /admin/analytics | 200 | 2.24 | index |
| /admin/api-health | 200 | 2.309 | index |
| /admin/bank | 200 | 3.212 | index |
| /admin/blog | 200 | 3.477 | noindex |
| /admin/bonds | 200 | 1.991 | index |
| /admin/catalog | 200 | 3.767 | index |
| /admin/central-bank | 200 | 1.346 | index |
| /admin/content | 200 | 2.444 | index |
| /admin/controls | 200 | 1.945 | index |
| /admin/discord | 200 | 1.999 | index |
| /admin/economy | 200 | 3.595 | index |
| /admin/economy/scenario-lab | 200 | 5.04 | index |
| /admin/enterprises | 200 | 2.083 | index |
| /admin/fx | 200 | 1.292 | index |
| /admin/help | 200 | 2.946 | index |
| /admin/kdic | 200 | 1.95 | index |
| /admin/logs | 200 | 2.001 | index |
| /admin/logs/activity | 200 | 5.067 | index |
| /admin/logs/delivery | 200 | 2.187 | index |
| /admin/logs/integrity | 200 | 3.214 | index |
| /admin/logs/system | 404 | 3.095 | index |
| /admin/market | 200 | 5.076 | index |
| /admin/market/ai-news | 200 | 3.209 | index |
| /admin/mint | 200 | 1.992 | index |
| /admin/money-flow | 200 | 6.024 | index |
| /admin/operations/storage | 200 | 2.282 | index |
| /admin/pension | 200 | 1.281 | index |
| /admin/safety | 200 | 1.628 | index |
| /admin/security | 200 | 1.957 | index |
| /admin/seo | 200 | 1.916 | index |
| /admin/seo-audit | 200 | 5.247 | index |
| /admin/shop | 200 | 1.287 | index |
| /admin/support | 200 | 1.625 | index |
| /admin/treasury | 200 | 6.136 | index |
| /admin/treasury/grants | 200 | 1.609 | index |
| /admin/users | 200 | 1.298 | index |
| /admin/work | 200 | 1.329 | index |

## Complete observed administrator GET API matrix

| Path | HTTP | Failure note |
|---|---:|---|
| /api/admin/api-health/backup-inventory | 503 | backup inventory unavailable |
| /api/admin/api-health/status | 404 |  |
| /api/admin/auth/channel-otp/status | 200 |  |
| /api/admin/blog/publisher-status | 403 | FORBIDDEN |
| /api/admin/bonds/overview | 200 |  |
| /api/admin/central-bank/status | 404 | CENTRAL_BANK_SOURCE_UNAVAILABLE |
| /api/admin/economy/tax-policy | 404 | Failed to fetch tax policies |
| /api/admin/kdic/ledger-integrity | 200 |  |
| /api/admin/kdic/overview | 200 |  |
| /api/admin/mint/certificates | 200 |  |
| /api/admin/mint/orders | 503 | 통화정책 명령서 조회에 실패했습니다. |
| /api/admin/mint/status | 503 | MINT_POLICY_SOURCE_UNAVAILABLE |
| /api/admin/operations/storage | 503 | storage evidence unavailable |
| /api/admin/pension/overview | 200 |  |
| /api/admin/pension/recent-payouts | 200 |  |
| /api/admin/seo-audit | 200 |  |
| /api/admin/seo/status | 503 | seo_status_unavailable |
| /api/admin/seo/twitter | 200 |  |
| /api/admin/treasury/grants | 200 |  |
| /api/admin/treasury/swf | 200 |  |
| /api/v1/admin/ai-news/batches/latest | 404 |  |
| /api/v1/admin/ai-news/models | 404 |  |
| /api/v1/admin/ai-news/settings | 200 |  |
| /api/v1/admin/api-health/status | 404 |  |
| /api/v1/admin/approvals | 404 |  |
| /api/v1/admin/audit-events | 404 |  |
| /api/v1/admin/audit/dispositions | 404 |  |
| /api/v1/admin/audit/events | 404 |  |
| /api/v1/admin/audit/retention | 404 |  |
| /api/v1/admin/audit/verifications | 404 |  |
| /api/v1/admin/auth/channel-otp/status | 200 |  |
| /api/v1/admin/backups | 404 |  |
| /api/v1/admin/bank | 404 |  |
| /api/v1/admin/blog | 404 |  |
| /api/v1/admin/bonds/coupon-logs | 404 |  |
| /api/v1/admin/bonds/list | 404 |  |
| /api/v1/admin/bonds/overview | 404 |  |
| /api/v1/admin/business-types | 404 |  |
| /api/v1/admin/controls | 401 | login_required |
| /api/v1/admin/controls/auto-policy | 404 |  |
| /api/v1/admin/controls/consent-versions | 404 |  |
| /api/v1/admin/discord | 404 |  |
| /api/v1/admin/discord-outbox-events | 404 |  |
| /api/v1/admin/economy | 404 |  |
| /api/v1/admin/economy/ai-status | 404 |  |
| /api/v1/admin/economy/alerts | 404 |  |
| /api/v1/admin/economy/council-debate | 404 |  |
| /api/v1/admin/economy/macro-v2 | 404 |  |
| /api/v1/admin/economy/monetary/status | 404 |  |
| /api/v1/admin/economy/scenario-lab/preview | 404 |  |
| /api/v1/admin/economy/stats | 404 |  |
| /api/v1/admin/economy/tax-policy | 404 |  |
| /api/v1/admin/economy/velocity | 404 |  |
| /api/v1/admin/enterprises/dividend-logs | 404 |  |
| /api/v1/admin/enterprises/overview | 404 |  |
| /api/v1/admin/enterprises/private | 404 |  |
| /api/v1/admin/enterprises/soes | 404 |  |
| /api/v1/admin/fx/status | 200 |  |
| /api/v1/admin/kdic/ledger-integrity | 200 |  |
| /api/v1/admin/kdic/overview | 200 |  |
| /api/v1/admin/logs | 404 |  |
| /api/v1/admin/logs/system | 404 |  |
| /api/v1/admin/me | 200 |  |
| /api/v1/admin/operations/storage | 404 |  |
| /api/v1/admin/pension/overview | 404 |  |
| /api/v1/admin/pension/recent-payouts | 404 |  |
| /api/v1/admin/season-events | 404 |  |
| /api/v1/admin/security | 200 |  |
| /api/v1/admin/security/ip-blocks | 200 |  |
| /api/v1/admin/shop/items | 401 |  |
| /api/v1/admin/stocks | 401 | login_required |
| /api/v1/admin/stocks/dynamics | 404 |  |
| /api/v1/admin/stocks/market-events | 404 |  |
| /api/v1/admin/treasury/backup/status | 404 |  |
| /api/v1/admin/treasury/budgets | 404 |  |
| /api/v1/admin/treasury/donations/top | 404 |  |
| /api/v1/admin/treasury/expenditure | 200 |  |
| /api/v1/admin/treasury/governance/votes | 404 |  |
| /api/v1/admin/treasury/grants | 404 |  |
| /api/v1/admin/treasury/grants/my | 404 |  |
| /api/v1/admin/treasury/health-insurance | 404 |  |
| /api/v1/admin/treasury/overview | 200 |  |
| /api/v1/admin/treasury/reconciliation | 404 |  |
| /api/v1/admin/treasury/revenue | 200 |  |
| /api/v1/admin/treasury/swf | 200 |  |
| /api/v1/admin/treasury/tax-rates | 404 |  |
| /api/v1/admin/treasury/tax/wealth | 404 |  |
| /api/v1/admin/treasury/transactions | 200 |  |
| /api/v1/admin/treasury/user-money-flows | 404 |  |
| /api/v1/admin/users | 401 | login_required |
| /api/v1/admin/work | 404 |  |
| /api/v1/admin/work/stats | 404 |  |

## Finish / 종료
Recorded on isolated QA branch only. No Test startup, Production mutation, main merge or promotion. P0 RELEASE HOLD.
