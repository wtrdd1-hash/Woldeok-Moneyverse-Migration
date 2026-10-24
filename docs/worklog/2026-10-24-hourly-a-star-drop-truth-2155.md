# Development A — Star Drop reward integrity (2026-10-24 21:55 KST)

## Before work
- Baseline main: `49788d09494fed3e463651945b83386e87dd47bc` (fetched); independent `auto/hourly-a-star-drop-truth-20261024-2155` worktree. Existing worker branches and PRs must not be modified or deleted.
- Read AGENTS, README, EN/KO living plan and integrated planning master, previous QA; inspected current dopamine backend, app-api gateway, Star Drop modal and frontend tests.
- P0 verified: `POST /engagement/dopamine/star-drop` currently responds with `success:true` and WLD reward without a ledger transaction. UI ignores request failures and invokes inventory reward callback anyway. `/engagement/dopamine/status` advertises three remaining claims despite no authoritative quota.
- Goal: preserve interactive five-tap *preview*, but refuse any actual WLD/inventory claim until verified server-side entitlement, atomic ledger+inventory receipts, idempotency, and quota are implemented. Web and Android must see the same refusal. Do not fabricate 2xx success or change production data.
- RED tests first; GREEN implementation; review; run focused + full gates, exact-SHA CI, isolated PostgreSQL read-only and Test evidence. Release HOLD if any gate fails.

## In progress
- RED regression tests added first for backend claim refusal, quota truth and frontend preview-only outcome. Running focused tests before implementation.

## Finished
- Pending.

### RED / GREEN and mid-work checkpoint
- RED backend: `dopamine.controller.test.ts` 2 new assertions FAIL (fake success and quota 3). RED frontend (`NODE_ENV=test`): 1 new assertion FAIL (fake claim button). A first frontend run without `NODE_ENV=test` failed due to React production `act`, corrected invocation, not counted as product failure.
- GREEN backend controller + engagement E2E 16 PASS; Star Drop authenticated HTTP E2E 1 PASS including 503/no-store; frontend Star Drop, station and Android app-api proxy 19 PASS. New HTTP test replaces guards only in test module and checks actual response headers; production guards remain unchanged.
- Code: remove fake reward callback/CTA, display explicit five-tap preview only; backend POST fail closed with 503 and no-store; status advertises zero available claims; Android proxy preserves 503/no-store. No ledger write, migration, DB fixture or Production change.
- Mid-work origin/main re-fetched unchanged `49788d09494fed3e463651945b83386e87dd47bc`; current EN/KO plans re-read. Other A/B/C/Gemini/QA work untouched.
- Next: run complete gates, audit, isolated PostgreSQL read-only ACL and CI; no merge/deploy without PASS.
