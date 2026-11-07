# Release gate — public board stock-symbol order (HOLD)

- Candidate branch: `auto/hourly-a-20261103-0129-board-symbol-sort`; source main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; code SHA `5abe3792d80e5f11db4dc80cc0f0d15355a3cbea`.
- Local: focused tests, API contract, typecheck, builds PASS. Full frontend 2,951 PASS on pre-final-code SHA; backend 2 known HTTP FAIL. Full audit 9 vulnerabilities; DEV app-role DML least privilege FAIL; real multi-post PG and exact-SHA Test E2E BLOCKED.
- Official Test `0c70a114da5f4cc5374bc4b80e0403a044f8546f`; Production `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`. Neither is this candidate.
- Required to release: fix and rerun all failing checks at exact candidate SHA; independent PostgreSQL, authenticated owner/user E2E, Android parity, security/accessibility/SEO, backup restore, provenance, Test smoke/login/version/DB, GitOps gate. Do not merge/promote on partial PASS.
- Rollback: no runtime was changed, so no rollback executed. If later deployed, revert the new sorting contract through a reviewed main commit and redeploy exact verified image; never alter applied migrations or balances. Preserve all 285 unique unmerged branch tips; no deletion.

**Decision: HOLD / no merge / no Test or Production deployment.**
