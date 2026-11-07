# Recent Public Board Edited-Posts Filter Implementation Plan

**Goal:** Let web and Android visitors identify genuinely edited posts within the existing latest-50 publicly visible board snapshot, without inventing archive-wide results.

**Architecture:** Reuse `public.member_board_public_list_with_stock(50)` as the bounded, privilege-contained PostgreSQL read; add a strict `editedOnly=1` SQL predicate after the function and allowlisted Nest query parsing. Next web and Android gateway must reject invalid filter values, distinguish empty from unavailable, and fail closed on unverified filtered results. No new migration, direct grants, financial writes, or changes to other agents' branches.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js, Vitest, TypeScript, Android app-api gateway.

**Spec:** Existing board API and `docs/planning/INTEGRATED_PLANNING_MASTER.md`; automation authorizes a bounded P1 user-visible addition without an interactive design checkpoint. Latest plan v1626 concerns a different subsystem; do not modify it.

## Global constraints
- Base on fresh `origin/main` in a dedicated `auto/hourly-*` worktree. Recheck main and plan at midpoint/pre-PR.
- Preserve stock and title filters, exact source limit 50; no claims about older posts.
- Filter means `updated_at > created_at` (not merely non-null). Null/malformed/unverifiable values must not appear as verified edited posts.
- Strict GET query: only `stock`, `q`, `editedOnly`; the last is optional and when present must be exactly `1`, never duplicated.
- Android success proof: <=50 posts, unique canonical UUIDs, ISO timestamps, `updatedAt > createdAt`; upstream 200 without proof => 503, no-store/noindex/no-referrer on filtered success/error/HEAD.
- Preserve existing finance/identity/ledger/migrations. No production deployment without all gates.

## Tasks (TDD)
1. **RED Backend:** Extend stock-community controller/service tests for filter validation, parameterized SQL over bounded function, and unchanged default/stock/title semantics. Run focused tests and capture expected failures.
2. **GREEN Backend:** Implement optional `editedOnly` in controller and SQL. No direct table reads or migrations. Rerun focused tests.
3. **RED Frontend and App API:** Add filter parser/proof tests, web search/SEO accessibility assertions, Android 200/400/503/privacy tests. Capture failures.
4. **GREEN Frontend and App API:** Implement shared strict parser/proof, web GET checkbox and failure state, gateway validation and private headers. Rerun focused tests.
5. **Review and verify:** Midpoint main/plan refresh, check competing PR overlap, full backend/frontend/DB tests, contract, build, lint/typecheck, security/SEO/a11y, real PostgreSQL read-only, exact-SHA CI; record failures, HOLD if any gate missing.
6. **Release:** Create Draft/HOLD PR; merge only with full exact-SHA CI, official Test exact-SHA authenticated E2E, finance/ACL/backup/rollback proofs. Otherwise do not merge or deploy. Log start/end branches and preserved changes.

**Rollback:** No runtime deployment. For candidate-only rollback close PR / remove branch only after unique changes safely superseded; if later released, revert feature code via reviewed new commit, no SQL rollback.
