# C v1288 — Public enterprise disclosure source truth

## START — 2026-11-02 07:50 KST
- Baseline `a8541927c3a351d980454c66e95a3356c47e0722` from fetched origin/main. Independent branch `auto/hourly-c-soe-public-truth-v1288-20261102-0745`.
- MiniPC Debian 13.6, seven services active, development PostgreSQL connected. Inspected AGENTS, README, README/README.ko.md, canonical and Korean project plans, open PRs, QA v1457, A/B activity and CI.
- P0 observed: public `/enterprises` renders hard-coded WLD assets/revenue/dividends and fictional company records when `publicApi` fails; it labels estimated dividend rates as settled treasury receipts and uses request time as disclosure time.
- Scope: use existing Nest `GET /api/v1/enterprises/public` and PostgreSQL repository read contract, fail closed on missing/malformed data, retain real verified zero/empty results, exact WLD display, accessible retry, honest provenance. No financial writes, schema changes, or private data exposure.
- TDD RED first; then GREEN, build/lint/typecheck/DB/API/security/CI, isolated Test when available. Never merge/deploy without every release gate PASS.
- [ ] RED tests and source-contract validation; [ ] implementation; [ ] intermediate main/plan fetch; [ ] complete verification; [ ] final worklog and PR.

## MID — pending

## END — pending

## MID — 2026-11-02 07:51 KST
- TDD RED reproduced: outage rendered 365,000,000 WLD and fictional enterprise personnel; verified empty list lacked empty state; malformed money displayed as a valid public figure.
- GREEN: focused 16/16 passed after correcting a test fixture that had a future API timestamp; runtime schema, bounded rows, duplicate-code and WLD precision guards added. Typecheck PASS; origin/main fetched again unchanged (`a8541927c3a351d980454c66e95a3356c47e0722`).
- Public SEO set to noindex until independently certified; public source response time is not a settlement receipt. All new code is read-only.

## END — 2026-11-02 08:02 KST — PARTIAL / DUPLICATE HOLD / RELEASE BLOCKED
- Critical duplicate discovered during exhaustive historical PR review: open Draft #2274 (C v1250) already implements the same public SOE source-truth correction, including a backend/Android path and a proposed SECURITY DEFINER migration. This branch MUST NOT be merged as an independent duplicate. Do not delete it while its distinct decimal precision tests remain unintegrated; coordinate the tests and source boundary with #2274 first.
- Exact candidate code SHA before this log update: `7586043cb1e749a2b608e2671b4e1243b136c157`. Focused 17/17 PASS. Full lint PASS, typecheck PASS, build PASS, frontend 2939 PASS, backend 2980 PASS / 518 SKIP, contract/database/app-api/security PASS. Production high-severity audit PASS; full audit FAIL (9 advisories: 8 moderate, 1 low). Full-route QA FAIL (missing `artifacts/qa/full-route-ledger.json`). Authenticated browser E2E NOT RUN (running the E2E assessment module as a script produced no certification; it is not a PASS). Official Test exact SHA, restore and Production BLOCKED.
- Isolated PostgreSQL 17.11: all 322 migrations (002–323) PASS, seeded state_enterprises 3 rows. `moneyverse_app` has no direct SELECT on `state_enterprises` or `private_enterprises`; actual app-role SELECT returns `permission denied for table state_enterprises`. Existing Nest public enterprise repository directly SELECTs both tables, so the public endpoint cannot be considered operational under the hardened app role. Fix with scoped SECURITY DEFINER reads (not a broad GRANT), coordinated with Draft #2274 and concurrent B migrations. Isolated container removed; shared DB untouched.
- Origin/main rechecked before end: `a8541927c3a351d980454c66e95a3356c47e0722`, unchanged. No merge, GitOps, Test or Production mutation, rollback needed, branch deletion or other worker changes. GitHub candidate build still in progress at last check. Release remains BLOCKED.
