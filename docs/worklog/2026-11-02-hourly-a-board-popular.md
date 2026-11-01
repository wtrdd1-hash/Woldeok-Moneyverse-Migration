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

## FINISHED
- Pending verification; no release approval.

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
