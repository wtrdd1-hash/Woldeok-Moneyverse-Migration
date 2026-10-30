# A0546 release gate — HOLD
Candidate: P1 public stock-linked board category filter. No new migration, financial posting, permissions, or feature-switch changes.
All local quality suites, isolated PostgreSQL schema/ACL/rollback and dependency audit passed, but official Test exact-SHA E2E, independent restore, production executable lineage and security #993 are unverified or open. Main merge and GitOps promotion forbidden until full independent release proof. Rollback: revert this feature commit; no database rollback needed. No Test/Production deploy or restart performed.
