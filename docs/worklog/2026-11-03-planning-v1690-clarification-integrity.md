# Planning v1690 — F675-228 Clarification Lifecycle and Evidence Integrity

**2026-11-03 09:00–09:07 KST · Feature Improvement · DRAFT / RELEASE HOLD**

## START
- Read locally installed Superpowers using-superpowers, brainstorming, using-git-worktrees, writing-plans and verification-before-completion. Connector skills__list returned [] so skills__read URI was unavailable; local skill content was applied.
- miniPC Debian 13 services active; root/data disks 79% used at 09:00. Remote main 00a770ed7dadfd70f57189afe05b14d08f30f62f; previous planning Draft #2592 head 5d701172ed8b97903d617874ee1475f728b94a1b. Worktree isolated from dirty shared checkout.
- Read latest main AGENTS.md, README.md, canonical English and Korean plans, frontend/backend/app-api, migration 196, QA v1484, v1626.6 financial reset and v1627 QA ops rollout. GitHub connector checked open PRs, canonical main plan and issue #2591.

## MID
- Source-grounded issue: support_add_message sets open, admin_support_reply sets waiting_user, admin_support_set_status writes requested status. v1688 design could leave waiting_user stale after cancellation/expiry and race with independent status writers. Chosen refinement: card state orthogonal; answer alone writes member message and uses shared status authority; resolved supersedes pending; expired effective state changes ETag before persisted write; immutable versioned-HMAC receipts.
- Fresh 09:02 Production /en/tools HTTP500, Test HTTP200; both public /api/version f5c3fbed... versus main 00a770ed... (public ID not image proof). QA v1484 FAILED/P0 Production 24/28 locale 500, Test 0/28; DEV 266 tables, 327 migrations, app UPDATE195/DELETE194/TRUNCATE213 and 19 noncanonical executable functions. Root/data 79% used with 21G/41G free after independent cache cleanup; do not attribute recovery to planning.
- v1626.6 real Production legacy finance reset documented and ledger preserved; historical settlement holds remain. Independent off-host restore, exact-candidate authenticated Test E2E and Production release gates not certified. External independent refs new 0; cumulative UNKNOWN/10000 BLOCKED.

## HANDOFF / VERIFICATION
- Updated English canonical PROJECT_PLAN.md and Korean equivalent, English/Korean integrated master, English/Korean UPDATE_LOG, paired worklogs; no new distributed planning file. P0 4/P1 6 in issue #2591, code work to separate developer branches and exact-SHA Test gate.
- Required verification: English/Korean section parity, 8 intended files, git diff --check, security/control-byte checks and focused release tests. Record exact results in final PR/comment; do not infer functional test PASS. No runtime/SQL/financial/Test/Production deployment, merge, automation modification or deletion.

## Verified checks / 검증 결과 (09:07 KST)
- Focused release/backup tests: 32/32 PASS, 0 FAIL, 0 SKIP. Repository security and control-byte scans PASS; security scanner tests 4/4 PASS. EN/KR canonical-to-integrated section parity PASS; git diff --check PASS; eight documentation files changed.
- Latest remote main rechecked 00a770ed7dadfd70f57189afe05b14d08f30f62f; no main merge, and prior Draft #2592 remains independent. No feature acceptance, exact-SHA Test E2E, independent off-host restore or Production release certification.
