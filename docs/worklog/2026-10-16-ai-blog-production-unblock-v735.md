# v2026.10.16.735 — AI blog Production release blocker remediation

**English canonical | [한국어](2026-10-16-ai-blog-production-unblock-v723.ko.md)**

## START (2026-10-16 19:42 KST)
- Operator reiterates authorization to fix blockers and actually promote to Production; previous v721 code integration/Test is not the requested end state.
- Dedicated `release/ai-blog-v2026.10.16.735` worktree based on `origin/main=2d153ec3486d9d7b1e51a4b811abb67cf3569568`. Production is v717 `176ca04e` and official Test is v721.2 SHA `10d5dfdb`.
- Read latest `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, documentation governance, `docs/RELEASING.md`, `docs/operations/production-deployment.md` and v530 full UI acceptance; inspect actual DB/finance gates and unused old writers before any cutover.
- Never alter member balances, ledger records, Production PostgreSQL privileges or services without exact-scope safe verification and rollback. Observe other agents' worktrees; never overwrite ongoing Gemini work.

## MID
Pending.

## END — source remediation acceptance
- Source and unit tests ready for isolated PR/CI and exact-SHA Test acceptance. Runtime service retirement was applied and verified; no Production app cutover. The release remains blocked by observed app-role direct monetary DML and unaccepted v530 full authenticated UI checks. A future deployment must demonstrate these gates rather than waive them.

## MID — 2026-10-16 19:55 KST
- Re-fetched main f1266523 including v734 host identity fix; rebased this isolated branch and versioned v735.
- Retired non-public legacy v600/v635/v697/v712 frontend processes, disabled 3 persistent starts. Public v717, blog HTTP 200, shared store mode 0444 and immutable rollback artifacts unaffected.
- Read-only actual app-role SQL: account_balances and ledger_postings retain direct INSERT/UPDATE/DELETE. No financial DB permissions or data altered.
- TDD RED/GREEN for swallowed blog persistence failures and editorial direct-write prohibition. Full QA: backend 1216 pass (396 DB-skipped), frontend 1251 pass, typecheck/build/lint exit 0 (1075 existing warnings).

## Post-merge Test and Production candidate — 2026-10-16 20:17+ KST
- PR #895 merged main `9618a249`, matching Test-candidate Git tree; branch CI #38890866500 and main CI #38891728736 and Test candidate build #38891728801 all SUCCESS.
- Official Test promoted first branch v735.1 and then exact merged main v735.2. Public Test identity exact, backend health and old signed-in session survived restart, six curated blog entries / 28 indexable sitemap URLs / historical noindex/anonymous POST 403 all accepted; temporary QA session revoked. Five-pass browser blog 135/135 PASS.
- Prepared immutable unused Production artifact `prod-v2026.10.16.735.1-9618a2499328` with exact manifest, deliberately **not switched** because finance DML and full authenticated UI acceptance gates are not met. Public Production still v717. See [release evidence](../releases/v2026.10.16.735.md).
- Confirmed legacy v600 service restarted despite disabled autostart (external actor unknown); old v635/v697/v712 inactive. Its route is not public Nginx upstream; file `0444` and identical sha256 maintained. The old-writer containment cannot be called complete before the restart cause is eliminated.
