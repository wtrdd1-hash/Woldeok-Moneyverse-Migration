# QA v1425 — SSRF Pinned Transport Test Port Fixture

**Status:** DRAFT / RELEASE HOLD. **Baseline main:** `f13bbce273ffc65e8576170992d82ea00c27a1c9`.

## Before work

- [x] Read repository AGENTS.md, Superpowers using-superpowers, systematic-debugging, TDD, worktree and verification guidance.
- [x] Create isolated QA branch/worktree; preserve the primary checkout and other agents' branches.
- [x] Reproduce the exact-main full backend suite failure: 2,949 PASS / 1 FAIL / 517 SKIP. The failed socket test reported `TypeError: fetch failed`, cause `bad port`.
- [x] Confirm Linux ephemeral range `1024–65535` includes Fetch-blocked ports; Node Fetch rejects ports 6000, 6667 and 10080 with `bad port`. Unmodified focused test passes on three independent reruns, consistent with a flaky random port fixture.

## In progress / TDD

- [x] RED: add an explicit safe-test-port assertion and observe failure before the helper exists.
- [x] Initial GREEN attempt with `listen(0)` retry failed to allocate a high port after 64 tries; capture failure, do not mask it.
- [x] Final GREEN: bind a CSPRNG-selected loopback port from `49152–65534`, retry only `EADDRINUSE`, and preserve the pinned IP + original Host assertions. No production SSRF implementation changes.
- [x] Focused tests 2/2 PASS, then 15/15 separate reruns PASS.
- [x] Changed-file ESLint exit 0, workspace `pnpm typecheck` exit 0, focused SSRF transport/defense suite exit 0, `git diff --check` PASS.

## Finished locally / release status

- [x] Commit the test-only fix and publish as Draft PR #2235; preserve the unique branch for review.
- [ ] Exact final candidate SHA GitHub CI and complete backend suite.
- [ ] Official isolated Test exact-SHA backend/API/DB/login, authenticated E2E, independent restore, and GitOps approval.
- [ ] Production promotion. **Prohibited until every release gate is verified.**

**Impact:** This change stabilizes a test fixture. It is not proof of an SSRF vulnerability or a Production security fix. QA did not change a shared database, perform financial writes, merge main, restart services or deploy Test/Production. Full run evidence is stored at `/srv/moneyverse-data/qa-reports/qa1425-evidence/` and the internal task report.
