# Season Event Affordability Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. This is a bounded, read-only P1 feature under the standing hourly Full-stack A development authorization. Do not deploy without exact-SHA gates.

## Intent, scope, decision
Members need to find currently active season events within a WLD entry-fee budget without reading an unrelated event or accidentally paying. The current PostgreSQL SECURITY DEFINER `season_active_events()` already returns active events and integer-string `cost_wld`; it is the sole source of truth. Add optional `maxCost` (canonical nonnegative signed-int64 decimal string) to existing authenticated GET `/api/v1/seasons/events`, the member `/seasons` view, and Android `/app-api/v1/seasons/events`. No write, new SQL function, table grant, migration, settlement or payment. Reject duplicate/malformed parameters and fail closed on unverified cost rows. A database-side filter would need a new reviewed migration and is unnecessary for this small active-event result set. Filtering is over the complete active event set returned by the existing function, before event selection and leaderboard requests.

## Test-first tasks
- [ ] T1 contract helper: tests for 0, >2^53 precision, invalid/duplicate/overflow, negative, malformed rows, all-or-nothing verification. Implement shared normalization/filter/response proof.
- [ ] T2 backend: controller query guard, service filter over actual `season_active_events()` repository rows, no direct table access, no payment path. Test rejected inputs, source failures, exact BigInt boundaries.
- [ ] T3 frontend: authenticated season page filter UI with explicit label, error/verified-empty distinction and selection from filtered set. Test component/page contracts and stale unfiltered 200 refusal.
- [ ] T4 Android app-api: query validation before proxy, forwarded canonical cap, response proof and private/no-store/noindex/no-referrer on success/error. Test forged 200, duplicate, malformed and precision.
- [ ] T5 contract documentation and EN/KO worklogs; review latest main, QA, PR, branches and CI. Run targeted and full tests, typecheck, lint, build, security, real PostgreSQL role read and official exact-SHA Test if safe/available.
- [ ] T6 PR only after evidence. Merge/Production only if full independent gates PASS, else DRAFT/HOLD. No branch deletion unless fully integrated and ownership proven.

## Rollback
Disable the optional filter by reverting this isolated PR; no DB schema/data/ledger changes. Existing unfiltered endpoint and season participation are unchanged.
