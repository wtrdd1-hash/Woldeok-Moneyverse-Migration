# A 2026-11-02 14:25 KST — Public board most-discussed ordering

## Before work
- Status: IN PROGRESS; no product code changed yet.
- Main baseline: a8541927c3a351d980454c66e95a3356c47e0722; branch: auto/hourly-a-20261102-1425-board-most-discussed; isolated worktree.
- Initial remote heads: 228 including main; open PR: 210, conflicting: 29; protected all unique commits.
- Scope: P1 read-only public discovery. Add sort=discussed to bounded latest-50 public board listing, preserving stock/title filters; verify Nest/PostgreSQL, Next SSR, Android app-api, accessibility and SEO.
- Constraints: no migrations, financial/ledger mutations, new grants, user-private data, or Production changes. Existing P0 #993 and release blockers remain.
- Design: sort ONLY the 50 most recent public posts by comment count DESC, createdAt DESC, postId ASC; not whole-archive ranking. Explicit sortApplied response proves empty-result behavior.
- Rollback: default recent unchanged; remove optional filter if rejected. No DB rollback required.
- Tests: RED/GREEN backend service+controller, web parser/SSR, Android response contract; full gates; real PostgreSQL read-only; Test exact SHA and GitOps checks before merge.
## In progress
- [ ] Tests RED then GREEN, full validation and cross-branch conflict audit.
## Finished
- Pending.
