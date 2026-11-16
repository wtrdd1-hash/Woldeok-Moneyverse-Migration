# Spring Dopamine route collision + false WLD reward repair (v2026.11.17.1)
**Status:** SOURCE FIX VERIFIED / RELEASE HOLD — 2026-11-17 06:55 KST
**Source of truth:** origin/main 2c1ea4cd7734e67f6047c68eb4ec884940ac7a09, docs/planning/PROJECT_PLAN.md, INTEGRATED_PLANNING_MASTER.md, AGENTS.md.
## BEFORE WORK
- Owner requested remediation of previously incomplete work; avoid parallel SEO, log, SEC1 and KDIC branches.
- Existing EngagementController and DopamineController claim the same GET /api/engagement/dopamine/status and /api/v1/engagement/dopamine/status. Previous full Spring suite had Phase7 error.
- DopamineController returns random WLD spin success with no canonical PostgreSQL journal.
- No live Test/Production actions, no financial data changes; target fail-closed and preserve Nest canonical settlement.
## IN PROGRESS
- Create branch-specific RED tests for duplicate Spring route and authenticated fabricated success, apply minimum fix, verify full Spring tests and artifact.
## FINISHED — 2026-11-17 07:04 KST
- Reproduced RED 5 targeted tests with 4 expected failures for duplicate handlers/false 200; later 6 engagement security+receipt tests all RED (6/6).
- GREEN: 5 Dopamine, 7 Engagement, 1 actual embedded-HTTP suite, and all existing Spring tests. Clean Gradle test bootJar PASS: 114 tests / 0 failures / 0 errors / 0 skipped, compiled 78MB JAR.
- Fixed duplicated /api/(v1/)engagement/dopamine/status, require authentic signed-in actor in EngagementController rather than X-User-Id or hard-coded UUID, and removed unsupported fake WLD spin/streak claim, bull/bear vote, Dopamine quota, and feature status success.
- Preserve GET read-only streak only if actual database source replies; unavailable/empty database no longer fabricates a balance.
- Main rechecked at midpoint/final: 2c1ea4cd7734e67f6047c68eb4ec884940ac7a09; other SEC1, SEO, KDIC, logs branches untouched.
- No database writes, financial transactions, systemd/Nginx changes or production promotion performed.
- Release HOLD: Spring session/CSRF/consent positive flows, official exact-SHA Test, ledger-backed feature restoration, broader finance P0 and independent full restore still needed.
- GitHub review PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3218.

## MIDPOINT — ~06:59 KST
- Confirmed baseline RED: 5 targeted tests, 4 expected failures (duplicate mapping and unjournaled success).
- Corrected duplicate Dopamine route and fail-closed unverified status/spin/streak.
- Focused Phase7, Phase14, Dopamine regression PASS; full Spring clean test bootJar PASS, 106 tests / 0 failures, 78 MB JAR.
- Main ref rechecked; additional same-domain issue found: EngagementController accepts forged user-id headers and EngagementService returns unjournaled streak/vote success. Extend same task with new RED/GREEN and full gates.
