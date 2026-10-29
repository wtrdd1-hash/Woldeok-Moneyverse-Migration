# v2026.10.29.1513 — National Pension / SWF / Treasury cross-service runtime audit

## BEFORE WORK — 2026-10-29 22:37 KST
- User request: broadly inspect National Pension (NPS) and related national finance functionality, not fabricate a successful settlement.
- Canonical documents inspected: `AGENTS.md`, `docs/planning/PROJECT_PLAN.ko.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, `docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.ko.md`, `docs/NATIONAL_PENSION_SERVICE_SPEC.ko.md`, `docs/TREASURY_AUTONOMOUS_SWF_SPEC.ko.md`, v762 NPS P0 finding and v1501 SWF/central-bank worklog.
- Started from freshly fetched origin/main `54b182d2214a15974350701174175f589789613b` in dedicated independent worktree; leave shared checkout's unrelated dirty files and other agents' branches untouched.
- Production backend health responds 200; public Nginx serves immutable v1502 source c2129625aa66. Health does not prove NPS/SWF settlement.
- Scope: API/page/worker/SWF/DB migration and live-read-only evidence, precision, idempotence, permissions, reconciliation; no money movement, scheduler activation, schema or Production cutover.

## IN PROGRESS
- [ ] Map member/admin/Android NPS flows and related SWF/treasury/bank boundaries against live version and canonical plan.
- [ ] Inspect live API no-auth boundaries and PostgreSQL catalog and aggregate data with READ ONLY, no PII or token disclosure.
- [ ] Run focused tests, classify historical issues versus new defects, capture pass/fail/skip and release state.
- [ ] Refetch main/integrated docs midway; record findings in versioned English/Korean documentation and GitHub review.

## FINISHED — 2026-10-29 23:16 KST
- Completed direct running-source and PostgreSQL read-only checks, focused backend/frontend safety tests and 12-area NPS/SWF/Treasury feature review.
- Published bilingual findings `docs/findings/NPS_SWF_TREASURY_FULL_RUNTIME_AUDIT_v2026.10.29.1513.{md,ko.md}` and versioned internal/GitHub English/Korean update notes. Exposed both P0 live false-success #1909 and P1 pension-rate math #1910 on GitHub.
- Source/test evidence: NPS backend 47 PASS, frontend 21 PASS; SWF backend 7 PASS / 11 FAIL, frontend 7 PASS / 2 FAIL. Production read-only data and auth negative documented; **no authenticated finance E2E**, no exact-SHA Test release, no migration, no data mutation, no deployment.
- At end-of-audit fetch, `origin/main` remained `54b182d2214a15974350701174175f589789613b`; integrated planning master unchanged. GitHub documentation-only review PR [#1912](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1912) opened, with no app/runtime scope; its merge/review state is tracked on PR, not a claim of financial release.
- Financial P0 disposition: **RELEASE HOLD** until actual source receipts and canonical Treasury funding are proven; block SWF fake-success endpoints. Preserve other workers' app code branches and production availability.


### IN PROGRESS checkpoint — 2026-10-29 23:12 KST
- Confirmed exact running v1502 application source `c2129625aa66` is the same risky SWF service implementation inspected on freshly fetched main `54b182d22`. Git checkout with unrelated local mutations is untouched.
- Read-only Production-connected PostgreSQL `BEGIN READ ONLY` / `ROLLBACK`: NPS 2 accounts (1 receiving status), 50,000 WLD principal, 1 contribution, 238 payout rows × 45 = 10,710 WLD (latest 2026-10-15), 0 last-24h payments. Migration 275 present (pension write hold); migration 300 absent. App role SELECT for NPS accounts/contributions/payouts true, prohibited NPS DML absent. Role-scoped authenticated reads still not E2E proven.
- SWF: config `is_enabled=true`, four portfolios, 270 events, 248 legacy COMPOUND_GROWTH_CYCLE (latest 2026-10-15), five `SWF_REBALANCED` events marked SUCCESS with `amount_wld=0` on October 29 after only timestamp mutations. No ledger ref column on event table; canonical funding/settlement unverified. Main service's manual liquidation also returns success from zero-value event with no authoritative transfer. Public `/pension` HTTP 200 shows transaction hold; anonymous `/api/admin/pension/overview` HTTP 401.
- Canonical TREASURY cash projected 0 WLD while five text-based legacy vault rows sum to 220,923,528 WLD; 552/552 Treasury legacy rows lack `ledger_transaction_id`.
- NPS backend focused: 47/47 PASS, frontend 21/21 PASS. SWF backend focused: **7 PASS / 11 FAIL**; frontend 7 PASS / **2 FAIL**. Actual authenticated pension actions weren't exercised, to avoid money movement. These focused results do NOT establish full-suite green or isolated Test finance settlement.
- Forecast discrepancy: 50,000 WLD Tier-1 × 8 basis points hourly = 40 WLD/hour, 350,400 WLD/8,760-hour year = 700.8% nominal simple annual versus advertised 7%. This is a simulation/contract mismatch, not an actual cash payout report.
- Findings registered in GitHub P0 issue #1909 (SWF false success) and P1 #1910 (pension annual/hourly mismatch), with prior #1275 (SWF synthetic tax), #1302 (NPS historical read boundary) and #1816 (MINT source) cross-links.
- No DB writes, service restarts, runtime flag changes, Test dispatch or production promotion.
