# 2026-10-25 — Admin economy policy step-up (B v522)

## Scope and invariants
- Origin main: `c9a868b1e622341e2daa8b936ddf0988eda9988e`.
- Root cause: `AdminControlsController` requires console session and CSRF but high-impact policy version/rollback/activation/auto-run/knob writes omit `ReauthGuard`; existing role grants and legal policy publication are already covered by other work.
- Preserve deliberately step-up-exempt feature-switch behavior (including economy_auto_policy), current API paths/DTOs, existing DB policy functions, idempotency/audit/ledger, and all other workers' branches.
- Fix: add recent reauthentication to the five sensitive mutation routes, and provide explicit account-security link on controls and economy admin screens. No TOTP claim; `ReauthGuard` uses existing session reauthenticated_at. No DB migration.
- Do not merge/deploy without all required gates, including isolated Test exact-SHA and authenticated E2E.

## Tasks
1. Add failing regression in `backend/src/admin/controls-policy-reauth.test.ts` for class guard + five mutations; assert feature-switch exception unchanged. Run RED.
2. Add `ReauthGuard` to five mutation decorators in `backend/src/admin/controls.controller.ts`, keep existing CSRF; run GREEN.
3. Add accurate UI guidance and link to `/account/security` in `frontend/src/app/admin/controls/page.tsx` and `frontend/src/app/admin/economy/page.tsx`. Confirm that the UI does not claim TOTP or bypass step-up.
4. Run targeted and broad tests, lint/typecheck/build/security audit, CI and PostgreSQL gates where feasible; log exact SHA and failures. Refresh main/planning before PR; draft-only until all gates pass.
