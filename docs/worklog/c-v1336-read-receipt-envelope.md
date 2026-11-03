# C v1336 — Notification read receipt response minimization

## Start
- Baseline: `07fa93a7781c60e042c59862953bc6f05452e45a`.
- Finding: the member notification read-all handler validates two counters but returns the entire upstream receipt, potentially exposing unexpected properties.
- Scope: return only the two validated counters; preserve API contract and ledger.
- Status: implementation pending; release HOLD.

## Verification plan
- Regression: reject unexpected receipt properties from the outward response.
- Run targeted tests, lint, typecheck, build, backend, DB, security and CI when available.

## Mid / final
- Worktree HEAD baseline actually `b12b12f8cc03d1f7fe9b78894a075cec4bce4ca0` (main advanced between initial fetch and worktree creation); origin/main re-fetch matches baseline.
- Change: whitelist `updatedCount` and `remainingUnreadCount` in read-all response. New regression verifies upstream privateEmail/accessToken are not forwarded.
- Targeted Vitest 3/3 PASS, frontend `tsc --noEmit` PASS, changed-file ESLint PASS.
- Frontend build BLOCKED: another Next.js build holds the build lock. No competing process terminated.
- Full backend, PostgreSQL, security, app-api, authenticated E2E, official Test exact-SHA and CI not verified. Release HOLD; no merge/deploy.
