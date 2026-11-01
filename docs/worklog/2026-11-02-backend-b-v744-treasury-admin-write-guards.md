# Backend B v744 — Treasury administrator mutation guards

## Before work
- [x] Inspect origin/main, AGENTS.md, README, EN/KO planning, QA v1456, active PRs and CI.
- [x] Confirm frontend admin server actions use `mutate()` and send session-bound CSRF.
- [x] Reproduce missing CSRF and admin console session on treasury POST routes (RED).
- [ ] Add guards to all state-changing administrator treasury routes, preserving public/read behavior and finance holds.
- [ ] Validate HTTP, integration, security, build, lint, typecheck, PostgreSQL and release gates.

## In progress
Pending RED test and code implementation. Do not merge or deploy unless all mandatory gates pass.

## Finished
Pending verification.
