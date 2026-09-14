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

Pending in this commit: local CI-equivalent checks, branch Test Candidate build, isolated test exact-SHA/backend smoke, then Production promotion and post-deploy smoke.
