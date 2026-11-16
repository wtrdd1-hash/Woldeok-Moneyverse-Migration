# v2026.11.17.3 — Isolated Spring Test recovery and gated Production promotion

**BEFORE WORK (2026-11-17 KST):** The owner again ordered to resolve deployment blockers and promote the admin log dashboard to Production. Continuing PR #3205 on the isolated branch, rather than mutating the concurrently used main worktree.

Source of truth re-read: `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER*.md`, `docs/RELEASING.md`, and the previous v2026.11.17.1/v2026.11.17.2 worklogs. Fetched `origin/main` at `86777fb2d5a1f8bbc680453368c0a5f04b5c7715`. The candidate security code is in this branch; the running Production remains on older Spring/Next binaries.

**Observed release blockers:** `test-main-backend` is disabled/inactive, still targets legacy Node; Test `/api/v1/auth/session` 502, Test health/version proxies to Production port 4550, Test candidate source and frontend SHA mismatch. Current host Test staging tool assumes an absent Node artifact and the Next candidate BUILD_ID is not source SHA. Official Test PostgreSQL container exists on separate localhost ports but its data, roles and app connection must be verified read-only. The ongoing PR runtime CI has not been certified at this checkpoint. Do not use live Production DB for Test; do not restart or overwrite live Production Spring/Next services.

## Plan / mandatory gates
- [x] Verify Test PostgreSQL authority, role, schema, and safe service configuration without exposing secrets or changing Production data.
- [ ] Stage a new immutable exact-SHA Spring Test backend and Next frontend; keep rollback directories. No relabeling or direct Production jar replacement.
- [ ] Repair Test Nginx edge routing and API gateway to an independently isolated Spring service, not Production 4550.
- [ ] Run real Test HTTP auth/roles, log sources, redaction, session continuity, public identity, Test-only DB and regression gate.
- [ ] Recheck refreshed main and PR exact-head CI; integrate only after gates pass.
- [ ] Stand up a fresh Production canary using an immutable artifact and independent rollback; verify public edge/financial/session/backup gates before switching traffic.
- [ ] Document exact measured results and deploy/hold status in EN/KO worklog and update notes.

**IN PROGRESS:** Test DB authority verified; Spring canary and real HTTP gate QA pass; official Test deployment pending.

**FINISHED:** Pending evidence; never claim Production promotion until verified on public origin.

**IN PROGRESS (2026-11-17 KST):** Remote `main` advanced to `8b3e3aca3a8f8504535000c6a02a992acaf3c1a7` (unrelated backup audit #3208). Fetched and merged into task branch with no conflicting files. Isolated `3150` Spring canary connected successfully to Test-only `wdmv_v761_test_acl` as `moneyverse_app`; `/health` 200, `/api/version` 200, anonymous log/security endpoints 401. Test DB intentionally denies direct `users` and `user_roles` SELECT, but offers `admin_current_roles(uuid)` and `admin_session_touch(uuid,uuid)` SECURITY DEFINER functions. Must use its established role function for session-bound log access. No Production mutation.

**IN PROGRESS (2026-11-17 KST):** Added a least-privilege session resolver, environment-specific log collection targets, API SHA identity and privileged frontend denial. Test-only Spring 3150 + PostgreSQL 5585 HTTP results: superadmin 200, non-superadmin 403, anonymous/forged 401, invalid query 400, journald Spring/frontend 200. Exactly two synthetic Test sessions were removed and residual=0. Created immutable Spring/Next staging helper (syntax verified). The test Nginx paths are not yet provisioned, so NGINX source properly remains UNAVAILABLE. No Test/public edge or Production runtime mutation.
