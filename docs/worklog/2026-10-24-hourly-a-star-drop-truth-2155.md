# Development A — Star Drop reward integrity (2026-10-24 21:55 KST)

## Before work
- Baseline main: `49788d09494fed3e463651945b83386e87dd47bc` (fetched); independent `auto/hourly-a-star-drop-truth-20261024-2155` worktree. Existing worker branches and PRs must not be modified or deleted.
- Read AGENTS, README, EN/KO living plan and integrated planning master, previous QA; inspected current dopamine backend, app-api gateway, Star Drop modal and frontend tests.
- P0 verified: `POST /engagement/dopamine/star-drop` currently responds with `success:true` and WLD reward without a ledger transaction. UI ignores request failures and invokes inventory reward callback anyway. `/engagement/dopamine/status` advertises three remaining claims despite no authoritative quota.
- Goal: preserve interactive five-tap *preview*, but refuse any actual WLD/inventory claim until verified server-side entitlement, atomic ledger+inventory receipts, idempotency, and quota are implemented. Web and Android must see the same refusal. Do not fabricate 2xx success or change production data.
- RED tests first; GREEN implementation; review; run focused + full gates, exact-SHA CI, isolated PostgreSQL read-only and Test evidence. Release HOLD if any gate fails.

## In progress
- Pending.

## Finished
- Pending.
