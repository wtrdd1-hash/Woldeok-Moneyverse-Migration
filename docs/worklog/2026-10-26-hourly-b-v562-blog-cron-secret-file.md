# Backend B v562 — Protect blog cron credentials at the caller

## Before work — 2026-10-26 20:35 KST
- Starting `main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fetched from origin).
- Branch: `auto/hourly-b-blog-cron-secret-file-v562-20261026-2035`.
- Debian 13.6 miniPC active; root filesystem 99% / 1.7 GiB free, data volume 88% / 24 GiB free.
- Read AGENTS.md, README.md, both PROJECT_PLAN languages, recent QA, open PRs and main CI.
- P1 #1137: a local scheduled blog POST carries an inline credential as a curl argument. **Never copy the value into logs, tests, commits, or PR.** No evidence of external disclosure.
- No matching open PR for caller-side protected-file migration; #1300 addresses server-side weak scheduler secret and must be preserved.
- Other A/C/Gemini/QA branches and worktrees are not to be touched. No live crontab or credential changes before review.

## In progress
- [ ] Reproduce unsafe caller contract in a failing test (no actual secret read).
- [ ] Implement a protected-file curl runner with secret delivered on stdin, not argv or env.
- [ ] Prove file permission/owner and input-validation failures, no-network test isolation.
- [ ] Run full required gates where capacity allows; log each PASS/FAIL/BLOCKED separately.
- [ ] Refresh main and planning; create Draft PR only, preserve all reservations.

## Finished
- Pending.

### Intermediate evidence (before latest-main resync)
- RED: 4/6 new runner tests failed before implementation; GREEN: 9/9 including actual local-loopback curl config parsing.
- `pnpm lint`: PASS, 0 errors / 1,128 existing warnings; `pnpm typecheck`: PASS; `pnpm build`: PASS after independent offline frozen-lockfile install.
- `pnpm test`: FAIL (Backend 1,313 PASS/398 SKIPPED; DB 15 PASS/3 SKIPPED; Contract 38 PASS; Frontend 1,397 PASS/6 FAIL). Root new runner tests pass.
- Mobile API contract 179 endpoints PASS; repository security/control-byte/Prisma policy PASS.
- `pnpm audit --prod`: FAIL (High 2); full audit FAIL (Critical 2, High 10, Moderate 11, Low 3).
- Bot test: BLOCKED in this isolated workspace by missing `youtube-dl-exec`; offline npm install cannot retrieve it. No external installation attempted.
- Real PostgreSQL app/ledger test: NOT RUN (this patch has no DB changes); authenticated Test exact-SHA and GitOps release: BLOCKED.
- **Main advanced mid-run** from `1c5b84a1` to `8c2ddc24` with security audit and QA changes. Rebase must preserve new main's package overrides and HTTP advisory test.
- Production cron still contains the old inline credential; this candidate **does not remediate the running schedule**. Issue #1137 remains open until coordinated rotation and approved rollout.
