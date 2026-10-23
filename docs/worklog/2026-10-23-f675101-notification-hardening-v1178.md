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

## Finished / verification (to be updated after writes)
- Confirm branch diff and six EN/KO planning documents, cross-language parity, main drift, draft stacked PR, no runtime/DB/WLD/Test/Production changes.
- Production promotion remains BLOCKED; require exact-SHA CI, real PostgreSQL negative-role/ownership tests, isolated Test, restore/rollback before deployment.
