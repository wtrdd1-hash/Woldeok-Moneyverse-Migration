# Development A — owner-private support conversation ordering

## Before work — 2026-10-30 18:31 KST
- Base `origin/main`: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` (verified remotely).
- 27 remote branches, 26 open PRs at inspection; no destructive cleanup, protect unique changes.
- Read `AGENTS.md`, `README.md`, canonical `docs/planning/PROJECT_PLAN.md` and Korean counterpart, latest Development A QA and worklog, PRs and CI. Separate task worktree.
- Scope: P1 owner-private support conversation ordering (newest default; oldest within newest 100 only), combined with existing status and literal subject filters; Next.js + NestJS + PostgreSQL SECURITY DEFINER read + Android app-api. No new migration, no balance mutation.
- Safety: reject invalid/duplicate sort query, preserve default behavior and owner function, fail closed for malformed Android oldest-first results, private no-store/noindex. Do not claim historical all-time oldest.
- Release: feature candidate only; full CI and official Test exact SHA required, Production HOLD until all release gates PASS.

## In progress
- [ ] RED tests: API, owner-scoped SQL, web, Android gateway.
- [ ] GREEN minimal implementation.
- [ ] Regression, typecheck, lint, build, isolated PostgreSQL, CI.
- [ ] Recheck main/plan and record branch/SHA/Test/Production/rollback evidence.

## Finished
- PENDING.
