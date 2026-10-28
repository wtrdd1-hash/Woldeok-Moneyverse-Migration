# Development A worklog — 2026-10-28 10:50 KST

**v1 discovery:** Connected directly to Debian 13; backend/frontend/bot/MCP/nginx/docker active, dev DB connected. Read `AGENTS.md`, `README.md`, integrated `docs/planning/PROJECT_PLAN.md` (English) and `.ko.md`, previous QA, GitHub main/PRs/CI. Remote 13 branches including main, 11 open draft PRs, 2 conflicting and 6 with failing checks; 352 incident recovery refs preserved. PR #1652 was closed, unmerged, with unique commit `7632ab8d...`.

**v2 implementation:** Fresh worktree from main `a28bed9aa40ff74d492824ae12892a7d52132fdd`. Replayed only bounded support subject-search behavior, preserving newer privacy gateway logic. Backend authenticated query/validation; PostgreSQL owner read; web GET search and safe selection; Android no-store. Added regression for 44px search controls and existing SEO noindex.

**v3 verification:** RED→GREEN captured in host reports. Backend 1,930 PASS/440 SKIP, frontend 1,867 PASS/1 FAIL (blog), database 45 PASS/3 SKIP, bot 11 PASS. Lint 0 errors, typecheck/build/180 app API contracts PASS, disposable PG PASS. Root `pnpm test` FAIL on blog. All unverified release gates remain BLOCKED.

**v4 integration decision:** Do not merge/deploy. Test-current symlink target missing; public Test SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; public Production version reports `unknown`. No exact-SHA Test auth, backup restore or GitOps promotion. Preserve other agents' changes and all 352 recovery refs; delete 0 branches. Rollback: no runtime/database change to roll back. See QA and release HOLD documents.
