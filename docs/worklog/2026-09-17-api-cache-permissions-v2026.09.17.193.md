# Internal Worklog — v2026.09.17.193 API cache runtime permissions

- Date: 2026-09-17
- Branch: `fix/frontend-api-cache-permissions-v2026.09.17.193`
- Exact base: `5d5826b21a9e4ae98fd0dcbe771d57fa8c674c84`
- Scope: Production Next.js server cache writability and API-derived page freshness; no backend/DB change.

## Reproduction

- Production backend `/health` is HTTP 200 and the public Next BFF endpoints return JSON normally.
- Public `/api/v1/*` is intentionally not routed to NestJS; only the documented edge exceptions are public.
- Production frontend logs repeatedly report `EACCES` while updating `.next/cache/fetch-cache`.
- Production `.next/cache` is `root:root` while `moneyverse-frontend.service` runs as `debian`.
- Test `.next/cache` is already `debian:debian` and does not show the same error.

## Fix contract

- Add a host-mirror helper that changes ownership only for `.next/cache`, never the immutable application tree.
- Reject release paths outside the configured releases root.
- Verify actual write access as the runtime user before a release is considered ready.
- Run the helper on Test first, then Production without restarting backend or modifying the database.
- Add EN/KO deployment procedure and release/update evidence.

## Test evidence

- Helper regression test: PASS, including outside-release-root rejection.
- Test cache preparation: PASS; `.next/cache` and `fetch-cache` remain `debian:debian`.
- Direct Test backend `/health`: HTTP 200. Public Test `/health` and `/api/viewer`: HTTP 200.
- Test `/status`, `/announcements`, and `/shop`: HTTP 200 after revalidation requests.
- No new Test frontend `EACCES`/prerender-cache errors and no new Test backend fatal/database errors in the verification window.
- Mid-work recheck: `main` advanced to `5d5826b21a9e4ae98fd0dcbe771d57fa8c674c84`; v194 explicitly reserves v193 for this parallel frontend API/cache task, so this branch was rebased before commit.
