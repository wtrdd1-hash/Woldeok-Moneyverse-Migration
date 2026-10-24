# Verified Spaces and Auction Release Hold — Implementation Plan

> For agentic workers: use isolated worktree, test-driven development, and verification-before-completion. This plan is preauthorized by the recurring C task's explicit P0/P1 development scope; release remains HOLD.

## Scope and evidence
- main `c9a868b1e622341e2daa8b936ddf0988eda9988e` (fresh fetch 04:15 KST); other A/B/QA/Gemini PRs remain unmerged.
- `/spaces` and `/spaces/real-estate` mount `PersonalSpacesView` which reads browser localStorage, awards invented space ownership, and announces WLD rent settlement with no ledger receipt.
- `/api/spaces/real-estate/auction` uses mutable process-local sample auctions; POST claims a bid succeeded without DB transaction. `/api/spaces/real-estate/claim-rent` returns fixed 4,990 WLD payment with no ledger. Critical financial truth gap.
- Real owner-scoped GET `/api/v1/spaces` already exists: SessionGuard + AuthenticatedGuard + ConsentGuard, `SpaceService.listUserSpaces`, `PostgresSpaceRepository` query `WHERE user_id=$1` in PostgreSQL. Do not invent writes or migrate Production-connected 5433 DB.

## Tasks (TDD)
1. Add failing tests for read-only authenticated ownership, guest/unavailable/empty state, mobile/a11y/SEO and both legacy money POST routes rejecting writes.
2. Replace `/spaces` with server-authenticated, uncached real PostgreSQL owner listing; do not show browser-only holdings, fictitious rent, or fake success. Render same panel on `/spaces/real-estate` and explicitly HOLD mock auction UI.
3. Make mock auction GET/POST and fake rent POST fail closed (503, no-store) without changing real DB/ledger; update outdated source test. Verify no user-visible fake WLD receipt remains in mounted routes.
4. Run focused tests, lint, typecheck, build, backend contract/PG gates, security audit, full CI and exact-SHA Test where safe. Record results precisely; never merge/promote if any required gate fails.

## Safety
- Root disk 99G 100% (503M available), so isolated worktree on `/dev/shm` with existing dependency links. No other worktree/branch deletion.
- Main and planning docs must be re-fetched mid-task and before any merge; no Production DB writes, deploy or GitOps without all gates.
