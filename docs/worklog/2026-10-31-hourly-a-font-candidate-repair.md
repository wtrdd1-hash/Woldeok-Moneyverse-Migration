# A 08:25 — Candidate frontend font build repair

## Before work
- Source: issue #2107, clean Alpine candidate image failure.
- Base: `761a55a094fb9dd383d213e817305e68c79fa23c`; branch: `auto/hourly-a-20261031-0825-font-candidate-repair`.
- Scope: release-image reliability; do not change money, auth, migrations, runtime services or other branches.
- Status: root-cause investigation; tests and release pending.

## Plan
- [ ] Reproduce candidate image failure and isolate font loader cause.
- [ ] Add a failing regression check, implement minimal fix, rerun check.
- [ ] Run exact-SHA full gates, independent image build, official Test E2E if eligible.
- [ ] Recheck latest main, update QA/Release HOLD, create draft PR if code verified.

## In progress
- RED: 4 failed / 1 passed (layout Google font and missing local CSS), see host report.
- Root-cause boundary: clean Alpine Next 16.4.2 loader `loader.js:122` assumes a filename extension in live Google CSS URL; null regex match caused TypeError, despite local Webpack build PASS.
- Fix direction: pin Fontsource CSS and files to pnpm lockfile, no live Google CSS parsing in candidate build.
- GREEN: 5/5 font regression tests pass; Fontsource pinned in package lockfile; no Google CSS in layout.
- Clean `docker build --no-cache --target build` PASS: Next Webpack compiled and image exported; 512 generated static media files; no runtime service touched.
- Full lint: PASS (0 errors, 1,049 warnings). Initial typecheck failed because filtered pnpm install omitted DB node types; full frozen workspace install and repeat typecheck PASS.
- Full backend/frontend/DB tests and exact-SHA CI pending. Release remains HOLD; no Test/Production action.
