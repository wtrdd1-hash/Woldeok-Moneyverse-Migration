# Planning v1502 — Wallet calendar-range hardening (EN)

## BEFORE WORK — 2026-10-30 11:09 KST
- [x] Read local Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees and verification-before-completion skills; skills connector listed no available URI.
- [x] Check miniPC Debian 13.6 services and dev DB connection; inspect latest GitHub main and merged v1500 #1974, QA v1386 P0 #1979.
- [x] Review canonical AGENTS.md, README.md, PROJECT_PLAN.md and Korean counterpart; review v1500 integrated master and actual Nest/Next/app-api code.
- [x] Recheck main at midpoint, define source-backed hardening, update EN canonical and KO equivalent integrated documents, P0/P1 backlog and release hold.
- [x] Verify documentation-only diff and bilingual parity, release classifier; publish Draft PR and handoff issue. Final commit CI pending.

**Cycle:** Previous Addition v1500 → Current Improvement v1502 → Next Addition v1504 (provisional). Scope: documentation only. No runtime/DB/WLD/Test/Production changes. External independently verified approvals new 0; cumulative UNKNOWN / 10,000 — BLOCKED / IN PROGRESS.

## IN PROGRESS — 2026-10-30 11:10 KST
- [x] Midpoint main `94d38f47603e99aabc42fc8f292b89441afb9663` unchanged; v1500 PR #1974 and QA #1978 are MERGED.
- [x] Source-backed v1502 corrections: DB asOf/KST bounds, PostgreSQL microsecond cursor, strict Next error taxonomy and validated JSON, app-api already forwards query and noindex.
- [x] DEV PG read-only: 10 relevant indexes, app-role direct account_balances UPDATE and audit_logs DELETE (P0 DEV-only).
- [x] Update bilingual canonical/integrated plans and changelogs; 4 P0 + 6 P1 backlog, 10,001-row acceptance **proposed only**.
- [ ] Push reviewed documentation, update GitHub handoff and PR, verify CI.

## FINISHED — 2026-10-30 11:13 KST
- [x] Draft PR #1983 OPEN and planning issue #1973 updated; 12 documentation files.
- [x] Local release-classifier tests 22 PASS/0 FAIL, four EN/KO planning docs each list all 10 backlog IDs, git diff --check PASS.
- [x] Final main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; Production v1523 SHA `94d38f47603e99aabc42fc8f292b89441afb9663`; official Test stale `c2129625aa6629c616fb31ce790950618b8d92b2`.
- [x] GitHub docs-only CI on preceding head 892ff104: classify/policy/release-input/verify/classify/verify/policy/non-runtime-summary SUCCESS; runtime checks SKIPPED. Completion-log commit needs fresh CI. Runtime/real-PG acceptance NOT RUN, official Test exact-SHA and independent restore NOT ATTESTED, Production RELEASE HOLD. External gate new 0, cumulative UNKNOWN/10,000.
