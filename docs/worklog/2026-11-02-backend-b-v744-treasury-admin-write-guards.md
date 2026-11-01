# Backend B v744 — Treasury administrator mutation guards

## Before work
- [x] Inspect origin/main, AGENTS.md, README, EN/KO planning, QA v1456, active PRs and CI.
- [x] Confirm frontend admin server actions use `mutate()` and send session-bound CSRF.
- [x] Reproduce missing CSRF and admin console session on treasury POST routes (RED).
- [x] Add guards to all state-changing administrator treasury routes, preserving public/read behavior and finance holds.
- [ ] Validate HTTP, integration, security, build, lint, typecheck, PostgreSQL and release gates.

## In progress
RED: 5 failures and 12 passes; GREEN: 17/17 passes on real HTTP and decorator checks. Existing finance hold remains HTTP 503 after guards. All 13 treasury admin write routes require an open console session and CSRF. Do not merge or deploy unless all mandatory gates pass.

## Finished
Pending verification.
