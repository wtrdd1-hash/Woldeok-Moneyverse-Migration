# v2026.09.17.172 — Local Bootstrap UI polish

## Summary
- Added Bootstrap 5.3.8 as a local frontend dependency; no Bootstrap CDN is required at runtime.
- Preserved the upstream compiled distribution archive on the secondary data drive at `/srv/moneyverse-data/vendor/bootstrap/5.3.8/`.
- Improved shared page shell, cards, and buttons with restrained elevation, focus treatment, responsive spacing, and reduced-motion support.
- Kept existing Moneyverse palette, theme tokens, Korean typography, and dark mode authoritative.

## Verification
- Bootstrap source reference: getbootstrap.kr v5.3.8 download documentation.
- Archived ZIP SHA-256: `3258c873cbcb1e2d81f4374afea2ea6437d9eee9077041073fd81dd579c5ba6b`.
- `git diff --check`: pass.
- Frontend typecheck: pass after building the workspace contract package.
- Frontend tests: 68 files / 614 tests passed.
- Next.js production build: pass.

## Release
- Branch: `feat/local-bootstrap-ui-v2026.09.17.172`.
- Test/Production promotion follows the repository exact-SHA release gates; runtime evidence is recorded separately.
