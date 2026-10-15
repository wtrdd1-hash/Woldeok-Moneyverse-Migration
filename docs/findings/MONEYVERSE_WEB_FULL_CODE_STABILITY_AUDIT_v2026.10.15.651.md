# Woldeok Moneyverse — Web Code, Functional Failure and Stability Audit v2026.10.15.651

**Status:** AUDIT ONLY; release BLOCKED. **Review baseline:** origin/main bf55b057 (2026-10-15 10:52 KST); baseline runtime: Production prod-v600, isolated Test test-v618-7fa3f245bbc3. Main has moved from c03b0a9b through documentation/CI audit integration v650; the application source remained unchanged between those commits. Companion Korean report: MONEYVERSE_WEB_FULL_CODE_STABILITY_AUDIT_v2026.10.15.651.ko.md.

## 1. Authority, coverage and methodology

Read authoritative docs/planning/PROJECT_PLAN.md and docs/planning/INTEGRATED_PLANNING_MASTER.md, AGENTS.md, DOCS_INDEX.md, docs/DOCS_INDEX.md, PROJECT_MEMORY.md, implementation/release documentation policy, docs/RELEASING.md, docs/UPDATE_LOG.ko.md and the existing v636–v639 findings. Planning authority v530 still BLOCKS all-route authenticated UI acceptance; source implementation is not Production completion.

Inventory: 164 frontend page templates (34 administrator), 78 Next route handlers, 82 NestJS controller files, 270 SQL migration files. Verified representative source call sites, document authority, production HTTP GET routes, isolated Test readiness, system service state, read-only DEV PostgreSQL catalog/statistics and full-route QA gate. A line-by-line proof of all code, authenticated member/admin browser flows and full DB migration replay was **not** completed. Existing v638 same-application-source test results (frontend 1,206 pass; backend 1,185 pass/29 skipped; TypeScript/build; mobile contract 179) and separate v639 candidate checks are historical evidence, not tests repeated or Production acceptance under v651.

## 2. Reproduced failures and risk register

| ID | Priority | Finding / evidence | Required resolution |
| --- | --- | --- | --- |
| STAB-651-01 | P0 | Read-only connected woldeok_moneyverse_dev catalog: 245 public tables; moneyverse_app can INSERT, UPDATE or DELETE on **241**; **11** SECURITY DEFINER functions expose PUBLIC EXECUTE privilege. This is an authorization-boundary weakness; exploitability of individual functions still requires validation. | Inventory dependencies, actor checks and function search_path; independently test least-privilege revocation against a schema-complete cloned Test DB, then plan a forward-only, reversible migration. **Do not revoke privileges in live DB without test/recovery evidence.** |
| STAB-651-02 | P0 | Source backend contains direct UPDATE public.account_balances in bond, auto-SWF, FX, pension, marketplace, black-market, PvP and stock-league flows. Existing v637/v639 inventory counts 24 non-test statements across eight files. Atomicity in the separate v639 PvP/auction fix does not supply canonical double-entry ledger postings. | Replace each direct mutation with actor-bound, transactional and idempotent Economy Core posting functions; assert total conservation, lock order, repeated-request safety, 403 and rollback negatives in isolated PostgreSQL. |
| STAB-651-03 | P1 | Production GET returns 404 for /auth/register, /attendance, /business, /career-guide, /guide/getting-started and /pet (reproduced 2026-10-15). Main calculator links still target /auth/register at salary page:259, ISA:254, pension-tax:273, youth-leap:310. | Bring v639 fixes through exact-SHA Test. Retain legitimate legacy 307/308 redirects and replace incorrect first-party links. /pet redirects only to planned-feature roadmap, not a working pet product. |
| STAB-651-04 | P1 | Production GET /api/stocks/not-a-uuid/candles responds 503 instead of client-error 400. Correct authentication negative /app-api/v1/account/identities without session responds 401; do not mislabel this 401 a broken member flow. | Deploy validated v639 BFF error mapping only after Test; enforce typed client/upstream errors, request ID and no sensitive upstream disclosures. |
| STAB-651-05 | P1 | pnpm qa:route-ledger:check fails exit 1 because its package script omits required --inventory. pnpm qa:route-ledger:test passes 3/3. Actual route-ledger evidence for five authenticated and responsive full UI passes remains absent. | Use v639 script repair plus generated inventory; collect genuine same-SHA 164-page ×5 Test evidence including 34 admin templates, 320/430 px reflow, role/session and API cases. No synthetic PASS data. |
| STAB-651-06 | P1 | Production points to prod-v600 while Test points to test-v618 and main/v639 code differs. Prior v638 audit reports 57 frontend source differences plus 9 absent, 20 backend source differences plus 8 absent between main and Production. v639 remains draft and release-blocked. | Confirm immutable release manifest SHA, CI matching exact candidate, database/role parity, backup restoration, session retention, rolling/canary swap and rollback before no-downtime promotion. |
| STAB-651-07 | P2 | DEV DB size 1008 MB; autovacuum on; 13,863 estimated dead tuples in virtual_stock_minute_candles and 4,932 in outbox_events. pg_stat_statements extension unavailable, preventing direct ranking of slow queries. There were zero current lock-waiting sessions at the sampling instant. | Benchmark slow statements using pg_stat_statements only after safe enablement approval, inspect EXPLAIN plans and outbox retention/candle indexes, consider v622 index/bounded-delete candidate on isolated Test. Avoid VACUUM FULL or production sweeping changes. |
| STAB-651-08 | P2 | Service units active and NRestarts=0; systemd error-severity logs over the last 24h: Production backend 0, frontend 0, Test backend 3, Test frontend 0. Host 16 CPU threads, 8,067 MB RAM with 48% use, root disk 64% used. These point-in-time checks do not establish reliability SLOs. | Add categorized latency/error/traffic/saturation dashboards, traces from Next BFF through Nest/DB, percentile budgets and auth/finance synthetic monitors. Review Test errors without assuming Production incident. |

