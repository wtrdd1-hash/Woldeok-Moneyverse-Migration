# Moneyverse WLD overflow and precision hardening — v2026.10.14.625

**Status:** implementation candidate on isolated branch only. No Test or Production acceptance.
**Date:** 2026-10-14 KST. **Authority:** INTEGRATED_PLANNING_MASTER / PROJECT_PLAN v530 planning baseline; no change in monetary issuance policy. **Canonical language:** English; see Korean counterpart.
**Scope:** safe monetary boundary handling, presentation, transfer notifications, pension calculation/receipt paths. No database migration or production writes.

## Problem and verified observations

- Read-only PostgreSQL 17.11 development inspection: account_balances.available_amount and ledger_postings.amount are unconstrained numeric. An 80-digit integer round-trip was exact. Migration 194 documents the widened WLD storage. This does not certify every subsystem: some columns are bigint or numeric(20,2) and PL/pgSQL functions can cast to bigint.
- PostgreSQL numeric still has a physical storage limit (up to 131072 digits before the decimal point); no finite database system can store arbitrary-size user input. This patch adds no game-economy holding cap. Exceeding a storage/operational bound must fail atomically rather than silently round or corrupt value.
- Reproduced before fix: an 80-digit all-nines WLD amount was displayed as a different amount using Number(); a 36-digit wallet transfer notification was rounded to trailing zeros; large pension amounts used floating-point calculations and number-valued API payloads.

## Implemented protections (candidate)

1. **Wallet**: exact string read model and BigInt aggregation retained; added 100-digit cash/bank verification. Notifications now group BigInt digits rather than formatting a Number. Member transfer input still accepts canonical decimal strings and safe numeric compatibility requests.
2. **Fiat presentation**: exact BigInt minor-unit conversion for configured integral WLD-to-fiat rates (KRW/USD/JPY/CNY), explicit half-up rounding; both dual-currency components use the safe formatter. Legacy numeric conversion returns NaN for unsafe inputs, and nonfinite display returns an unavailable marker instead of fabricated zero/Infinity. These approximate fiat labels are NOT exchange quotations.
3. **P2P and treasury donation UI**: positive canonical-string validation, exact grouping of button/receipt amounts and donor totals, no string-to-Number money coercion.
4. **Burn draw**: API winner burn_amount stays a decimal string. Request accepts canonical positive strings and only safe integer JSON numbers; unsafe doubles/invalid values are rejected, no silent rounding. Existing minimum 10000 WLD and default behavior for omitted values retained.
5. **National pension**: contribution, accumulated principal, tier decisions, 95% refund/5% welfare split, hourly payout, aggregate payout and treasury ledger parameters now use string/BigInt integer arithmetic. The public controller does not coerce money through Number. Pension member/admin UI shows exact amounts and sends canonical strings. Payout APIs return WLD quantities as decimal strings instead of possibly rounded JSON numbers; contract consumers must accept this change.

## Regression evidence (local isolated worktree)

- RED evidence: before the patch, frontend currency test 2 failed; notification precision 1 failed; new positive-string and burn API tests failed; pension rate/split/unsafe-number tests failed. GREEN after fixes: frontend focused currency/money/pension 20/20, backend focused wallet/burn/pension 12/12 (2 wallet + 2 burn + 3 pension + 5 existing pension service).
- Both frontend and backend TypeScript typechecks passed; production frontend and backend builds passed. Workspace lint had zero errors, 1057 warnings during earlier run (not classified by this patch).
- Before pension changes, backend full test suite 1166 passed / 391 skipped; database package 7 passed. These are not acceptance of the skipped real-DB suite.
- Before pension changes, frontend full test suite 793 passed / 379 failed, mainly untouched UI/SEO/React test files. Two specific baseline files reproduced 3 failures and 16 passes on a clean upstream main; not all 379 failures were independently reproduced. Full frontend gate is therefore BLOCKED.
- **Final post-pension full suites on merged main baseline:** backend 1,169 passed / 391 skipped, database package 7 passed, frontend 795 passed / 379 failed. The exact set of 379 failed frontend test names matched the pre-pension run (zero new failing test names). Touched-file lint: zero errors / 24 warnings. Latest origin/main d4f9cc19 still matches the reconciled base. CI and real-DB release acceptance remain pending. No sign-in/session, backup/restore, financial reconciliation, full PostgreSQL integration or exact-SHA isolated Test runtime acceptance occurred in this task.

## Residual risks and required remediation

| ID | Priority | Evidence / area | Acceptance required |
|---|---|---|---|
| WLD-625-01 | P0 | Some pension/other financial paths still mutate protected account_balances/vault balances directly instead of an authoritative double-entry posting. Legacy treasury GREATEST(0, balance-refund) can permit a mismatch if funds are insufficient. Precision work does NOT rectify conservation/accounting. | Separate reviewed ledger-function migration, conservation/replay/concurrent negative tests and independent database reconciliation. |
| WLD-625-02 | P1 | backend/src/stock/stock-league.repository.ts converts wallet balances and stock valuation to Number for league initial assets and copy-trading checks. Some destination fields may be fixed-precision. | Range-safe exact-string ledger calculations, fixed-column suitability review, and extreme-value real-DB tests. |
| WLD-625-03 | P1 | backend/src/discord/discord-alert.service.ts whale alert; frontend/src/components/stock-season-leaderboard.tsx; frontend/src/app/marketplace/auction/page.tsx and other legacy money displays/calculators still use Number. | Inventory financial monetary conversions, central formatter and per-route 100+ digit regression tests; retain intentional bounded analytics/rates. |
| WLD-625-04 | P1 | Other finance columns remain bigint or fixed numeric(20,2); SQL casts/aggregates and JSON consumers may reject larger-than-column values. | Column-by-column schema/function/API limit census, exact overflow SQLSTATE handling, atomic failure tests; forward-only migrations only if justified. |
| WLD-625-05 | RELEASE BLOCKED | Frontend 379 failed tests; DB/security tests skipped; no isolated exact-SHA Test promotion, no session continuity, no release/rollback proof. | Repair failures, run fresh full migrations/integration, Test exact-SHA backend and frontend changed-flow checks, then separately approve zero-downtime production release. |

**Security:** No economy feature switches changed, no existing SQL migrations modified, no balance/ledger/user rows edited; no Production promotion was attempted.

## References

- https://www.postgresql.org/docs/17/datatype-numeric.html
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
- docs/planning/DATABASE_ARCHITECTURE_SPEC.md
- docs/architecture/database-security.md
- docs/RELEASING.md
- docs/worklog/2026-10-14-wld-overflow-precision-v625.md
