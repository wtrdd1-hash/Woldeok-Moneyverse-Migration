# App gateway, gallery detail, and board image upload

Date: 2026-09-07  
Branch: `fix/app-gateway-20260907`

## Requested work

- [x] Start a dedicated branch/worktree from current `origin/main` without touching unrelated local changes.
- [x] Add an app-facing Gateway/BFF boundary without exposing `INTERNAL_API_TOKEN` to native clients.
- [x] Make published gallery cards open a dedicated detail page.
- [x] Allow a signed-in member to attach an image to a board post.
- [x] Render the board image on the post detail page.
- [x] Add regression tests for the new access boundaries and UI behavior.
- [ ] Run typecheck/tests/build and database migration validation in CI.
- [ ] Deploy to test, verify, then deploy the validated revision to production.

## Progress log

### In progress

The app Gateway route exists under `/app-api/v1/...` and forwards only explicitly allowed member-facing API groups. Admin and Discord integration paths are not in the allowlist. Gallery cards now link to `/gallery/[photoId]`. Board posts accept one PNG/JPEG/WebP image up to 4MB plus required alt text; the bytes use the existing validated private image store. Migration 173 adds the board image metadata and a SECURITY DEFINER visibility check, and `/media/board/[key]` only relays bytes after the signed-in viewer passes that database check.

### Validation so far

- App Gateway allowlist unit tests: 4/4 passed.
- Board service unit tests: 9/9 passed, including private board-image path and malformed-key refusal.
- Frontend Gateway/media targeted tests: 9/9 passed, including the authenticated board-image relay.
- Workspace typecheck: passed under Node 24.
- ESLint: 0 errors; 11 existing/new `<img>` optimization warnings remain.

- Full local workspace test run: contract 23/23, database migration parity 6/6, backend 818 passed with 343 database-backed tests skipped because no `DATABASE_URL` was supplied to the isolated container, frontend 523/523.
- Production build: contract/database/backend/frontend all built successfully; Next compiled successfully and emitted `/gallery/[photoId]`, `/media/board/[key]`, and `/app-api/v1/[...path]`.
- Database migration 173 still requires CI/PostgreSQL execution before it can be called validated.
