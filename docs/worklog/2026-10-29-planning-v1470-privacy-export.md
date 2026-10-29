# Moneyverse planning v1470 — privacy-export integrity improvement (2026-10-29)

**Scope:** F675-173; Previous Addition v1468 / Current Improvement v1470 / Next Addition v1472 (provisional). DRAFT / RELEASE HOLD. No runtime code, DB, finance, Test or Production modifications.

## Start — 19:07–19:09 KST
- miniPC Debian 13.6: backend, frontend, bot, nginx, Docker active; DEV PostgreSQL reachable. Root disk 77%, data 74%. Remote main 76d63a5840a4a185fcaeb02f8b1132dd145f19e4. Existing main checkout has unrelated uncommitted runtime files; never modified it. Dedicated worktree and branch created clean at /srv/moneyverse-data/build-workspaces/planning-v1470-20261029-1905.
- Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion read from installed main; skills connector listed no URIs. GitHub connector inspected main and PR #1877 (merged), issue #1876 (open), P0 #1878, developer PRs #1880/#1881.
- Canonical sources AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md; source inspected: backend/src/privacy/{privacy.controller.ts,privacy.repository.ts,privacy.service.ts}, backend/src/auth/guards/reauth.guard.ts, frontend/src/app/account/privacy/page.tsx and frontend/src/app/app-api/v1/[...path].
- QA v1370 FAILED/P0: 462 historical refs absent, migration collision #1878, finance provenance unresolved, no official exact-SHA Test. Latest main has 303 SQL files with collisions 291×3/292×3/293×2/294×2/295×4 (fresh source count). Earlier QA counted 300 files; keep timestamps separate.

## Mid — source and planning reconciliation
- v1468 Git merge 6930c76ac exists but the latest main project and integrated master no longer contained F675-173 after v270 consolidation. Restore only the previous v1468 sections from the prior clean planning worktree, prepend v1470 improvements; do not reset or overwrite unrelated main changes. No separate planning spec created.
- Discovered concrete reauth mismatch: ReauthGuard 900 seconds versus proposed privacy export <=600 seconds. Require export-specific server-authoritative 600s session binding. Harden per-class snapshot completeness, canonical manifest, no silent truncation, encrypted-at-rest versus plaintext ZIP, one-use no-resume download and restoration-safe purge.
- Backlog P0 REPO1470-01, SEC1470-02, FIN1470-03, REL1470-04; P1 EXPORT1470-05 through EXPORT1470-10. Proposed 10,001-row real-PG and adversarial tests NOT RUN.

## Completion / release boundary
- English canonical and Korean equivalent project plan + integrated master, bilingual worklog and internal/GitHub update logs are documentation-only. Verify diff and bilingual 10-ID parity before commit and PR. Main and plan rechecked mid/finish; record actual SHAs, tests and CI separately.
- Independent externally sourced, deduplicated, actually approved references: newly 0; cumulative UNKNOWN / 10,000, gate BLOCKED / IN PROGRESS.
- PR remains DRAFT, no merge, no schema numbering, no SQL, no Test/Production release. Development owners must resolve #1878 migration collisions and prove exact-SHA Test, independent restore and privacy/security acceptance.

Draft PR #1882: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1882; developer issue #1876 updated.
