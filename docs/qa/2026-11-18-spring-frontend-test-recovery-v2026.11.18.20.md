# Spring API + Frontend Recovery, Verified Test Evidence — v2026.11.18.20

**EN canonical** · [한국어](./2026-11-18-spring-frontend-test-recovery-v2026.11.18.20.ko.md) · 2026-11-18 KST · **ISOLATED TEST AVAILABLE LOCALLY / PRODUCTION RELEASE HOLD**

## Authority and integration
- Read AGENTS, living PROJECT_PLAN (priority over the integrated planning master), INTEGRATED_PLANNING_MASTER, API catalog, Spring contract/QA skills, and release procedures. Remote main `0590fac4e8a82bc986ba1b8c64f014d18daca9e9` checked at start and midpoint. Shared MiniPC main and coworker worktrees untouched.
- A new branch `repair/frontend-test-api-v20261118-20` is stacked on the existing frontend/admin/chat v17 source candidate and merges the **committed snapshot** of independently tested backend API-v4 work (the other owner's uncommitted files were not touched). Base frontend and backend fixes must be reviewed and reconciled before any merge.
- Code-validated Test candidate SHA **`9d7377cfd5a552840d728ad2d16487abdd011de4`**, immutable executable JAR SHA256 **`e3791371740b468b39b437607a6a9ac3525d77779b19971940e6bde391aad4db`**. Documentation commits after this code SHA do not mean the running binary automatically contains those docs.

## Actual fixes in this branch
1. Java pension GET no longer invokes account creation; it requires DB-verified session identity and only calls a read-only owner query. Absent account is 404, anonymous is 401, inaccessible source fails 503. Pension fund position cannot assert unverified zero balance. Contribution and retirement status writes fail closed while real ledger/CSRF/idempotency receipts remain uncertified.
2. Spring static SPA resolver excludes /app-api/ as well as /api/ so an Android API request that has no handler returns an error rather than misleading 200 HTML. **404 is not successful Android support**; the full Android BFF method/DTO/session parity is still missing.
3. React/Next shop UI explicitly distinguishes failed catalogue source from a verified-empty list, displays an accessible retry state, hides purchase/store and unverified VIP status, and removes hardcoded claims of a fixed 78-item inventory.
4. Integrated the separately owned fixed committed backend v3/v4 read/identity source-truth changes with zero edits to the original worker worktree. Existing admin/chat responsive v17 frontend source is inherited; it is **not yet served from Spring static files**.

## Reproducible checks
| Environment / gate | Executed result | What it does NOT establish |
|---|---|---|
| Gradle Spring tests + bootJar, isolated merged source | **174 tests PASS / 0 failed / 0 skipped**, 46 XML suites; immutable JAR built | Real finance posting, authenticated session/MFA and official Production identity |
| New focused Spring pension/static safety tests | **5 PASS** after expected RED compile failures | DB financial settlement |
| Next contract/typecheck/full build | **PASS**; 603 static-generation progress entries | Dynamic /shop and /admin SSR is not in the Java static JAR |
| Frontend shop/support regression | **121 tests in 20 files PASS** | All frontend tests |
| Frontend full regression | **INCOMPLETE / FAIL GATE:** timeout at 120s (exit 124); failures observed in advertising, SEO/search route and ad-placement suites | Whole UI QA, prod promotion |
| Official Test Nginx host routing (loopback) | **20 representative GETs:** 15 HTTP 200, 2 401, 1 404, 2 intentional/uncertified 503, **zero 502** | External TLS/cloud-edge, logged-in/positive flows or money mutation |
| Permanent Test systemd | Enabled, auto restart, locally bound with read-only isolated PostgreSQL and restricted filesystem; exact immutable JAR | Zero-downtime Production handover |
| Existing Production Spring | Continues to serve; health HTTP 200 after Nginx test-only atomic reload | Production new frontend/backend deployment |

**Security:** Official Test is currently accessible only from loopback; public Test traffic is intentionally denied pending the complete security review. Nginx Test block alone changed, keeping Production server-block bytes unchanged. Production Spring service, database, feature switches, balances and ledger were not modified. The earlier pension-GET potential data mutation reported in #3274 remains unverified; this run did not repeat that call against Production.

**Test front end:** The Test HTML still comes from the earlier Spring static snapshot; user-facing Next source modifications (including admin theme/global help dock and shop unavailable state) are **not served** by that snapshot. The web architecture has unresolved dynamic SSR/hydration migration, so a successful Next build is not equivalent to frontend integration.

## Release blockers (G0–G6)
- Complete Test frontend Spring-native route/content and 320/390/768/1440 browser QA, authenticated admin support/chat, no fake static errors.
- Pass the **full frontend suite**; then actual signed-in owner/member/admin sessions, CSRF/MFA, account isolation, logout and 401/403 negative/positive tests.
- Resolve Android app-api JSON/method/DTO parity for 158 Retrofit endpoints; 404 JSON is only safer than false 200.
- Source-backed bank, Treasury/Mint/SWF, pension and shop transaction receipts, synthetic disposable DB write/rollback/reconciliation, idempotency, real restore and performance.
- Independent public Test TLS edge QA and production release candidate exact SHA, no-downtime promotion/rollback gate. Production remains **HOLD**.

## References / archival policy
- [Frontend UI candidate PR #3275](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3275) · [Spring P0 candidate PR #3267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3267) · [All API QA #3274](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3274) · [Platform blocker #3265](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3265).
- GitHub-safe rerunnable checker: `scripts/qa/spring-test-edge-readonly-v20.py`. Raw security/HTTP logs, Test credentials, actual systemd unit, Nginx backups and rollback material are stored **only on the MiniPC task workspace**; not published.
