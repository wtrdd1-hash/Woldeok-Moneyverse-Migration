# 2026-09-14 — All-branch integration v2026.09.14.83

## Scope

Integrated active development branches against the refreshed `main` baseline without force-pushing `main`.

## Integration decisions

- Used `integrate/stock-comparison-next-v2026.09.14.82` as the cumulative stock implementation.
- Preserved newer `main` authentication documentation/code where the old auth-simplify branch conflicted; its password-policy behavior already existed in `main`.
- Merged the cross-browser email verification migration and frontend/backend flow.
- Verified the mobile business catalog compatibility commit was already contained by the refreshed `main` baseline.
- Added the guarded auto-integrate/promotion workflow.
- Replayed the stock-detail v2026.09.14.75 documentation resync commit so no predecessor-only patch remains omitted.

## Validation and deployment

Local CI-equivalent validation passed: lint (0 errors, 11 existing image-optimization warnings), typecheck, tests (backend 856 passed / 354 DB-dependent skipped, frontend 575 passed, database 7 passed), and production build. The first test run exposed a duplicate migration number: the new email verification migration collided with existing migration 185, so the new migration was renumbered to 186 and the full gate was rerun successfully. Next: GitHub Test Candidate, isolated test exact-SHA/backend smoke, Production promotion, and post-deploy smoke.
