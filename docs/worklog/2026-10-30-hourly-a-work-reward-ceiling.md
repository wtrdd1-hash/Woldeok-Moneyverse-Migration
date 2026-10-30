# A — Member work-task maximum preview reward filter (2026-10-30)

Status: **STARTED / IN PROGRESS / DRAFT / RELEASE HOLD**.

## Before work
- Baseline: main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; independent `auto/hourly-a-20261030-1625-work-reward-ceiling` worktree.
- Read AGENTS.md, README.md, English/Korean integrated plan, latest QA, existing open PRs and CI. Avoid A board/receipts/notification and B/C overlapping domains.
- User-facing P1: let authenticated members cap work tasks by *preview* WLD reward, including Android app-api; preserve the existing minimum reward and maximum duration filters. Canonical integer-string comparison must occur in PostgreSQL over the existing member-scoped `work_task_board(actor)` function, never by JS Number.
- No migration, ledger writes, role grants, or feature-state changes. Query params must be strictly validated and bounded. Invalid/duplicate inputs fail HTTP 400.
- Required: RED/GREEN backend, frontend, app-api tests; isolated PostgreSQL; typecheck/lint/build/security/a11y/SEO/full suites; exact SHA CI/Test gate. No PASS without evidence.

## In progress
- [ ] RED tests
- [ ] Backend/DB read filter
- [ ] Frontend form and server query
- [ ] Android app-api proof
- [ ] QA/release evidence

## Finished
Pending; no merge or deployment without complete release proof.
