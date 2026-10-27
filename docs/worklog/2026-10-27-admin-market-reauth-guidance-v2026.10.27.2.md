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
- [x] Add a safe link only for a classified recent-reauth requirement, not other 401s.
- [x] Verify publish and cancel wiring, mobile-friendly accessible UI, typed error mapping and role/CSRF/reauth guard negative tests (focused unit tests). Live authenticated Test E2E remains pending.
- [x] Re-fetch main at implementation checkpoint: still `5888176454648f51d5f986be60a22847bd234777`; no new conflicts.

## Checkpoint 1 — implementation (2026-10-27 KST)
- Added typed failure classification and one reusable safe account-security recovery panel, wired to both market event forms.
- Corrected obsolete TOTP directions in Treasury, Audit and Korean project ledger; English/Korean integrated plans, changelog, GitHub update files synchronized.
- No middleware/CSRF/role/DB authorization bypass; no migrations or production data mutations.
- Rechecked migration 246: current console session opens without separate recent reauth and uses 30-day/24-hour lifecycle (outdated 30-minute/10-minute copy identified, kept for follow-up). Individual market actions still require recent verified identity.

## Test checkpoint (2026-10-27 KST)
- `NODE_ENV=test pnpm --dir frontend exec vitest run src/lib/mutate.test.ts src/app/admin/market/market-event-reauth-help.test.tsx src/app/admin/step-up-field.test.tsx`: **PASS 5/5**.
- `NODE_ENV=test pnpm --dir backend exec vitest run src/admin/game-catalog-controller-guards.test.ts src/auth/guards/guards.test.ts`: **PASS 39/39**, including both market mutations, CSRF, missing/stale recent auth, authenticated role gate.
- Targeted ESLint: **0 errors, 9 existing unused-symbol warnings**; frontend `tsc --noEmit`: **PASS**.
- First Vitest invocation inherited host `NODE_ENV=production` and failed with missing React.act, including the unchanged baseline StepUpField test. Re-run with explicit `NODE_ENV=test` PASS; not an app defect.
- "/health" anonymous on Production and Test was 200; not proof of authenticated Test backend/API, DB or action E2E. No materialized exact-SHA test artifact yet. Root remains 100% used and data disk ~98% used; release verification must not be bypassed.

## Finished
- Pending: CI/PR, exact-SHA isolated Test backend & authenticated E2E, Production promotion. Do not report deployed ahead of these gates.
