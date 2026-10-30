# A — Member work-task maximum preview reward filter (2026-10-30)

Status: **STARTED / IN PROGRESS / DRAFT / RELEASE HOLD**.

## Before work
- Baseline: main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; independent `auto/hourly-a-20261030-1625-work-reward-ceiling` worktree.
- Read AGENTS.md, README.md, English/Korean integrated plan, latest QA, existing open PRs and CI. Avoid A board/receipts/notification and B/C overlapping domains.
- User-facing P1: let authenticated members cap work tasks by *preview* WLD reward, including Android app-api; preserve the existing minimum reward and maximum duration filters. Canonical integer-string comparison must occur in PostgreSQL over the existing member-scoped `work_task_board(actor)` function, never by JS Number.
- No migration, ledger writes, role grants, or feature-state changes. Query params must be strictly validated and bounded. Invalid/duplicate inputs fail HTTP 400.
- Required: RED/GREEN backend, frontend, app-api tests; isolated PostgreSQL; typecheck/lint/build/security/a11y/SEO/full suites; exact SHA CI/Test gate. No PASS without evidence.

## In progress
- [x] RED tests (backend 15 failed, frontend 14 failed; before implementation)
- [x] Backend/DB read filter (bound numeric ceiling over actor-scoped function)
- [x] Frontend form and server query
- [x] Android app-api test added; GREEN pending
- [ ] QA/release evidence

## Finished
Pending; no merge or deployment without complete release proof.

## Mid-work checkpoint (16:32 KST)
- Fresh main check unchanged. Implemented strict maxReward parser (0..18 decimal digits), actor-scoped PostgreSQL predicate, combined minReward/duration bounds, and UI/app-api forwarding. Existing work assignment and payout paths untouched.

## Finished checkpoint (2026-10-30 16:42 KST)
- [x] Android app-api proof: 52 gateway tests PASS; combined web/app work regression 81 PASS with `NODE_ENV=test`.
- [x] Isolated PostgreSQL 17.11: all 305 numbered migrations applied with the repository CI script; 1 real DB test PASS; synthetic actor rolled back; dedicated container removed.
- [x] Typecheck, build, lint (0 errors, 1,043 warnings), generated app contract (183), database unit (56 PASS/4 SKIP), production dependency audit (0 known vulnerabilities).
- [x] Full suites executed: backend 2,578 PASS/119 FAIL/496 SKIP; frontend 2,625 PASS/53 FAIL. Failure-name sets exactly match prior A 15:57 baseline; full gate remains FAIL.
- [x] Branch/PR audit: start 21/20, end 22/21 (including this task); 21 non-main branches with unique unmerged commits; 0 deletions, 0 forced closures, 0 merges. Candidate checkpoint CI runtime-check FAIL.
- [x] Test/Production read-only evidence: Test SHA `c2129625…` Treasury HTTP 200 synthetic/unverified; Production SHA `94d38f47…` Treasury HTTP 503 UNVERIFIED. Exact candidate Test E2E BLOCKED.
- [x] English/Korean QA and release HOLD recorded; Draft PR #2016. No Test/Production/DB/ledger/service changes, no rollback required.
- [x] Latest main and both integrated plan language variants rechecked at start, midpoint and before PR: main unchanged `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.

**Final decision: P1 targeted and real-DB PASS, FULL GATES FAIL, RELEASE HOLD.** Exact final candidate SHA and CI belong in the GitHub PR evidence after push. Never treat docs-only changes or targeted tests as deployment approval.
