## v2026.10.02.506 — Urgent runtime and database-boundary repair

- Repair private-chat conversation/history/sync/unread/archive access through least-privilege SECURITY DEFINER contracts; direct private-chat table access remains revoked from `moneyverse_app`.
- Fix the chat peer profile lookup to use the authoritative member profile/public-name model instead of nonexistent `user_profiles` / `users.display_name` fields.
- Close six treasury SECURITY DEFINER functions that were accidentally executable by PUBLIC after migrations 240-242.
- Remove direct treasury INSERT/UPDATE grants from the application role and route citizen budget voting through `treasury_cast_citizen_budget_vote`.
- Runtime repair procedure also restores frontend generated `.next` writeability for the service user and re-aligns Test/Production frontend/backend to one exact candidate.
- Fresh isolated Test database verification: database package 7/7 PASS; backend 170 files / 1,639 tests PASS, 29 environment-gated casino E2E tests skipped.

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
