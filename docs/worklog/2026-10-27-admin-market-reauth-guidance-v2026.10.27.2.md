# v2026.10.27.2 — Administrator market-event reauthentication guidance and retired 2FA copy

## Before work (2026-10-27 KST)
- Parent audit: #1515, user screenshot of `/admin/market` `reauthentication_required` on publish.
- Source: current `origin/main`, EN/KO `docs/planning/INTEGRATED_PLANNING_MASTER`, `PROJECT_PLAN`, SEC-126-01, migration 197, market controller and `ReauthGuard`, `docs/RELEASING`.
- Security authority: administrator TOTP/OTP was retired; recent OAuth/local-credential reauthentication is intentionally retained for privileged market/economic changes. Do not bypass admin-role/console/CSRF/recent-auth checks.
- Change scope: truthful error semantics and in-context, discoverable account-security navigation for both publishing and canceling market events; remove inaccurate retired-TOTP directions in directly adjacent administration UI; focused regression tests.
- Concurrency: isolated worktree and new branch; leave other agents' worktrees, host main and deployment pointers untouched.
- Starting remote main: `5888176454648f51d5f986be60a22847bd234777` (2026-10-27 09:32 KST). Re-fetch before integration and record actual SHA.
- Host preflight: root disk reports 100% (`~700 MB free`), data volume 97% (`~5.8 GB free`). Do not build or promote if candidate/test verification lacks safe capacity.

## In progress
- [x] Checked main and documentation, reproduced the code path by inspection; backend `ReauthGuard` rejects before market event SQL.
- [ ] Add a safe link only for a classified recent-reauth requirement, not other 401s.
- [ ] Verify publish and cancel flows and mobile-friendly accessible layout, regression tests and security guards.
- [ ] Re-fetch main, reconcile conflicts and validate exact source SHA.

## Finished
- Pending: record test outputs, CI/PR/Test/Production status honestly.
