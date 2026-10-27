# Profile image revocation cache integrity (A, 2026-10-27 20:56 KST)

## Scope and options
The authoritative profile-image SQL checks the viewer and current visibility for every request. However, the media controller and browser relay permit private 300-second caching, which can bypass that live check after an owner revokes visibility. The Android app API forwards cacheable upstream media responses. Option A: purge CDN only (insufficient for browser caches). Option B: change the image key on every visibility update (requires a new applied-migration-sensitive write path). Selected C: never store profile image bytes at any backend, browser or Android gateway boundary. Existing browser caches cannot be remotely invalidated; the fix prevents subsequent responses from extending the window.

## Work units
1. Capture RED tests for success/denial/cacheable-upstream cases across Nest image route, Next browser relay, Android gateway.
2. Add minimal private,no-store response policy at all three boundaries without weakening SQL visibility, authentication or session semantics.
3. Run GREEN, typecheck, lint, unit, build, API contract, real isolated PostgreSQL image visibility/ACL tests and security audit.
4. Refresh latest main/planning at mid and integration preflight; Draft/HOLD PR only. No migration changes or deployment without exact-SHA Test + GitOps proof.