## 3. Verification boundaries

Live successful GET probes include /register, /quests, /businesses, /guide/career-mastery, /roadmap, /blog, /stocks and /admin/seo (some protected pages may return a login shell). Isolated Test / and /register returned HTTP 200. Backend + Test health returned 200; no authenticated stateful E2E was attempted and no money transfer or account update was issued. Unit gate: QA 3 PASS; actual route-ledger gate FAIL as described. The complete preexisting unit suites were not rerun because main application source had no diff from the recent v638 full run; do not present historical counts as v651 fresh pass.

No source patch, running-config modification, feature switch change, database write, grant/revoke, migration, production/test alias change, main merge or zero-downtime promotion was performed by this audit. The v639 candidate already addresses some UI/API issues but its full-schema authenticated Test, ledger/permission boundaries and release gates remain blocked.

## 4. Ordered remediation and measurable acceptance

1. **P0 safety:** schema-complete Test DB clone, restore drill, runtime DB role-negative tests and inventory of all 24 balance writes; implement posted/idempotent ledger settlement with zero sum drift and fault injection; independently verify SECURITY DEFINER search_path and anonymous EXECUTE grants before carefully designed revokes.
2. **P1 functionality:** reconcile v639 against latest main; confirm six legacy routes no longer 404, correct calculator CTA, stock malformed IDs 400, normal candle 200 and absent stock 404, admin backup/IndexNow role+CSRF negatives; preserve login flow and real financial receipt truth.
3. **P1 full acceptance:** exact-SHA backend+schema readiness, 179-endpoint mobile contract, 164-page route inventory, 34 admin templates authenticated, five UI passes, 320–430 and other viewport matrix, backup rollback proof, CI and data/session preservation.
4. **P2 optimization:** baseline p50/p95/p99 SSR and API response time, 5xx rate, request volume, DB CPU/buffer usage, transaction lock waits, cache and outbox lag; optimize based on evidence only. Proposed goals must be adopted as service SLOs, not invented current measurements.

## 5. External primary-source references

- Next.js production and observability: https://nextjs.org/docs/app/guides/production-checklist and https://nextjs.org/docs/app/guides/instrumentation
- Next.js legacy path redirects: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
- NestJS readiness/shutdown: https://docs.nestjs.com/reliability/terminus
- PostgreSQL safe function grants/search_path: https://www.postgresql.org/docs/17/sql-createfunction.html
- PostgreSQL planner statistics/pg_stat_statements: https://www.postgresql.org/docs/17/pgstatstatements.html
- PostgreSQL autovacuum/lock considerations: https://www.postgresql.org/docs/17/routine-vacuuming.html
- Google SRE golden signals: https://sre.google/sre-book/monitoring-distributed-systems/
- Prior v639 candidate PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/844; related live audit PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/843

**Release verdict:** BLOCKED. Read-only audit complete for stated scope; implementation and production acceptance are separate tasks.
