# Woldeok Moneyverse — Full-Function QA Evidence and Release Gate (v2026.11.15.1940)

**Authority:** [Integrated Planning Master](../planning/INTEGRATED_PLANNING_MASTER.md), [Living Project Plan](../planning/PROJECT_PLAN.md), [Full Route UI QA Spec](../planning/FULL_ROUTE_UI_QA_SPEC.md), `AGENTS.md`.
**Language:** English canonical | [한국어](2026-11-15-full-function-qa-v2026.11.15.1940.ko.md).
**When:** 2026-11-15 KST; **source:** exact origin/main `04ef008aeff2516df4afc891430227a40a12418e`; **isolated branch:** `qa/full-function-v2026.11.15.1940`.
**Verdict:** **FAIL / P0 SECURITY / RELEASE HOLD**. This is a substantial QA execution, **not certification of complete full-site feature QA**. Five-pass, authenticated, real transaction E2E Test gates remain BLOCKED. No release, runtime configuration, data, member assets or financial balances were mutated.

## 1. Scope, separation, and live runtime
- Used primary MiniPC MCP and read the integrated master and core policies first. Re-fetched origin/main at start/mid/final (unchanged). Kept Gemini's independent `feat/spring-admin-channel-otp-phase3` branch `4fff0cb364...` untouched.
- MiniPC actual runtime: production frontend, NestJS v1546 on :4500, Spring Boot 3.3.5 on :4550, Discord bot, Nginx, and DEV PostgreSQL connected/active. Legacy `moneyverse-backend` inactive while replacement backends active; does not itself prove outage.
- `moneyverse-qa.service` **failed** at 19:01 KST; hourly script logged `http_pass=23, auth_gated_not_tested=2, failed=1` for `/tools/stock-calculator` HTTP 000. Fresh direct request returned 200. Classify intermittent smoke/route issue, not proven persistent calculator defect.
- This QA's HTTP requests and SQL were read-only and no authenticated mutation calls were made. PII response content was never saved in evidence or repo docs.

## 2. Exact-source page inventory / passive HTTP
| Gate | Observed |
|---|---|
| Next App Router page routes | 177 total |
| Static / dynamic | 144 / 33 |
| Administrator routes | 38 |
| Static anonymous HTTP 200 | 131 — HTTP reachability only |
| Static anonymous redirect / auth block | 12 |
| Static HTTP 404 | 1: `/help` |
| Dynamic route unseeded | 33: BLOCKED |
| Full exact-SHA Test browser five passes | NOT EXECUTED |
| Authenticated member / admin high-risk E2E | NOT EXECUTED |

The 60-route partial mobile browser probe was exploratory only: pages rendered in Chromium, but auth-required routes produced login redirect/navigation races. These must not be interpreted as functional failures or PASS. No five-pass, role/fixture, interactive flows or full viewport matrix was established. Full-route ledger acceptance fails closed.

## 3. Confirmed findings (ranked)
### P0-SEC-01 — Anonymous public admin member directory disclosure [GitHub issue #3174](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3174)
- **Actual public edge**, no cookie or Authorization header: `GET /api/v1/admin/users` => **HTTP 200** JSON `users` count **21**.
- Response object **field names only** observed: `user_id`, `display_name`, `cash_balance`, `bank_balance`, `bond_balance`, `stock_eval`, `total_net_worth`, `wealth_rank`, `is_admin`. **No user values, raw response body or private log dumped into GitHub**.
- **Direct sources are protected:** Nest origin :4500 => **401**, Spring :4550 => **401**, internal Nginx gateway :4400 => **401**. The public gateway is inconsistent with the authenticated services. Source controller has the four guard chain and `AdminSessionGuard`. Inspect actual Nginx location precedence and deployed frontend rewrites; a configured literal `location ^~ /api/market/secret-auction|api/admin/controls|...` appears suspicious but the root cause is **not yet proven**.
- **Containment acceptance:** anonymous/ordinary member cannot read any admin directory via all external/proxy/BFF paths, and authorized elevated admin still works. Verify exact deployment, session propagation, no-store/noindex and incident review. Do not wait for arbitrary feature release to contain this.

### P1-SEO-02 — Private admin indexing response header conflict
- Unauthenticated GET of `/admin` and `/admin/users`: edge header `X-Robots-Tag: index, follow`, while source page metadata requests noindex/nofollow. Even though cache-control is private/no-store, edge SEO policy contradicts private route design. Check external headers on all statuses and inspect robots/sitemap exposure.

### P1-ROUTE-03 — Missing help route
- Source route `/help` exists in inventory, live anonymous request returns **404**. Check deployment/SHA mismatch, route redirects and auth conditions before root-cause assignment.

### P1-QA-04 — Hourly smoke automation failing
- Systemd oneshot failed (19:01 KST) due `/tools/stock-calculator` `000`. Later HTTP 200; investigate timeout/retry and next scheduled runs. Its existing script explicitly says `full_functional_QA=NOT_TESTED`.

