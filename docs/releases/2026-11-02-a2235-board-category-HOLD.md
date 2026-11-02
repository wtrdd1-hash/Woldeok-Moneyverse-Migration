# A2235 Release Decision — HOLD

Candidate: `auto/hourly-a-20261102-2235-board-category`, based on main `3accc3a739ab18096638968127fa3656316f7f57`. No production/test mutation.

BLOCKERS: live app-role destructive ACL/default grants P0; Production locale HTTP500 P0; full workspace audit 9 advisories; exact candidate official isolated Test and authenticated E2E not certified; off-host restore and GitOps release approval absent. Main CI failed at run 41454250092 (baseline).

Rollback design: no schema changes, remove feature via reverting candidate commit / closing PR; no running release to roll back. Preserve all unrelated PRs and unique commits. No promotion authorized.
