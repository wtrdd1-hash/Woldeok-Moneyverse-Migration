# v2026.11.17.2 — Whole frontend-to-Spring migration
## Before work — 2026-11-17 KST
- Owner directive: **replace the entire Next.js frontend with a Spring Boot served web frontend**, in addition to backend migration. Earlier v2026.11.13.1 planning says keep Next; this superseding directive changes the target but does not authorize a blind in-place cutover.
- Baseline read: origin/main 8b3e3aca3a8f8504535000c6a02a992acaf3c1a7; docs/planning/INTEGRATED_PLANNING_MASTER.md, PROJECT_PLAN, AGENTS.md, docs/RELEASING.md and actual source/runtime. Next app has 177 page.tsx and 124 route.ts handlers. Existing Spring MVC web templates absent.
- Coordination: use isolated branch feature/full-spring-web-foundation-v2026.11.17.2 and isolated worktree; other Gemini/admin/security/SEO worktrees untouched. Re-fetch latest main mid-work and reconcile changes.
- P0 blocker: pre-existing admin finance and security failure findings (QA PR #3207), Spring SecurityConfig permitAll / CSRF disabled, fake ledger evidence. Do not route Production users or financial/admin writes through a new web cutover before resolution.
- Working scope this execution: actual tested Spring MVC public page rendering foundation, English-primary/Korean-secondary locale, safe read-only routes, deterministic inventory of all existing Next pages/BFF handlers with explicit NOT_MIGRATED status, architecture and gate documents. Track precise implemented vs unimplemented work. No artificial redirect shells or false completion.
- Tests: TDD RED -> GREEN, isolated Gradle JVM tests, route coverage inventory test, read-only HTTP smoke of private candidate port if feasible, no side effects. No Test/Production promotion without exact-SHA and auth/ledger gates.
## In progress
- Pending.
## Finished
- Pending. Initial status: no runtime change.
