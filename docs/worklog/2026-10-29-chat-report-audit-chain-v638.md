# B v638 — Private chat abuse report canonical audit repair

## Before work
- Baseline: `76d63a5840a4a185fcaeb02f8b1132dd145f19e4` (2026-10-29 18:30 KST), issue #1874, QA v1370.
- Isolated PostgreSQL reproduced `42703`: migration 227 writes non-existent audit columns `entity`, `target_user_id`, `details`. No report or audit can commit.
- Existing canonical `admin_append_audit_event` implements the integrity-hashed, serialized audit chain; its caller action must be lowercase and match policy regex.
- A owns migration-lineage remediation #1878. This branch tentatively uses `305`, the next contiguous number **only if** A reconciles the 303 existing SQL files into 002–304. Until that coordination is complete, this is a Draft/HOLD candidate.
- No applied SQL rewrite, app-role table grant, financial ledger mutation, or shared DB write.

## In progress
- [x] RED: 1/1 static regression failed before migration creation; QA v1370 independently reproduced SQLSTATE 42703 on clean PostgreSQL.
- [x] GREEN: forward-only 305 redefines report function, calls canonical audit append, keeps owner-scoped report and private table ACL.
- [x] Isolated PostgreSQL 17.11 accepted all 303 current-main SQL files plus 305 and passed 3/3 owner/outsider/rollback/ACL tests; container removed.
- [x] Full project gates executed; see blockers below.
- [x] Re-fetched main at 18:39 and 18:42 KST (unchanged); migration numbering cannot be reconciled in this independent branch while A owns #1878; release HOLD.

## Finished
- Local static regression 1/1 PASS; chat controller receipt 4/4 PASS; real PostgreSQL 3/3 PASS; contract package 41/41 PASS; `pnpm audit --prod --audit-level moderate` PASS (zero advisories).
- Full backend tests **FAIL** 238 / PASS 2026 / SKIP 810; database package **FAIL** 1 migration-parity / PASS 53 / SKIP 4. Backend TypeScript/build FAIL 5 preexisting errors; Next.js build FAIL from unrelated frontend type errors; ESLint FAIL 1 unrelated frontend error; mobile API contract check FAIL generated-doc drift. None of these unrelated files were changed by this branch.
- The source migration tree has duplicate IDs 291×3, 292×3, 293×2, 294×2, 295×4; the prospective 305 must not be merged before #1878 author-coordinated 002–304 lineage is proven. A's Draft PR #1880 preflight guard remains separate.
- Official isolated Test exact-SHA, authenticated API/DB E2E and Production release gates **BLOCKED**. No merge, Test, Production, or shared DB writes; no existing branches/worktrees deleted. This is a code candidate, not a shipped fix.
- Rollback: discard this candidate branch or revert its future forward-only migration through a reviewed later migration; never edit an applied SQL file.

