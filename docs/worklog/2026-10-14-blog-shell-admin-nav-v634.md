# v2026.10.14.634 — Blog shell duplication and admin navigation

## Before work — 2026-10-14 22:13 KST

- Scope: the user-supplied blog article screenshot shows two identical site headers and ticker strips, with a Chinese nav over Korean content. The previously requested blog-management nav link is missing.
- Authority checked: `AGENTS.md`, `DOCS_INDEX.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md` and `.ko.md`, `PROJECT_MEMORY.md`, and current source.
- Baseline: `origin/main` SHA recorded by task branch; compare again mid-task. Production currently points to `prod-v600` and Test to `test-v618-7fa3f245bbc3`; neither equals latest main.
- Root cause in source: `app/layout.tsx` wraps `children` in `SiteShell`, but `blog/page.tsx`, `blog/[slug]/page.tsx`, and `admin/blog/page.tsx` independently add nested `SiteShell` wrappers.
- GeoIP source remains present; new visitors receiving `CF-IPCountry: KR` receive `wdmv_detected_locale=ko` in a live header probe. An isolated concurrent branch `fix/geo-locale-first-render-v2026.10.14.631` already covers first-render localization, so this change will not touch locale logic.
- Admin management route `/admin/blog` exists, but its link is absent from `ADMIN_TABS`.
- Safety: no database, balances, feature switches, passwords, Test/Production symlink, or active services modified in this task.

## Plan / checks

- [x] Add failing regression coverage for one shell per blog route and discoverable admin blog tab.
- [x] Remove page-local shells and register admin navigation without changing the shared root layout.
- [ ] Run focused frontend tests, lint/typecheck/build gate where feasible, and inspect live/Test status.
- [ ] Re-fetch `origin/main`, document versioned change details and explicit deployment state.

## In progress — 2026-10-14 22:15–22:28 KST

- Starting `origin/main` exact SHA: `28bd1e85e6c85094c00197f65bfd18fd2f44f7a5`. Mid-work `git fetch origin main` still resolves to that SHA. No rebasing or concurrent work was overwritten.
- Red stage: shell and admin menu assertions failed. Admin-page authorization assertion also failed before remediation.
- Implemented the smallest scoped source changes, retaining root `SiteShell` ownership. Added server-side `requireAdminConsole` rather than only hiding the tab.
- Existing blog generation suite failed (1/5) because its jsdom runner externalizes the Node filesystem module. Do not run the real `POST /api/blog/generate` against shared storage as part of a smoke test; a new isolation plan is required.
- An initial isolated build failed because external node_modules symlinks are incompatible with Turbopack; a second build failed because the contract package had not been compiled. Reinstalled the exact lockfile offline and built contract first; the third build passed.
- New regression tests: 3/3 passed. Targeted lint, frontend TypeScript and optimized frontend build passed. Separate frontend HTML smoke proved exactly one `.moneyverse-app-shell` element; Test backend health 200.
- Running an isolated candidate with the real Test frontend environment was permission-blocked. A deliberately invalid token is not suitable for an administrator-authorization acceptance test, so no claim of negative E2E acceptance is made.

## Finished — candidate stage, 2026-10-14

- [x] Captured before-work documentation and exact Git main checkpoint.
- [x] Isolated worktree/branch and pushed the pre-implementation red tests and log.
- [x] Fixed three duplicate-shared-shell routes.
- [x] Added administrator blog tab and server-side console authorization with `noindex` metadata.
- [x] Verified three new regression tests, TypeScript, targeted ESLint and production build.
- [x] Recorded Test backend health and isolated guest blog HTML smoke.
- [x] Wrote English GitHub and Korean internal release notes for v634.
- [ ] Fix and safely isolate existing blog-generation test; validate authorized and unauthorized Test administrator sessions.
- [ ] Integrate branch into fresh main, run exact-merged-SHA isolated Test, then perform zero-downtime Production promotion under `docs/RELEASING.md`.

**Deployment state:** candidate branch only; no Test or Production promotion, no database writes, no Production symlink or active service changes. Unverified security and Test gates block Production promotion.

## Concurrent-main reconciliation and CI follow-up — 2026-10-14 22:37–22:40 KST

- Mid-work `origin/main` advanced from `28bd1e85e6c85094c00197f65bfd18fd2f44f7a5` to `2465fcf710c06c07ef9de2e0d1f7bb0fc1061f3e` (v225 macro/monetary blog update). The changes touched blog client/data but not this task's page/layout/nav paths. Rebasing the three task commits succeeded without conflicts. All subsequent checks are against the rebased tree.
- First PR verification run failed at `pnpm api:contract:check` due already-stale generated API schema artifacts. Regenerated `docs/mobile-api-contract.json` and the EN/KO schema references (adds `local_email` identity provider and stable dice enumeration ordering) in a separate commit. Exact-tree `pnpm api:contract:check` now passes.
- Rebased check: new regression tests 3/3 passed, TypeScript passed and optimized Next.js build passed.
- An isolated Test-configured frontend process was launched transiently on loopback with existing Test environment files, without changing the `test-main-*` services. Guest `/blog/[slug]` returned HTTP 200, and the anonymous `/admin/blog` render emitted a Next redirect meta tag to `/login?error=login_required`. No administrative body was intentionally accessed; a real authenticated/open-console acceptance is still pending.
- PR #838 remains draft while GitHub CI, account-based authorization checks, and exact-main Test acceptance are outstanding. Production promotion is blocked.
