# Discord broadcast gateway P0 authorization — implementation plan
**Date:** 2026-11-02
**Scope:** bounded security correction, no schema or financial changes.
**Design:** Keep two legitimate ingress modes: a server-to-server request bearing a configured strong internal secret, and a same-origin authenticated administrator browser request. Neither mode may rely on a hardcoded fallback. Reject invalid/unbounded payloads and never claim delivery without a valid bot receipt. Preserve bot loopback transport and existing caller payload fields. If no secure secret is configured, only same-origin admin browser requests can proceed and upstream dispatch is blocked until the bot transport is configured; do not silently substitute a known credential.
1. Test: create route tests for no configured secret, spoofed default credential, cross-origin admin, malformed payload, failed/malformed bot receipt, and accepted configured internal and same-origin administrator paths.
2. RED: execute focused vitest and record the expected failing assertions.
3. Implement: secure gateway validation and truthful response mapping, preserving existing API surface.
4. GREEN: execute focused tests, frontend typecheck, relevant integration tests.
5. Verify: full lint, typecheck, build, unit, contract, real PostgreSQL, security, app-api and browser E2E if available; record failures as blockers.
6. Re-fetch origin/main mid-work and before any merge; publish draft PR, preserve all other branches. No production deployment until full release gate.
