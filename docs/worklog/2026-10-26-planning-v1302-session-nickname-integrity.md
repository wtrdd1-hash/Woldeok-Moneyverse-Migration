# 2026-10-26 Planning v1302 — Session Nickname Integrity

## START
- 2026-10-26 07:10 KST. Previous Addition v1300 / Current Improvement v1302 / Next Addition v1304 provisional.
- miniPC Debian 13.6 active; dev PostgreSQL connected. Root 100% (~786MiB), separate data volume ~50GiB free. `skills__list` returned no URI so `skills__read` unavailable; installed Superpowers using-superpowers/brainstorming/writing-plans/using-git-worktrees/verification-before-completion read on miniPC. Main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; AGENTS.md, README.md, canonical English PROJECT_PLAN.md and Korean counterpart consulted. Previous Draft #1379 unmerged.
- Latest QA v1285 FAILED/HOLD: frontend 1,397 pass/6 fail; production audit 2 High; full audit 2 Critical/10 High; bot 1 Critical/5 High; broad DB grants and Migration 266 provenance unresolved; exact-SHA authenticated Test/isolated restore unproven.

## MIDPOINT
- Remote main and canonical English/Korean main plan SHA256 unchanged (see miniPC records). Source read: Migration 213 seven-column SQL function, account security repository/controller, auth_sessions DDL, revoke-one/revoke-others SQL and security page. The proposed in-place return-shape change is not legal PostgreSQL DDL; separate v2 is needed. The page uses heuristic deviceLabel for icon and apiOrNull failure for empty list; nickname must not drive security icon. Existing revoke SQL updates auth_sessions; race/deadlock and app-role actor boundary require verification.
- No A/B/C/Gemini/QA source changes or other worktree deletion.

## IMPROVEMENT / ACCEPTANCE
- Read v1 unchanged, new v2/companion function and additive GET; PUT {label}, body-free DELETE, If-Match and Idempotency-Key, 428/412/409/404/410/429/503, committed ETag and replay revalidation, tombstone version, row-lock vs revoke race and bounded 40P01/40001 retry.
- P0 ENV1302-01 SEC1302-02 REL1302-03 AUTH1302-04. P1 AUTH1302-05 AUTH1302-06 AUTH1302-07 AUTH1302-08 AUTH1302-09 AUTH1302-10. Full spec in EN/KO integrated master; Android, a11y, admin, SEO, analytics, test and flag-off rollback.
- External 10,000 independent evidence gate: newly approved 0, cumulative UNKNOWN, BLOCKED / IN PROGRESS. Docs only, no Test/Production deployment, migration, WLD, ledger or session mutation.

## RELEASE
- PARTIAL / DRAFT / RELEASE HOLD; independent development branch, real isolated PostgreSQL, official exact-SHA authenticated Test E2E, security audit, independent backup restore and approved GitOps required before Production.
