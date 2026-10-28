# Member support recent-subject search recovery — implementation plan

> For agentic workers: follow `skills/test-driven-development`, `skills/using-git-worktrees`, `skills/verification-before-completion`.

**Goal:** Restore the user-facing support subject search from closed, unmerged PR #1652 without reopening or deleting preserved history.
**Architecture:** Reuse existing `public.support_my_threads(actor,limit)` SECURITY DEFINER read function; search only the latest 100 owner rows with bound literal substring SQL. Keep default 50; surface bounded GET search on web and Android gateway; no schema or ledger change.
**Base:** `a28bed9aa40ff74d492824ae12892a7d52132fdd`; original preserved commit `7632ab8d01a84c4f33ff03a004a7f7d2b568c91c`.

- [x] Inspect main, AGENTS, English/Korean integrated plans, PR #1652 and recovery incident #1663.
- [x] Isolate branch/worktree from latest main; preserve all existing worktrees and refs.
- [x] RED: backend 2 failures; web 2 failures; Android cache 1 failure.
- [x] GREEN: restore owner-bound query, validation, web search, gateway no-store; add 44px search controls and SEO regression.
- [x] Verify focused tests, full build/typecheck/lint, backend/frontend/database/bot, API contract, isolated PostgreSQL, security audit.
- [ ] Full frontend/root suite green; exact SHA authenticated Test and GitOps release proof. These are blocking, not waived.
- [ ] Merge only after all gates PASS, latest main rebase and release authority verification.
