# v2026.09.15.101 — Deterministic API contract gate

## Summary

The production promotion gate was blocked after dependency consolidation because TypeScript-generated internal symbol names in the mobile API contract changed numeric suffixes even though the public API shape did not change.

## Changes

- Added a deterministic API contract checker.
- Normalizes only compiler-internal symbol suffixes such as `__@toStringTag@716` before baseline comparison.
- Preserves failure behavior for every other API contract difference.
- Keeps API contract generation unchanged and continues to require generated artifacts to match the committed baseline semantically.

## Validation target

`lint`, `typecheck`, `build`, database migrations, API contract check, tests, candidate image build, Test deployment observation, then Production promotion.

Korean: [2026-09-15-api-contract-determinism-v2026.09.15.101.ko.md](2026-09-15-api-contract-determinism-v2026.09.15.101.ko.md)
