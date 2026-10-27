# Verified Help Receipt Parity — 2026-10-27 (HOLD)

## Context and defect
The open web article currently trusts a `current:true` status response when article ID, publication time and *only the currentness* of `reviewedUntil` match. If the server's review deadline is shortened after SSR, the client can display the older, later deadline as verified guidance. Public backend/DB status and Android app-api already carry the authoritative deadline; the web must compare it with the SSR article identity, not merely test it is future.

## Implementation (RED → GREEN)
1. Add a failing web component regression: same article ID and publication timestamp but a different server review deadline must never reveal stale body/source/claimed review deadline. Preserve an exact-match positive case and existing withdrawal/expiry cases.
2. Compare canonical parsed review timestamps (milliseconds) to avoid harmless ISO formatting differences; reject malformed, expired and mismatched server receipts.
3. Run focused tests, full frontend tests, backend tests, DB/contract tests, real isolated PostgreSQL, typecheck, lint, build, app-api and CI. Recheck latest main and integration plan before PR. Do not touch applied migrations or live DB.

## Release
Flag remains OFF; do not merge/deploy without full security, exact-SHA official Test authenticated E2E, migration conflict resolution, backup restore and GitOps gates. Preserve all sibling branches.
