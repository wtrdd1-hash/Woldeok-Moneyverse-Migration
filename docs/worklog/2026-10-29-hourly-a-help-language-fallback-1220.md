# Development A 2026-10-29 12:20 — verified help alternate-language search

**Disposition: IMPLEMENTED / LOCAL GATES PASS / DRAFT PR / RELEASE HOLD.** This is a user-visible, opt-in search enhancement, not help-source approval or deployment.

## Before
- Connected directly to miniPC Debian 13.6; backend/frontend/bot/nginx/docker and development PostgreSQL reachable. Root disk 61–63%, data disk 45%; existing main worktree had unrelated modified finance SQL and untracked cache and was not edited.
- Fetched exact `main=b84d645a87e8fa0d544ca3ee17e785e737e477ea`; read AGENTS, README, English canonical and Korean secondary PROJECT_PLAN, integrated v1454 help proposal and v1456 release plan, QA v1364 and previous A worklogs.
- Start: 121 remote branches, 118 open Draft PRs. All PR heads present/matching, zero duplicated heads. Dry-run merge-tree audit: 119 unique unmerged non-main branches, 50 clean merge candidates, 69 conflict/error, 1 main ancestor. No branch/PR deleted.
- Scope selection: PR #1825 already owns migration 295 for help publication identity, so avoid duplicating/renumbering immutable migrations. Use existing approved-only `public.help_public_search` function; no migration or financial change.

## Implementation
- POST `/api/v1/help/search`: strict optional boolean `fallbackToOtherLocale` (default false); search alternate language only after an empty primary read; preserve category/query/limit, reject string booleans, return `{articles,requestedLocale,resultLocale,fallbackUsed}`.
- Next.js server action and UI: explicit unchecked opt-in, dynamic language label, approved-language notice and locale-specific article links; no query in URL, no fabricated translation, no false empty on DB error.
- Android `/app-api/v1/help/search`: preserve existing public-only allowlist, forward POST body, enforce `private,no-store` and `noindex` even if upstream marks public. Bump app-api contract version. English and Korean mobile guides updated.
- Database: no schema change, no app table grants. Reuse `help_public_search` SECURITY DEFINER publication/reviewer/expiry controls. New isolated fixture and real-PostgreSQL integration tests cover approved-only fallback, expired/unapproved exclusion and app-role table SELECT denial.
- TDD RED→GREEN evidence: backend controller 4 failing then passing; frontend action 3 failing then passing; Android proxy cache policy failing then passing; locale-switch label failing then passing. Added HTTP Nest e2e, UI and app-api tests.

## Verification and release
- Full `pnpm test`: backend 1,961 pass / 443 skip, frontend 1,918 pass, database 46 pass / 4 skip, API contract 38 pass, plus release and bot tests. Full lint: 0 errors, 1,091 existing warnings. Typecheck PASS after fixing an exactOptionalPropertyTypes issue. Full build PASS.
- Real isolated PostgreSQL 17.11: applied migrations 002–294 in disposable `mv-a1220-help-pg` (127.0.0.1:55492), then synthetic fixture; 3 help DB tests PASS. No live Test/Production DB writes. Dependency audit: 0 high/critical, 1 moderate.
- Existing help feature flag remains OFF unless separately approved. Source approval / independent 10,000-reference gate, financial provenance, migration checksum and official exact-SHA authenticated Test E2E are NOT cleared. Production v1213 and Test both report application SHA `b44ffd0a...`, not this candidate.
- Release decision: **HOLD**. No main merge, no Test/Production deployment, no feature-flag change, no production ledger/DB writes, no rollback action. Preserve all unmerged branches; only clean up the isolated test container after evidence capture. Exact final commit SHA and GitHub CI disposition recorded in PR and miniPC report after push.
