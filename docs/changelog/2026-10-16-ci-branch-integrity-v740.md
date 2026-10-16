# v2026.10.16.740 — CI and branch-integration safeguards

**Category:** CONTROL_PLANE_ONLY candidate; **Production:** BLOCKED.

- Fixed false failure for no-delta candidate branch refs; an exact `NO_CHANGES` event never starts image creation or production dispatch.
- Replaced automatic per-branch GitHub queries with open PR head enumeration.
- Replaced repeated cleanup API queries with batched merged/open PR evidence, local main ancestry and lease-checked deletion.
- Added regression coverage for no-op CI, no unintended deployment and rate-limited cleanup.

[Worklog and live gate](../worklog/2026-10-16-branch-ci-production-audit-v740.md).
