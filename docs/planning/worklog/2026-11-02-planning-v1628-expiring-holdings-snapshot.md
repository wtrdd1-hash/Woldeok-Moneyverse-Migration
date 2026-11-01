# Planning v1628 — F675-213 Verified Current Expiring Holdings Snapshot

**Date:** 2026-11-02 KST. **Cycle:** Previous Feature Improvement v1626; Current Feature Addition v1628; Next Feature Improvement v1630 (provisional).
**Status:** DOCUMENTATION CANDIDATE / DRAFT / RELEASE HOLD. **Main at start/mid:** 510dbe6bf4d5c2a8089fc06b480776053da7a2e3. **Stack base:** unmerged Draft #2402, head c5812debab56dec968294ad0108c4ee5c36f308f. **Issue:** #2409.

## Observed reality
- miniPC Debian 13 services active and development PostgreSQL connected; installed Superpowers using-superpowers, brainstorming, using-git-worktrees, writing-plans and verification-before-completion inspected. The skills connector returned zero URIs; skills__read route BLOCKED; installed skill used.
- Canonical AGENTS.md and README.md plus English PROJECT_PLAN.md and Korean PROJECT_PLAN.ko.md rechecked against main; GitHub open PRs and QA inspected. Test public /api/version returned main 510dbe6..., Production returned 353c6d5..., neither certifies immutable running image/DB provenance/restore.
- Real /shop/catalog displays held expiry and effect expiry separately. Nest shop/holdings is owner guarded, but its repository returns unbounded shop_my_items_v2 rows; migration 123 uses multiple clock_timestamp calls. No 24/72h exact single-observation verified summary exists. This is a source gap, not evidence of observed user loss.

## Design choice and handoff
Selected read-only, owner-only current holdings snapshot rather than browser-side unbounded filtering or a new worker. Proposed strict GET /api/v1/shop/expiry-snapshot?hours=24|72; one PostgreSQL microsecond asOf under read-only REPEATABLE READ, complete counts as bigint strings, <=10 grouped rows, 503 on unverifiable source, no WLD/ledger/item mutations, no notification-delivery inference. KO/EN web/Android private-edge/a11y and aggregate-only admin; default OFF. Full schema, permission, index, transaction, API, security, SEO, analytics, regression and rollback in paired integrated plans.

P0 OPS1628-01 SEC1628-02 FIN1628-03 REL1628-04 and P1 SNAP1628-05..10 tracked in GitHub issue #2409. Independent finance issues #2330/#2340/#2357/#2366/#2404/#2405, role grants #993, migration provenance #2233/#2345 and exact-SHA/restore HOLD remain. New external approved references **0**; cumulative **UNKNOWN / 10,000**, BLOCKED / IN PROGRESS.

## Verification / disposition
Planning only: no product implementation or Test/Production deployment. Feature acceptance, PG17 migration, authenticated E2E and restore **NOT RUN**. Documentation tests, exact commit and remote CI evidence to be appended only after verified results. Preserve other developers' branches, Drafts, data and active automation.


**Fresh QA:** standard release/security/backup 171/171 PASS; classifier 24/24 PASS; EN/KO 4 pairs×9 markers PASS; diff check PASS. Expanded suite 175/176 PASS, one obsolete cleanup workflow test expects a destructive git push but the current workflow is read-only. QA follow-up OPEN; feature E2E not run.
