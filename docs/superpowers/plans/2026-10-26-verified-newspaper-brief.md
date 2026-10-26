# Verified Newspaper Snapshot — C v1064

## Scope and constraints
Fix public `/newspaper` weekly-brief fabrication without touching the separate market-event PR #1215. The current backend emits made-up rankings and percentages, and the frontend fails to unwrap `{success,data}`. Only current `USER_CASH` and `USER_BANK` balances are source-backed; this is **not** M0, inflation, or a weekly trading statistic.

## Plan
1. RED backend tests: exact read-only SQL balance aggregation, no pool/error 503, no fabricated metrics, precise string amount.
2. RED frontend tests: strict response envelope parsing, missing/invalid response shows unavailable, valid snapshot displays only source-backed value and collection time.
3. GREEN backend: `NewspaperController.getWeeklyBrief` returns `success:true,data:{balanceSnapshotWld,asOf}` from DB; reject missing/invalid data; no fabricated fields.
4. GREEN frontend: unwrap/validate, accessible responsive snapshot + unavailable state; static educational copy clearly not financial recommendation; truthful SEO.
5. Verify focus, lint, typecheck, build, unit, app-api, security, isolated real PG, CI, official Test exact-SHA. Re-fetch main and plans before PR/merge. Hold if any gate fails.
