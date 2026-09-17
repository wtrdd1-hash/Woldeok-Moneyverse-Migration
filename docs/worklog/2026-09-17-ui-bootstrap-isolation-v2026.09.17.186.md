# Internal Worklog — v2026.09.17.186 UI Bootstrap isolation

- Date: 2026-09-17
- Branch: `fix/ui-bootstrap-collision-v2026.09.17.186`
- Exact base: `17801cab463e9c93490b3f93f03c719f95896cb0`
- Scope: frontend global-style isolation + regression coverage; no backend/DB change.

## Root cause

The v175 shell imported the entire Bootstrap 5.3.8 stylesheet globally. Bootstrap generic utilities such as `.bg-primary`, `.text-primary`, and `.border-primary` use `!important` and collide with the product's Tailwind semantic utility names. That forces Bootstrap blue/default utility styling onto product controls and cards.

## Fix

- Removed the global Bootstrap stylesheet import from `frontend/src/app/layout.tsx`.
- Retained the downloaded vendor CSS under `frontend/src/styles/vendor/`; no external CDN dependency was introduced.
- Added `ui-style-isolation.test.ts` to prevent a future global Bootstrap re-import and verify product global-style ordering.

## Local QA

- Contract build: PASS.
- ESLint on changed runtime/test files: PASS.
- Frontend typecheck: PASS.
- Frontend Vitest: 69 files / 616 tests PASS.
- Next.js production build: PASS.
- Isolated Test, merge, Production promotion and Production smoke are release gates, not yet claimed by this pre-release record.
