# Verified Help Live Expiry Truth — Repair Plan (2026-10-27)
Status: Existing verified-help freshness contract repair; engineering DRAFT/HOLD; no Production release.
Base: origin/main c2a9306ddc0424438bc0ab297ea9543bb167aee6; separate auto/hourly-a-* worktree.
Problem: a verified article can expire while the DB response is in flight or while a reader keeps an open search result. A previous successful response must not keep claiming verification.
Scope and tests:
1. RED backend tests: repository returns stale/invalid search or article metadata; public controller must not emit it. Android gateway inherits the same backend read boundary. GREEN with a shared absolute-expiry predicate; no new table grant or financial effect.
2. RED frontend jsdom test: previously verified results must disappear at exact expiry without user interaction, including background tab resume. GREEN: one-shot deadline timer + visibility check; avoid periodic polling. Preserve KO/EN and noindex/no-store.
3. Isolated real PostgreSQL 17 fixture verifies already-expired revisions are invisible to restricted app role and PUBLIC has no EXECUTE. Do not change applied migration files; existing NEW 280 remains unapplied.
4. Run focused RED/GREEN, complete test/typecheck/lint/build/security/Android API contract, official exact-SHA Test only if safe; record failures honestly.
5. Reread current main and EN/KO integrated planning at mid/end, preserve other workers and unmerged commits, create Draft/HOLD PR only. No merge/Production without all gates.
Rollback: feature OFF; no DB mutation deployed; drop candidate worktree only after safe integration, retain PR until resolved.
6. Detail page parity: RED jsdom open article expiry test, GREEN client article boundary removing body/source on expiry. Backend detail and Android response fence already covered. No stale public copy left in an open detail tab.
