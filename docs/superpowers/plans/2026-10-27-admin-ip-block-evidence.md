# Admin IP block evidence and lift identity — implementation plan

> Required workflow: isolated worktree, RED-GREEN-REFACTOR, exact-HEAD verification, no release without all gates.

## Goal and source evidence
Backend `AbuseSecurityController.ipBlocks()` returns `AdminIpBlockRow[]` from `admin_list_ip_blocks($1,100)`. The row identifier is `block_id` (UUID), not `id`; frontend currently passes `block.id` to the lift action and converts fetch failure to empty records.

## Task 1: Validate backend read contract
1. Add Vitest tests for valid `block_id`, bounded list, UUIDs, canonical timestamps, active/lift consistency, duplicate IDs, malformed response and failure states; run RED.
2. Implement pure parser in `frontend/src/app/admin/security/ip-block-evidence.ts` with strict typed output, fail closed on invalid rows; run GREEN.

## Task 2: Render truthful security console
1. Add server page rendering tests for real block ID wiring, API failure, empty list, invalid list and no unsafe lift actions; run RED.
2. Update `frontend/src/app/admin/security/page.tsx` to distinguish unavailable from empty and pass `block_id` to lift form. Disable list-dependent lift on failed evidence. Preserve administrative guard, noindex, mobile and accessibility; run GREEN.

## Task 3: Mutation-side guard and validation
1. Add regression test for malformed block UUID before step-up/mutation; run RED.
2. Reject malformed UUID in `frontend/src/app/admin/security-actions.ts`; run GREEN.

## Task 4: Verification and review
1. Run focused and full frontend tests, lint, typecheck, builds, backend tests, API contract, security audits, isolated PostgreSQL and CI on final HEAD. Record failures as failures.
2. Refetch main and canonical plan hashes, check overlap, create Draft PR; do not merge or promote until all gates pass.
3. Record exact SHA, Test/Production versions, rollback and branch retention.
