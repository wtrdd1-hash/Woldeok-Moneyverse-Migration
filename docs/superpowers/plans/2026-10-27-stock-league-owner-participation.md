# Owner participation beyond leaderboard implementation plan

> **For agentic workers:** use test-driven-development and verification-before-completion.

**Goal:** Prevent an enrolled stock-league member outside the first 20 leaderboard entries from being shown as not enrolled and offered another paid join.

**Architecture:** Keep public top-20 leaderboard bounded; perform a separate member/season-scoped read for the authenticated member only. Preserve null for guests and unregistered users. Do not change ledger settlement, DB schema or existing API shape. If the stored rank is pending, display a truthful pending label rather than rank zero.

**Tech:** NestJS, pg parameterized queries, Vitest, Next.js.

**Acceptance:** member beyond top 20 appears enrolled; no cross-user read; guest no owner query; pending rank honest; public leaderboard remains unchanged; existing join guard unchanged; synthetic isolated PostgreSQL and full gates before release.

### Task 1: Backend owner read
- [x] RED: tests for owner read, absent owner and guest.
- [x] GREEN: add repository getMyParticipation(seasonId, userId) and controller integration.
- [x] VERIFY: unit tests and isolated PostgreSQL owner-filter query.

### Task 2: Truthful ranking
- [x] RED: test rank pending state when DB rank_position is null.
- [x] GREEN: render pending label for zero/unranked; prevent join on failed owner read.
- [ ] VERIFY: targeted tests, full build and CI (CI pending; release HOLD).

### Release
- [ ] Refresh latest main/plans, compare other PRs, log exact SHA.
- [ ] Full lint/typecheck/build/unit/integration/security/app-api/E2E/official Test exact-SHA required; hold merge and Production until all pass.
