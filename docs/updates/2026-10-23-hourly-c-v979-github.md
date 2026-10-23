# Development C v979 — GitHub integration update (English canonical)

- Baseline main: `b147ed18a7359011f8457ff9748772186588e452` (three fetches, unchanged).
- Independent branch: `auto/hourly-c-guest-home-v979-20261023-1812`; P1 #1000 guest-first/home market failure.
- Source commit: `6f30f67160f9b2c1964cbcd715d052b5b70948a2`.
- Files: `frontend/src/app/page.tsx`, `frontend/src/app/home-guest-ssr.test.tsx`, English/Korean worklog, this GitHub update.
- Tests: RED 5 -> GREEN 11 focused; full test, typecheck, build, isolated PostgreSQL 278 migrations and 1882 backend tests, Chromium mobile/desktop E2E PASS.
- BLOCKED: root lint existing wallet CSV (#991); Next security audit 2 critical/1 high (#1001); official exact-SHA Test/auth/app-api and GitHub required CI not yet green. P0 DB ACL #993 remains.
- Release decision: DRAFT/HOLD; do not merge or deploy; preserve all other worktrees/PRs/branches and five existing schedules.
