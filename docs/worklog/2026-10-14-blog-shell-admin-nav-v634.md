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

- [ ] Add failing regression coverage for one shell per blog route and discoverable admin blog tab.
- [ ] Remove page-local shells and register admin navigation without changing the shared root layout.
- [ ] Run focused frontend tests, lint/typecheck/build gate where feasible, and inspect live/Test status.
- [ ] Re-fetch `origin/main`, document versioned change details and explicit deployment state.

## In progress

Pending implementation and verification.

## Finished

Not completed yet. No Test or Production promotion claimed.
