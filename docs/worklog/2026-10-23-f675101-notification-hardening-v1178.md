# v2026.10.23.1178 — F675-101 Notification Trust Hardening (documentation-only)

**Status:** DRAFT / IN PROGRESS. **Previous:** Feature Addition v1176. **Current:** Feature Improvement v1178. **Next:** Feature Addition v1180 (provisional). **Baseline:** main `8a1b466bda4568eb6ff62d75a6e3d1d6bfcde146`, parent draft PR #994 at `e43a3fb91a22fc4ce65371d6b1a9b68308a38d7e`. Stacked branch only; no Gemini/developer/QA code touched.

## Before work
- miniPC Debian 13.6 service health ACTIVE, development PostgreSQL connected; official `AGENTS.md`, `README.md`, canonical `PROJECT_PLAN.md` and Korean counterpart reviewed. Installed Superpowers skills used because skills connector list returned empty.
- Source: six fabricated/local-only notices in `notification-tabs-bar.tsx`; existing backend notifications API; BFF lacks offset forwarding; service sorts only by timestamp.
- Fresh DEV read-only PostgreSQL: `in_app_notifications` 0 rows, 10 columns, four indexes including `idx_in_app_notif_dedupe` partial UNIQUE on non-null `dedupe_key`; `moneyverse_app` SELECT/INSERT/UPDATE/DELETE, RLS OFF.
- `notification_publish_in_app` SECURITY DEFINER checks global `dedupe_key` and returns another row without recipient/payload match; separate SELECT/INSERT permits race. `notification_mark_read` returns false when an owned notification is already read, currently mapped to 404 by Next BFF. Existing SQL functions accept caller-provided `p_user_id`; do not assert cryptographically trusted DB actor binding without evidence.
- QA v1179 FAILED/HOLD: Next 16.3.8 dependency advisories, broad financial DB DML, migration 266 drift, CI lint, 04:00 backup Cron, exact-SHA Test/Production provenance.

## In progress
- Refine P0 privacy/dedupe/receipt truthfulness, P1 keyset cursor and category mapping, read idempotency, Android/admin, regression and rollback. Do not invent Production exploit evidence. Use canonical English integrated plan and equivalent Korean, existing PROJECT_PLAN and UPDATE_LOG. No new feature-spec fragments.
- Three official publishers reviewed (OWASP Authorization, PostgreSQL INSERT/unique indexes, W3C WCAG 2.2). Newly accepted independently deduplicated external references 0, cumulative UNKNOWN vs 10,000; gate BLOCKED.

## Finished / verification (2026-10-23 17:08 KST)
- EN/KO integrated masters, canonical PROJECT_PLAN EN/KO, UPDATE_LOG EN/KO updated in isolated branch; `git compare` against parent v1176 head shows seven changed documentation/worklog files, no deletions. Each of six official EN/KO docs contains the v1178 section. Manual thematic parity: cycle, P0/P1, evidence, DB constraints, QA and release gate align; formal translation review pending.
- Stacked [Draft PR #998](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/998) created with base v1176 [Draft PR #994](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/994); DO NOT MERGE. At PR creation branch was 7 commits ahead of parent and no commits behind it.
- **Main drift during work:** `8a1b466b` → `ea9b1845` (one commit, only stock page/layout/ticker files). No overlap with v1178 docs; parent and stacked branch now one commit behind latest main. Rebase parent then stacked branch and rerun checks before integration. Do not merge unrelated stocks changes into this stacked PR.
- Latest QA v1179 FAILED/HOLD, no implementation tests or exact-SHA Test run in this planning cycle. Production promotion remains BLOCKED; require dependency audit, financial negative-role/ownership tests, migration checksum provenance, CI, isolated backup restore, exact-SHA Test and zero-downtime rollback before release.
- No runtime source changes, database writes, WLD movement, feature-switch change, Test or Production deployment. External official publishers reviewed 3; accepted new 0, cumulative verified UNKNOWN / 10,000 = BLOCKED.
