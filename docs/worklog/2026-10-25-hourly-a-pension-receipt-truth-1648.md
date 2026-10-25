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
