# v2026.09.17.186 — UI Bootstrap global-style isolation

- Fixed the mobile/web theme regression caused by globally importing Bootstrap 5.3.8 into the Tailwind semantic utility namespace.
- Removed the global Bootstrap stylesheet import while retaining the local vendor archive; no CDN dependency was added.
- Added regression coverage that keeps Bootstrap quarantined and verifies product global-style ordering.
- No backend, API, database, economy or user-state behavior changes.
- Pre-release QA passed: contract build, changed-file ESLint, frontend typecheck, 69 test files / 616 tests, and Next.js production build.
- Release remains gated on isolated Test frontend/backend/API/noindex verification, exact-main rebuild, zero-downtime Production promotion, and Production smoke.
