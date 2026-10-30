# Release HOLD — Collection provenance quarantine A 2026-10-30 06:53

Candidate is a Draft PR only, not a released version. All prior historical collection rows and migration checksums remain unchanged. New migration 306 must be reviewed and tested under least-privilege migrator before any integration.

**Gates:** targeted backend/frontend/Android PASS; isolated real PostgreSQL PASS; typecheck PASS; full lint FAIL; full backend tests FAIL; frontend build FAIL (ENOSPC); full CI, authenticated official Test, off-host restore, immutable image and GitOps authorization not proven. **Do not merge or deploy.**

**Rollback if ever approved and deployed:** disable collection UI/API mutation and provenance presentation at application release level; keep existing historical rows and applied 306 immutable; revert only application image via reviewed GitOps. Never delete historical member rows or edit an applied migration.

Test and Production were checked read-only on 2026-10-30 07:17 KST: both `/health` 200 and `/api/version` `c2129625aa6629c616fb31ce790950618b8d92b2`. The candidate is not deployed. Host data disk `/srv/moneyverse-data` reached 100% during standalone build; only this worktree's generated `.next` was removed. This is an independent P0 release-blocking storage condition.
