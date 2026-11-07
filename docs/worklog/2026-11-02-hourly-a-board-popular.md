# Development A — Most-discussed recent public board posts

## BEFORE WORK — 2026-11-02 02:25 KST
- Independent branch: `auto/hourly-a-20261102-0225-board-popular`; baseline origin/main: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated master, recent QA, open PRs and CI. Planning v1628 remains a separate draft, not main authority.
- Feature: verified most-replied ordering of the **latest 50** public board posts, preserving stock and title search, without a new DB grant, migration or financial write.
- Avoid other teams' backend banking, frontend account/profile, and planning changes. Existing A board PRs (#2393, #2399, #2407, #2411) may conflict; protect their commits.
- Required: TDD, Nest/SQL/Next/Android app-api contract, real PostgreSQL read, build/lint/typecheck/unit/CI, Test exact SHA and release HOLD until gates pass.
- State: BEFORE WORK; no production/Test mutation permitted.

## IN PROGRESS
- Pending implementation and evidence.

## FINISHED IMPLEMENTATION / RELEASE HOLD — 02:38 KST
- Implemented and pushed the full Nest/Next/SQL/Android contract feature, plus a second SEO edge fix. Code SHA `94ae1f160c928ad05bbe61c6ab022cb20ba28e27`; final documentation SHA to be recorded in PR.
- Full first-code gates: backend 2,988 PASS/518 SKIP; frontend 2,940 PASS; database 62 PASS/5 SKIP; typecheck, lint (0 errors/1,027 warnings), backend/frontend builds, Android 184-endpoint contract and security scripts 11 PASS. Second-code UI/Android regression 10 PASS. All-dependency audit 9 findings FAIL; production audit 0 known.
- DEV PostgreSQL read-only proof and P0 ACL recorded in issue #993; dev-toolchain findings in #1075. Exact-SHA official Test preflight FAIL; Production HOLD. See docs/qa/2026-11-02-a0225-board-popular.md and docs/releases/v2026.11.02-a0225-board-popular-hold.md.
- Final exact-SHA full gates and GitHub CI must be rerun after the documentation commit; no merge or deployment until all independent gates PASS. No branch deletion, rollback or scheduled-task changes.

### IN PROGRESS — 02:27 KST
- RED reproduced: backend 3 failing new assertions; frontend 7 failing new assertions. Baseline backend 15/15 PASS.
- GREEN: backend 23/23 and frontend 18/18 targeted tests PASS after implementation.
- Full workspace typecheck PASS; changed-file lint PASS; Android contract regenerated and contains conditional `appliedSort` proof.
- `origin/main` re-fetched at midpoint and remained `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- SQL orders **after** the existing 50-row PostgreSQL `SECURITY DEFINER` function, with no direct table access or new migration.
- Initial remote audit: 168 remote heads including main; 152 open PRs. No branch deletion; other authors' unique commits protected.
- Full tests, real DB proof, security, exact-SHA CI and release gates remain pending. Draft/HOLD only.

### IN PROGRESS — 02:35 KST (second code revision)
- First full backend suite 2,988 PASS/518 SKIP; first full frontend suite 2,940 PASS; database suite 62 PASS/5 SKIP. These ran on the first code revision and are **not** evidence for the later revision until rerun.
- Accessibility/SEO regression test caught a real gap: the app-api HTTP edge only marked `q` responses noindex/no-store, not `sort=popular`. RED 1/2; fixed the edge and removed a duplicated legacy guard; GREEN 10/10 UI+Android tests.
- Updated curated Android query contract: optional `stock`/`q`/`sort=popular` (previous stock incorrectly marked required), regenerated English/Korean schema references.
- Actual DEV PostgreSQL read-only app-role proof: EXECUTE=true, 1 latest public row, 0 replies, monotone query true; app direct UPDATE on `account_balances` and DELETE on `user_items` still true (P0 #993). No actual multi-row positive ranking proof.
- No Test/Production changes, no branch cleanup. Full final-SHA gates and CI still required.

### REPAIR — 02:42 KST (native GET default sort)
- Review found the HTML `<select name="sort">` always submits its default option. The initial empty value was rejected by Nest; switching to `recent` alone would still be rejected. New RED: backend 1 FAIL and frontend 3 FAIL.
- Accepted explicit `sort=recent` (legacy newest-first behavior) without a popular proof marker, kept strict `sort=popular` verification, updated Android query enum and accessible form default. GREEN backend 23 PASS and frontend 22 PASS.
- Stopped only the superseded A final-gate process tree; no other agents' processes were touched. The earlier exact-SHA run is invalidated. Final new-SHA full gates and CI must run before any completion claim.

### REPAIR — 02:45 KST (native GET blank title search)
- Further end-to-end form review found that the always-present `name="q"` input sends `q=` when blank. The existing Next title parser rejected this, so selecting popular sort without typing a title could not reach the API. RED frontend 1 failure.
- Normalize blank or whitespace-only form search to no title filter **at the Next boundary**; preserve strict backend/API rejection of explicitly invalid empty q. GREEN 28 board title/SEO/Android tests.
- Stopped only superseded A final2 gate processes. New exact-SHA full tests and CI must be rerun. No other reservation/process touched.