### P1-AUTH-05 — Another public API authorization/false-empty divergence
- Without cookies `GET /api/v1/stocks/portfolio` => edge **200** `{"holdings":[]}`, while Nest direct :4500 => **401**. Spring :4550 also returned empty 200. Could misleadingly show verified-empty instead of unauthenticated; verify documented intended public contract and privacy before treating as definitive disclosure.

## 4. Exact-source automated verification (fresh)
| Suite | Result |
|---|---|
| `pnpm --filter @moneyverse/contract build` | PASS |
| Contract Vitest | **41 pass**, 0 fail |
| Backend Vitest after building contract | **3,046 pass**, **518 skip**, 0 fail, exit 0 |
| Frontend Vitest (4 workers) | **3,064 pass**, 0 fail, exit 0 |
| Spring Gradle `./gradlew --no-daemon --offline test` | **23 pass** across 7 suites, 0 fail, exit 0 |
| Security, route-QA, backup, ops Node tests | **32 pass**, 0 fail |
| Root `pnpm typecheck` | PASS |
| Root `pnpm lint` | Exit 0, **0 errors / 1,067 warnings** |
| Read-only DEV PostgreSQL balance probe | 943 ledger transactions, 1,950 postings, 0 imbalances, 0 orphan postings, 0 prohibited negative balances |
| Exact Test backend/frontend/edge SHA, full real-PG integration, member/admin transaction E2E, external backup restore | **BLOCKED / NOT VERIFIED** |

Initial backend suite returned 53 test-file dependency-resolution failures before building the shared contract. The same backend suite passed after proper prerequisite build; do not count initial setup errors as runtime defects. First frontend run timed out; rerun with 4 workers passed in ~130s. Tests with `DATABASE_URL`/PG credentials unset deliberately exclude real database tests; a green code suite does **not** override the observed public-edge P0.

## 5. Domain-specific acceptance inventory (15 canonical API domains)
All domains have source contract/unit evidence and some route-level HTTP GET evidence; **actual member/admin feature flows are BLOCKED**, not PASS:
1. Auth/sessions/consent/OTP: login/logout, Discord/Telegram channel OTP, step-up, admin role negatives — BLOCKED.
2. Wallet and transfers: write idempotency, transaction receipts, precision, reconciliation — BLOCKED.
3. Banking/deposits/loans: repayment/interest/statement owner scope — BLOCKED.
4. Jobs/work/certification/rewards: claims and double-payment negatives — BLOCKED.
5. Stocks/market/orderbook: buy/sell/portfolio/auth boundary — BLOCKED; related P1-AUTH-05.
6. Derivatives/leverage: margin/liquidation protections — BLOCKED.
7. Shop/inventory: purchase/equip, upkeep, pagination, payment receipts — BLOCKED.
8. Casino/gamification: configured enablement observed, game outcome and odds validation — BLOCKED.
9. Businesses: create/manage/settlement — BLOCKED.
10. Startups/venture/crowdfunding/grants: application/review/disbursement/clawback — BLOCKED.
11. Real estate/metaverse property: trade/ownership — BLOCKED.
12. Discord clubs/guild warfare: identity/guild permissions — BLOCKED.
13. Quant bots/backtesting: order automation, data isolation — BLOCKED.
14. Support/privacy/blog/community: publish/edit/read, admin read flags, moderation, deletion — BLOCKED; help 404.
15. Admin control/macro/treasury/mint/bonds/SWF: all money writes, privileged approvals and read isolation — **BLOCKED P0**.

## 6. Stop conditions / handoff
- **Immediate release HOLD** and P0 incident triage: contain externally exposed `/api/v1/admin/users`, retest edge and authenticated admin flows; retain records without copying personal data.
- Fix and verify `/help`, SEO noindex and QA timeout regression in new, non-conflicting branches with Test canaries.
- Recheck origin/main and Gemini feature branch prior to any changes. Real-PG Test suites and independent immutable restore must pass before production review.
- Complete **5×177 candidate page passes** with seeded dynamic routes, privileged administrator sessions, ordinary member sessions, permissions, interactive click/submit/error-state tests, mobile/tablet/desktop/200% zoom, actual backend & edge SHA provenance. No private real-user-money tests.
- This report is **QA documentation only**, not a successful release or approval to merge/deploy.

## 7. Evidence and traceability
- MiniPC immutable-style local QA folder: `/srv/moneyverse-data/reports/qa-full-v2026.11.15.1940/` (start/mid/end logs, route inventory, anonymized route HTTP and partial browser probes, suite logs).
- Public P0 defect record: [#3174](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3174).
- QA worktree/source branch: `qa/full-function-v2026.11.15.1940`; no change to existing Gemini branch or active service.
