# v2026.09.23.396 — Mandatory session continuity across restart/update

- Raised authoritative EN/KO `PROJECT_PLAN` and integrated planning ledger from v388 to v396.
- Added P0 release invariant that deployment/restart/update alone must never force logout of a still-valid user session.
- Added shared/durable session authority, signing-key overlap, cookie/schema compatibility, authenticated continuity sampling, telemetry, fail/rollback, and automated Test regression requirements.
- Explicitly separated legitimate security/user/admin/expiry session revocation from prohibited deployment-caused blanket invalidation.
- Planning/docs only; no Test or Production deployment is claimed.
