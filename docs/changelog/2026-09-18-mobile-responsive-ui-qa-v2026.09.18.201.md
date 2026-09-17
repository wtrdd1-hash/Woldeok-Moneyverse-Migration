# v2026.09.18.201 — Mobile-responsive UI QA and overflow hardening

- Date: 2026-09-18
- Branch: `fix/ui-responsive-qa-v2026.09.18.201`
- Scope: frontend UI only; no database migration or backend/API contract change

## Changes

- Made the right-side mobile menu width viewport-safe instead of fixed at 320 px.
- Changed the five-item mobile bottom navigation to equal-width grid columns with shrinkable labels and a 44 px minimum touch height.
- Made banking card headers, deposit/withdraw controls, repayment actions, and debt summaries stack or wrap on narrow phones.
- Made banking summary cards single-column below 480 px and allowed footer actions to wrap.
- Removed fixed minimum widths from inventory quick slots and allowed the active-cosmetics profile row to shrink safely.
- Added a regression test for these mobile overflow contracts.

## Verification before Test promotion

- `pnpm lint`: 0 errors; 11 pre-existing `next/no-img-element` warnings.
- `pnpm typecheck`: passed for contract, database, backend, and frontend workspaces.
- Frontend tests: 70 files / 619 tests passed.
- Frontend Production build: passed.
- Headless Chromium: 320, 360, and 390 px × 7 public routes = 21/21 HTTP 200 renders with no document-level horizontal overflow.
- Gallery logs an existing Google ad-quality `sodar2.js` CSP rejection; this release leaves that separate issue unchanged.

## Release gate

Exact-SHA Test backend/API/frontend smoke is required before Production. Production promotion must preserve the previous release as rollback anchor and use the current Debian systemd authority without an unverified intermediate release.
