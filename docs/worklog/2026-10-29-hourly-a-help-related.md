# A1425 — Verified Related Help (P1) — 2026-10-29

## Status and source of truth
- **Code implemented in isolated branch; RELEASE HOLD.** Base remote main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`, rechecked before, during and after implementation. Existing README, AGENTS, English PROJECT_PLAN/INTEGRATED_PLANNING_MASTER and Korean counterparts reviewed. QA v1366 reviewed.
- Scope: one P1 read-only user feature: up to five related, independently approved and unexpired help articles of the same locale/category on a verified article page. Android `/app-api/v1/help/articles/{locale}/{slug}/related` forwards only this public route and enforces `private, no-store`, including upstream cache-policy errors. No direct table reads, new migrations, privileges, user tracking, ledger writes or production changes.
- Database: reuse migration 282 `help_public_article` + `help_public_search` SECURITY DEFINER functions. Related reads first validate the source article, return 404 if withdrawn/expired/missing, and 503 on DB failure. Frontend hides suggestions on a failed optional request rather than fabricating content.

## Verification evidence (miniPC, Debian 13.6)
- TDD RED then GREEN: backend related 404/503/category/locale/exclusion/5-cap/flag tests; Android path allowlist/no-store tests; accessible English/Korean link tests.
- Full `pnpm lint`: PASS (0 errors; 1,091 existing warnings). `pnpm typecheck`: PASS. Backend and frontend builds: PASS. `pnpm api:contract:check`: PASS (180 documented endpoints, no generated drift).
- Full `pnpm test`: PASS: security/release/storage 32; API contracts 38; database 47 PASS / 4 SKIP; backend 1,959 PASS / 440 SKIP; frontend 1,913 PASS. Discord bot 11 PASS. Root dependency audit: 0 High/Critical (9 moderate/3 low); bot audit 0 vulnerabilities.
- **Isolated PostgreSQL 17.11** network-disabled container: migration 282 applied; positive/negative fixtures and new 7-approved/2-draft related fixture PASS, including app-role direct table SELECT/UPDATE denial and PUBLIC EXECUTE denial. Ephemeral container removed. This is targeted real-DB evidence, **not** an assertion that the complete 294-migration chain passed in this isolated database.
- First ad-hoc frontend run without `NODE_ENV=test` failed due to React production `act` behavior; rerun with the package-required test environment passed all 1,913 tests. Initial missing `undici`/bot dependencies were local worktree symlink issues, fixed without modifying canonical/shared dependencies.

## Risk, non-duplication, release decision
- Open related Drafts #1825, #1833, #1836, #1839, #1843 edit help/gateway paths. Coordinate sequential rebase and full revalidation; preserve every unique PR/branch. This branch does not modify their features.
- Official Test and Production reported `b44ffd0af9e2bd6e7c2be7345b72094827078c3d` at the time of read-only `/api/version` probes, not this candidate. Verified help feature flag remains OFF by default. No official exact-SHA authenticated E2E, independently verified backup restore, historical 18,000 WLD provenance approval, or resolution of five migration checksum discrepancies. **No merge, Test/Production deployment, operational DB change, rollback, branch deletion or PR closure.**
- Rollback: disable `VERIFIED_HELP_CENTER_V1` (already OFF), or revert the eventual application commit; no schema or data rollback is necessary. Do not enable until editorial source approvals and release gates pass.
