# Hourly A — National pension payout receipt truth (2026-10-25 16:48 KST)

## Before work
- Source: `origin/main` `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, new isolated branch `auto/hourly-a-pension-receipt-truth-20261025-1648`.
- Initial remote heads: 165. Initial open PRs: 161. All existing worker branches and PRs preserved. Main README, AGENTS, living EN/KO project plans, integrated planning, prior QA and release blockers inspected.
- Debian 13, backend/frontend/nginx/docker active; root filesystem 95% (5.5GiB free), data disk 57% (81GiB free). No production-connected database writes allowed.
- P0 problem: pension historical payout logs have no canonical ledger transaction ID; `275-pension-ledger-settlement-hold.sql` documents 98 unjournaled 45-WLD payouts. Member page currently calls those logs `received`, treats account's unverified payout total as received, and converts failed API requests to empty history. Public overview substitutes invented vault amount 25,000,000 WLD on API failure. The pension financial mutations are already held.
- Scope: member-only read-only historical payout audit and accurate failure/unverified states across backend/API, frontend and Android app-api. No schema mutation, no ledger writes, no fake `verified` claims. Existing pension payout financial hold remains unchanged.
- Design: enrich payout API records with an explicit `UNVERIFIED_LEDGER` status; keep original amounts as reported history only. Preserve the source ID, exact integer string, owner filtering and original timestamps. Make member UI distinguish unavailable history from no records, label payout amounts/total as unverified, and avoid fabricated public overview. Regression tests for fail-closed and Android route parity. Prefer existing DB read path; never grant direct DML.
- Gate: verify focused RED then GREEN, full build/lint/typecheck/test, security, isolated real-PG read-only and exact-SHA official Test. No main merge/production if any gate fails.

## In progress
- [ ] Add failing backend/front/app-api tests and reproduce.
- [ ] Implement bounded read-only pension receipt truth.
- [ ] Recheck origin/main and integrated planning, run required gates.

## Finished
- Pending. Release HOLD until all required gates are proven.

### Implementation checkpoint (17:02 KST)
- Focused TDD RED: backend 1 failure (missing unverified marker), frontend 2 failures (misleading receipt/history), mobile 1 failure (missing private no-store), backend permission-denial 1 failure, member account failure 1 failure. GREEN: backend 3 PASS; frontend pension/page/mobile 16 PASS.
- Read-only isolated PostgreSQL `wdmv_v761_test_acl` with `SET LOCAL ROLE moneyverse_app` confirmed `SELECT` and `INSERT` both denied on `national_pension_payout_logs`; `SELECT` denied on `national_pension_accounts`. The actual owner-filtered payout SQL fails SQLSTATE 42501. No direct grants or database writes attempted; this is a hard backend data availability blocker requiring a separate forward-only `SECURITY DEFINER` migration and real owner isolation testing. Never use shared Production-connected 5433 for fixtures.
- Member portal no longer fabricates public vault fallback, distinguishes account/API failures from logout or zero balances, and labels historical payout entries and aggregates as **ledger unverified**, never confirmed transfers. API preserves original exact WLD strings and returns 503 on the observed app-role read denial. Android app-api preserves status, session and private no-store/noindex.
- Mid-task origin/main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` unchanged; canonical EN/KO and integrated planning reread. Full typecheck PASS.
- Unrelated worker PRs/branches and applied migrations untouched. No release, merge or Production writes.
