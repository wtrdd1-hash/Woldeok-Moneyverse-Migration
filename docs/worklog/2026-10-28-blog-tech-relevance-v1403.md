# v2026.10.28.1403 — TECH blog relevance and evidence remediation

**BEFORE WORK — 2026-10-28 KST.** Dedicated task branch `fix/blog-tech-relevance-v1403-20261028` from `origin/main` `656a89947f2261c12de20d4612e88f251ba6c6a6`. User approved implementation following v1380 plan (GitHub #1591 / PR #1592). Source review: `docs/planning/INTEGRATED_PLANNING_MASTER.md` and `.ko.md`, `docs/planning/AI_BLOG_EDITORIAL_PUBLICATION_ENGINE_SPEC_v2026.10.20.975.md`, v1107/v1108 policies, `docs/RELEASING.md`, `AGENTS.md` and live source. Co-worker v1102 legacy 503 publication gate is **already on main**, and must remain intact. Separate branch and no other worktree changes.

- [x] BEFORE WORK: inspect canonical docs and latest main, record screenshot-to-source root causes; confirm current v1102 publishing hold.
- [x] IN PROGRESS: targeted TECH-only rendering and topic-specific verifiable engineering drafts; no unrelated compound widget or finance CTA; eliminate invented tech statistics and synthetic page views; add unit/SSR regressions.
- [x] MIDPOINT: refetch main and inspect code overlap. Preserve v1108 no automatic unpublication and no direct file-publishing reactivation.
- [ ] FINISHED: tests and checks with exact SHA, push independent branch/PR, examine official Test and Production gates. Report incomplete stages truthfully.

Publication, DB, ledger, Test and Production untouched before this work. Existing public posts remain unchanged without an editor-authorized correction.


## Midpoint — 2026-10-28 KST

Fetched remote main repeatedly: advanced from initial 656a8994 to 004be593. Main added a 7,000+ character categoryDeepDives block into blog-data.ts. We reconciled only TECH behavior with it: finance category text was retained on main, while TECH now selects an independent reviewed engineering body. Existing main v1102 503 publisher hold is preserved. Frontend contract dependencies were built in the isolated workspace after removing workspace-external node_modules symlinks that Turbopack refused.

**Local verification (branch source candidate):** targeted 20/20 PASS, whole frontend 328/328 test files and 1,686/1,686 PASS; typecheck, edited-file ESLint, contract package build, Next.js production build PASS. No DB or actual post writes occurred. Waiting for exact-SHA GitHub integration, official Test backend/API/DB/authentication and Production release gate evidence.
