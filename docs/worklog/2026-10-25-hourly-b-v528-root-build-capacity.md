# Development B v528 — fail-closed miniPC build-capacity preflight (HOLD)

**Date:** 2026-10-25 KST. **Severity:** P0 operational availability, issue #1170.
**Start/main:** `c9a868b1e622341e2daa8b936ddf0988eda9988e` (confirmed unchanged at mid-cycle).
**Branch:** `auto/hourly-b-root-build-preflight-v528-20261025-1040`.

## Defect and scope

QA v1265 reports `/` at 100% with ~368 MiB usable, while `/srv/moneyverse-data` has ~93 GiB free. Full builds on the host risk ENOSPC and interruption of concurrent developers and running services. Existing `ops/storage/dual-disk-check.mjs` was informational unless manually invoked; top-level `pnpm build` had no capacity gate. This is not evidence of a current outage.

## Code / contract

- New `ops/storage/build-preflight.mjs` is read-only, without cleanup, force, migration or deployment operations.
- Before top-level `pnpm build`, verify distinct root/data devices, working directory on the data volume, root occupancy below 90%, at least 2 GiB available on root, and 8 GiB available on data. Warn at 85% root usage.
- On miniPC hostname `debian13`, missing data volume fails closed; CI and unrelated hosts without this volume do not claim miniPC capacity certification. `MONEYVERSE_REQUIRE_HOST_PREFLIGHT=1` enforces missing-mount rejection.
- `package.json` now runs the preflight before the existing recursive build.
- New pure-function regression tests cover healthy/critical/low-free/shared-device/root-worktree/malformed/missing-mount cases and script wiring.
- **API/DB/ledger:** no schema, migration, route, financial transaction, privilege or auth changes.

## Verification

- TDD RED: missing preflight implementation, then missing miniPC mount fail-closed helper.
- `node --test ops/storage/build-preflight.test.mjs ops/storage/dual-disk-check.test.mjs`: **13/13 PASS**.
- `node --test scripts/release/verify-main-required-checks.test.mjs scripts/qa/e2e-certification.test.mjs`: **5/5 PASS**.
- `node ops/storage/build-preflight.mjs`: **expected BLOCKED_BUILD_CAPACITY** on actual host (root 100%, ~0.36 GiB free).
- `pnpm build`: **expected BLOCKED**, exits before expensive recursive build; **not** a successful build.
- Node syntax checks: PASS. Full lint/typecheck/unit/integration/real PostgreSQL/security/app-api/E2E/official Test exact-SHA: **NOT PASS / NOT EXECUTED**; root pressure and existing QA blockers persist.

## Limitations and release decision

This guard protects the repository's **top-level build entrypoint only**. Direct package builds, Docker builds, and external automation must adopt equivalent capacity checks; it does not free storage or prove a healthy host. No unauthorized cleanup of other worker worktrees, Docker volumes or logs. QA v1265 additionally reports dev DB broad DML/PUBLIC EXECUTE, migration 266 checksum mismatch, migration 280 collisions, and incomplete release gates. Keep this PR **Draft**; no main merge, Test or Production promotion without required exact-SHA checks, QA, security and authorized GitOps.
