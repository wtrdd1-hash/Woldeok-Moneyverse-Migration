## v2026.09.23.415 — Business supply lint recovery

- Removed stale unused icon imports from the business supply-chain UI, eliminating three required-lint errors without changing runtime behavior.
- This follows the supply-command idempotency recovery and preserves DB migrations, privileges, ledger, and auth semantics.

## v2026.09.23.402 — Repair bot QA parser CI blocker

- Repaired invalid JavaScript string literals in the Discord music bot ads/SponsorBlock QA script so repository lint can parse the file and continue reporting downstream checks.
- Preserved QA behavior while removing unused bindings. No database, ledger, auth, or runtime application contract changed.

## v2026.09.23.390 — QA branch lifecycle cleanup hardening

- Branch: `fix/qa-branch-cleanup-v2026.09.23.390`.
- Fixed the merged-branch cleanup workflow so squash-merged PR source branches are deleted when the current branch head still exactly matches the merged PR head SHA.
- Branches that advanced after merge are retained, preventing deletion of new post-merge work.
- Cleanup still preserves branches without merged-PR evidence, even when their content happens to be contained in `main`.
- Manual repository hygiene pass reduced stale remote/local branches and removed clean patch-equivalent worktrees without deleting unique unmerged commits.

## v2026.09.23.383 — Caller-owned idempotency for asset overrides
- Admin cash/bank asset overrides now require a caller-owned UUID idempotency key instead of minting a replacement key inside the API.
- This makes timeout/retry behavior replay-safe at the HTTP contract while preserving the existing PostgreSQL ledger function and step-up authorization boundary.
- Added DTO regression coverage for missing and malformed keys.

## v2026.09.23.381 — Stock operator idempotency contract
- Manual price changes, market-event publication, and corporate actions now require caller-owned UUID idempotency keys.
- Existing admin clients already send these keys; schema, privileges, and ledger semantics are unchanged.

## v2026.09.22.367 — Unblock backend API completeness audit CI
- Fixed prefer-const CI blocker in backend API completeness auditor without altering audit semantics.

## v2026.09.21.322 — Migration authority fail-closed gate
- Production migration execution now rejects database-applied migration filenames absent from the exact repository checkout.
