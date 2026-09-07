# App gateway, gallery detail, and board image upload

Date: 2026-09-07  
Branch: `fix/app-gateway-20260907`

## Requested work

- [x] Start a dedicated branch/worktree from current `origin/main` without touching unrelated local changes.
- [x] Add an app-facing Gateway/BFF boundary without exposing `INTERNAL_API_TOKEN` to native clients.
- [ ] Make published gallery cards open a dedicated detail page.
- [ ] Allow a signed-in member to attach an image to a board post.
- [ ] Render the board image on the post detail page.
- [ ] Add regression tests for the new access boundaries and UI behavior.
- [ ] Run typecheck/tests/build and database migration validation in CI.
- [ ] Deploy to test, verify, then deploy the validated revision to production.

## Progress log

### In progress

The app Gateway route exists under `/app-api/v1/...` and forwards only explicitly allowed member-facing API groups. Admin and Discord integration paths are not in the allowlist. The next implementation block adds gallery detail navigation and a private, members-only board-image path backed by the existing validated image storage.

### Validation so far

- App Gateway allowlist unit tests: 4/4 passed.
- A full frontend test invocation reached 503 passing tests before failing because the shared contract package had not been built in that isolated container run. Re-running after building the contract is required before completion.
