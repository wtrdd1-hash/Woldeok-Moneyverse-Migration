# Shop Envelope QA Repair — v2026.09.20.301

Date: 2026-09-20
Branch: `qa/integrate-shop-v2026.09.20.300`
Status: implementation / revalidation

## Scope

Real PostgreSQL QA on PR #590 found two defects in migration 218: inactive or unknown actors could fall through to a foreign-key error instead of the public purchase contract's `22023` validation error, and replay verification referenced a non-existent `shop_purchases.amount` column.

v2026.09.20.301 restores the authoritative actor/quantity validation before the common economic-command claim and reconstructs the replay amount from the persisted `unit_price * quantity` receipt fields. The least-privilege delegate and economic-command privilege boundary remain unchanged.

## QA evidence

- Local lint: 0 errors; 11 existing Next.js image-optimization warnings.
- Local typecheck: passed.
- Local API contract check: passed.
- Local non-DB backend tests: 895 passed / 361 skipped.
- Local frontend tests: 683 passed.
- Local production build: passed.
- PR #590 PostgreSQL 17 migration gate: passed before the test failures.
- PR #590 first real-DB run: 1,470 tests passed and 2 shop catalogue tests failed; both failures are addressed by this repair.
- The new shop economic-command privilege DB test passed in the failing run.

## Promotion policy

The repair is not eligible for main, Test, or Production until the updated exact SHA passes CI including real PostgreSQL tests and the isolated Test candidate verifies backend/API runtime behavior. Production promotion remains zero-downtime through the existing GitOps/Flux release path.
