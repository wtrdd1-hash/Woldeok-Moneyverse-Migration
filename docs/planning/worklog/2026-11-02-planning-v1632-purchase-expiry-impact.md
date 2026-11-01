# Planning v1632 — F675-214 Catalogue Purchase Expiry-Restamp Impact Preview
**v1632 GitHub:** Draft PR #2422 OPEN/HOLD (base #2416), developer handoff #2421. No merge or deployment.

**Date:** 2026-11-02 KST. **Cycle:** Previous Feature Improvement v1630 → Current Feature Addition v1632 → Next Feature Improvement v1634 (provisional). **Status:** DOCUMENTATION CANDIDATE / DRAFT / RELEASE HOLD. **Source:** latest origin/main a8541927c3a351d980454c66e95a3356c47e0722; stacked on unmerged Draft #2416. GitHub handoff issue #2421 created; child Draft PR #2422 OPEN/HOLD.

## START / evidence
- miniPC Debian 13.6 health active, DEV PostgreSQL connected. Superpowers using-superpowers, brainstorming, using-git-worktrees, writing-plans and verification-before-completion inspected locally; skills__list yielded no URI, so skills__read route BLOCKED only.
- Read latest main AGENTS.md, README.md and both PROJECT_PLAN files; prior v1630 docs preserved in isolated worktree. A merge of latest main into stacked docs branch conflicted with unrelated Treasury UPDATE_LOG changes and would import runtime commits; aborted cleanly. No other worker files modified.
- Source: catalogue BuyForm direct submit, canonical POST /api/v1/shop/catalog/:id/purchases, migration 071 PK(user_id,catalog_id), 072 ledger/upsert, 104 whole-holding expiry restamp on quantity increase. Proposed read-only GET /api/v1/shop/catalog/:id/purchase-impact?quantity=1..100, verified as-of impact and explicit confirmation. No binding quote or post-purchase expiry promise.
- Main a8541927... differs from public Test and Production /api/version 510dbe6... at 04:09 KST. Merged Treasury v1620 cutover log documents a specific Production v1619 runtime and reconciliation, not blanket release approval.

## MID / design
- V1 is a read-only owner-scoped preview with RESTAMPS_ENTIRE_HOLDING / NEW_TIMED_HOLDING / NO_TERM_CHANGE and one PostgreSQL observedAt. Existing expired rows are not invented lots. Session/consent/actor proof and app-role grants are P0 prerequisites; no new money path.
- Fail closed 400/401/403/429/503, private/no-store/noindex on Next and Android including HEAD/conditional/304, 30-second STALE, KO/EN accessibility, aggregated admin cohort>=20, flag OFF and rollback OFF. Canonical purchase receipt remains the only success evidence.
- P0 OPS1632-01 SEC1632-02 FIN1632-03 REL1632-04; P1 IMPACT1632-05 through IMPACT1632-10. Feature acceptance and official Test exact-SHA NOT RUN; external new approved 0, cumulative UNKNOWN / 10,000 BLOCKED / IN PROGRESS.

## FINISH (pending verification)
- Standard 171/171 PASS; classifier 24/24 PASS; expanded 193/194 PASS, 1 FAIL (#2391); issue #2421 created. PR/CI and final main recheck pending. No runtime, DB, item, WLD, ledger, Test or Production mutation.
