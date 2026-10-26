# A1125: Private Virtual Bank Cash/Deposit Snapshot CSV

## Context and scope
- Baseline main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (verified 2026-10-26 11:28 KST); 248 remote branches and 244 open PRs before work.
- Existing `/bank` page displays `bank_get_my_standing(actor)` through `GET /api/v1/banking/standing`; no private snapshot download exists on main. This is not a ledger settlement receipt, tax statement, bank certificate, or full asset statement.
- Distinct from unmerged A bank movement receipts (#1336), bond holdings (#1331), loans (#1372), and C bank interest receipt (#1337). No DB migrations or money mutations.
- This is a P1 bounded user convenience feature, not a fix for unresolved P0 release gates. Release remains HOLD until full gates pass.

## Implementation checklist
1. RED: tests for owner-bound backend snapshot, canonical 38-digit amount strings, null/error fail-closed; frontend CSV precision, formula safety, private auth, Android gateway no-store; real PG ACL regression.
2. GREEN: add `GET /api/v1/banking/standing/snapshot` with existing guards, `bank_get_my_standing` only, strict projection; no raw identifiers; generated timestamp explicitly response time.
3. GREEN: `/bank/standing.csv` private BFF CSV, member-only download CTA, Android gateway response privacy, machine-readable mobile API contract and EN/KO docs.
4. Validate focused tests, build/typecheck/lint/full unit/integration/real PG security/a11y/SEO/app-api, exact SHA CI and official Test; do not merge or deploy on any failure.
5. Recheck main/planning mid and preintegration; preserve all unmerged branches. Record worklog and QA/release HOLD evidence.

## Rollback
Delete only this branch's new route/helper/CTA/backend snapshot endpoint/contract entry in a future reviewed revert. No migration, balance write, service restart or production mutation.
