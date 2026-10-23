# Development A — verified wallet movement receipt (04:25 KST)

## Start / preflight
- MiniPC Debian 13.6 reachable; backend/frontend/discord-bot/MCP/nginx/docker active; dev PostgreSQL connected.
- GitHub/main and origin/main both `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`.
- 32 non-main remote branches (34 remote refs including origin/HEAD and main), each with unique commits; 32 open PRs. No deletion.
- Existing PRs #1049/#1054 (wallet receipts/history), #1021 (CSV lint), #1039 (blog test), #1035 (DB privilege gate), #1023/#1026 (wallet recovery/retry) are unmerged and protected.
- New isolated branch `auto/hourly-a-wallet-movement-20261024-0425` from latest main. No modification to main or other worktrees.
- Main wallet transaction projection has owner-scoped signed cash/bank deltas. Both web wallet lists still render `netAmount`, so zero-net cash↔bank moves appear as 0 despite nonzero movements. `postingAmount` helper exists but is not wired.
- Release HOLD: known main CSV lint, blog test, Next.js audit and PostgreSQL broad app-role DML; no authorized Test/Production promotion.

## Implementation and TDD
- RED backend: 4 new tests failed on absent `movementAmount` (4 existing PASS).
- RED frontend: missing shared wallet posting component; Android private receipt test failed on `public,max-age=600` upstream header.
- RED additional Android conditional request: `if-none-match` leaked to upstream; then removed only for wallet endpoints.
- GREEN backend focused: 8/8; frontend wallet+Android focused: 24/24.
- Files: wallet service/precision tests, shared posting component/tests, wallet page and activity page, posting strip, signed pocket helper, app-api proxy/tests, generated mobile API contract/schema EN+KO, plan/worklog/release.
- DB query is unchanged and owner-scoped. `movementAmount` is a verified exact positive WLD string, or null for zero-net movements with no proof; both UI surfaces show actual bank movement or accessible unavailable text. Android proxy preserves exact strings and auth cookie, strips private validators and enforces private/no-store.

## Verification (source candidate)
- Real development PostgreSQL READ ONLY: 876 owner-scoped transaction projections, 17 nonzero internal cash/bank movements, 859 nonzero net movements, 0 zero-posting rows.
- Dev PostgreSQL ledger: 877 transactions / 1784 postings / 0 unbalanced / 0 insufficient-posting transactions. `moneyverse_app` direct INSERT on 235 public tables: P0 privilege gate BLOCKED. No production DB inspected.
- Backend full: 1,317 PASS / 398 SKIPPED (55 test files skipped). Database package: 15 PASS / 3 SKIPPED.
- Frontend full: 1,388 PASS / 1 FAIL (blog category expectation; QA PR #1039 independently owns repair).
- Typecheck PASS; Build PASS; changed-file ESLint 0 errors (existing warnings); full Lint FAIL due existing `export-ledger-csv.tsx` no-control-regex (QA PR #1021 owns repair), 1 error / 1124 warnings.
- Production dependency audit FAIL: Next.js 16.3.8, 2 critical + 1 high.
- API contract generated from actual backend; check must be repeated after candidate commit because checker compares generated files to Git HEAD.
- Accessibility: shared strip announces unavailable amount via aria-label; private activity metadata noindex. No full browser a11y/SEO/E2E Test proof.
- P0 migration 266 provenance, app-role ACL, official Test exact SHA/real authenticated finance flow, Production release/rollback remain BLOCKED.
- No other developer branches or PRs touched; no branch deletion, migration, runtime switch, main merge, Test or Production deployment.

## Ruling
- Scope wallet bank movement receipts rather than editing overlapping unmerged wallet history/receipt PR #1049/#1054 or B's DB ACL migrations. This fixes a real visible zero-amount error using the already-available owner-scoped ledger projection without schema changes; downside: no full-history pagination until the independent PR is integrated.
