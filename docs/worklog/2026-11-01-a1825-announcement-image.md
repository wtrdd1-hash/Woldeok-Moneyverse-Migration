# A 18:25 — Published announcement image-only discovery (worklog)

## BEFORE WORK
- Main SHA: 1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0 (fetched at start); isolated branch: auto/hourly-a-20261101-1825-announcement-image; separate worktree: /srv/moneyverse-data/tasks/mv-a-20261101-1825-announcement-image/repo.
- Scope: P1 read-only filter for image-attached notices among the latest 20 already-published announcements, across Nest API, PostgreSQL function read, browser and Android gateway. No migration or WLD writes.
- Existing Draft #2347 filters publication day and Draft #2272 filters pinned notices. Keep both untouched; overlapping announcement files require review before merge.
- Safety: reject duplicate/unknown filter parameters, fail closed on unverifiable Android 200, noindex/no-store for filtered results. Preserve default public SSR and published-only DB boundary.
- Plan: [ ] write failing tests [ ] implement API/DB read [ ] implement web [ ] implement Android verification [ ] verify full gates [ ] audit and release decision.

## IN PROGRESS
- Worktree initialized, no main checkout edits. Production and Test unchanged.

### RED checkpoint
- Backend three new tests failed as expected; frontend/Android ten new tests failed as expected (missing parser, unsupported filter, no Android validation). Logs: task/evidence/backend-red.log and frontend-red.log.
- Revised Android path to existing `/app-api/v1/content/announcements` (not unregistered `/announcements`) and added app content controller coverage before implementation.
