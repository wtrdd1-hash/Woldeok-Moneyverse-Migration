# Woldeok Moneyverse — Web Functional Remediation and Stability v2026.10.15.654

**Status:** implementation candidate, **Test acceptance/Production promotion BLOCKED**.
**English canonical** | [한국어](MONEYVERSE_WEB_FUNCTIONAL_REMEDIATION_v2026.10.15.654.ko.md)

## Authority and coexistence
Authoritative: `docs/planning/PROJECT_PLAN.md` (v530 UI BLOCKED still controlling), `INTEGRATED_PLANNING_MASTER.md`, `AGENTS.md`, release and documentation policies. Initial branch base origin/main `bf55b057`; observed concurrent main subsequently `57b37a38` with audit/promotion-document edits but no app source change. Do not overwrite Gemini/other agent branches. The v639 draft PR #844 supplied 34 previously tested application/QA files, selectively ported without its version-639 documents. New v654 defects have RED→GREEN regression evidence.

## Corrections implemented in dedicated branch
1. **Navigation**: four calculators use real `/register` and remove front-end-generated unearned WLD claim/success language; support, Discord and career/pet routes point at actual pages. Six old public routes preserve sensible 307/308 compatibility redirects. Pet redirects to roadmap *as a planned feature*, not a working pet service.
2. **Stocks**: Next BFF validates stock UUID and preserves typed upstream 400/401/403/404/429 rather than blanket 503; unknown server/network failures still fail privately, no-store.
3. **Administration**: backup list requires administrative authority and open console; backup mutation additionally demands CSRF and fresh reauthentication. IndexNow mutation requires same-origin authenticated admin and canonical own-HTTPS-host URLs, max 100, with role/origin negative tests.
4. **QA & source provenance**: full-route QA command now generates a route inventory and requires real five-pass evidence ledger; it fails safely if evidence is absent. Supplemental bot QA parser syntax fixed; backend version gets configured immutable BUILD_ID/manifest SHA only, otherwise reports unknown.
5. **Transaction safety (partial)**: reuse v639 single-connection BEGIN/COMMIT/ROLLBACK and account-lock/concurrent auction/PvP improvements; disable unintended scheduled monetary operations by default in test. **NEW v654** `withPgTransaction` destroys a borrowed pg client when BEGIN fails or ROLLBACK fails so an uncertain transaction state cannot poison the shared pool (new negative tests first failed then passed).
6. **Test determinism (NEW v654)**: front-end Vitest explicitly sets NODE_ENV=test; Debian's exported NODE_ENV=production previously made React's act() missing and caused hundreds of spurious test failures. New regression confirms React.act availability when command is launched from a production-valued shell.
7. **Disposable real-PG tests**: v639 isolated settlement tests can now be run against `wdmv_fix_v654` only with explicit V654_DB_ISOLATED=yes and exact loopback hostname/port/database guard. The dedicated database was newly created by copying **schema only** from synthetic `wdmv_fix_v639`, not from Production.

## Executed evidence
- Isolated actual Next production build at localhost:3164: `/` and `/register` HTTP 200; `/auth/register`→308 /register; `/attendance`→307 /quests; `/business`→308 /businesses; `/career-guide`→308 /guide/career-mastery; `/guide/getting-started`→307 /guide; `/pet`→307 /roadmap; `/api/stocks/not-a-uuid/candles`→400. Canary was local-only and stopped after checks, with no public/Test aliases switched.
- New transaction-helper unit tests: two RED then five total GREEN. Production-shell React test runner regression: 1 PASS. `wdmv_fix_v654` PostgreSQL synthetic finance concurrency/rollback tests: **4 PASS**.
- The first comprehensive run inherited NODE_ENV=production: backend PASS, frontend false-failed React.act; cause proven. The subsequent full source-tree verification passed **frontend 1,229/1,229, backend non-DB 1,201 tests PASS (395 DB-related tests skipped), typecheck, optimized Next build, lint 0 errors / 1,088 historical warnings**. Bot initially lacked local modules, then npm ci installed 130 packages and standalone bot **4/4 PASS**. The actual route-ledger check remains correctly BLOCKED because no real `.moneyverse-qa/route-ledger.json` exists.
- Full-site QA ledger remains intentionally FAIL unless genuine evidence for 164 pages ×5 including 34 authenticated admin templates is gathered. Do not fabricate it.

## Remains P0 / explicit release blockers
**DO NOT PROMOTE** while: `moneyverse_app` directly DML-authorized on 241 of 245 public tables and PUBLIC can execute 11 SECURITY DEFINER functions in connected development DB; at least 24 raw `account_balances` UPDATE sites in eight services are not replaced by canonical double-entry postings; v639 PvP/black-market transaction grouping is *not* ledger reconciliation; user balances, Treasury and SINK sources require conservation proof, actor-binding, idempotency, function-search_path review and complete DB role-negative tests. The synthetic isolated database has 157 public tables and cannot establish complete 245-table Production-equivalent schema parity or Test acceptance.

Other blockers: actual logged-in member/admin browser full-route five-pass QA, Test exact same SHA/DB/schema/backend, authenticated admin backup/IndexNow E2E, missing-evidence QA ledger, persisted session across switch, tested backup restoration/rollback, Android validation, and no-downtime release proof. Existing deployed prod-v600/test-v618 still serving; no live SQL, money, switches, aliases or main branch changes performed.

## Primary technical references
- https://www.postgresql.org/docs/17/libpq-pgpass.html — client connection handling context
- https://node-postgres.com/features/transactions — one client per transaction
- https://node-postgres.com/apis/pool — `release(true)` removes broken pool client
- https://react.dev/reference/react/act — test-time React act
- https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects — compatibility redirects
- https://nextjs.org/docs/app/guides/production-checklist — Next production checks
- https://www.postgresql.org/docs/17/sql-createfunction.html — SECURITY DEFINER semantics
- https://sre.google/sre-book/monitoring-distributed-systems/ — latency/traffic/error/saturation signals

## Follow-on acceptance order
(1) full independent schema-equivalent Test restore; (2) canonical ledger postings and idempotent settlement for every raw money path; (3) dependency-audited least privilege/SECURITY DEFINER Test; (4) authenticated member/admin UI and 164×5 responsive checks; (5) Test backend and exact release manifest SHA+CI; (6) backup/rollback and session-preserving, proven no-downtime promotion. No premature production deployment.
