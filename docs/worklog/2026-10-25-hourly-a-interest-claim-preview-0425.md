# Development A — interest claim read-only preview — 2026-10-25 04:25 KST

## Before work
- Branch: `auto/hourly-a-interest-claim-preview-20261025-0425`; source `origin/main` `c9a868b1e622341e2daa8b936ddf0988eda9988e`.
- Debian 13 connection and all primary services ACTIVE. Root filesystem 100% used (about 503 MiB available); no other worker worktrees or caches deleted.
- Reviewed AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated planning master, previous QA, open PRs and CI. Existing pending A/B/C and Gemini branches remain untouched.
- P1 scope: member-owned, read-only compound-interest claim preview from authoritative `bank_get_my_standing`; show exact current bank, accrued claimable interest and hypothetical post-claim balance. No actual claim, no WLD movement, no migration, no policy/eligibility promise.
- Invariant: only session actor; fail closed on unavailable/malformed standing; integer-string arithmetic; private no-store, noindex; Android generic app-api gateway; zero write SQL.

## Plan / checkpoints
- [ ] RED: backend preview exactness/invalid-data/controller actor tests; frontend preview contract/route tests.
- [ ] GREEN: minimal pure preview calculator, guarded endpoint, authenticated web page and bank entry link.
- [ ] Run focused, then broad gates; isolate real PostgreSQL read-only check and rollback.
- [ ] Re-fetch main and planning, review diff and PR/CI, record blocked release evidence.

## In progress
- Started worktree from verified latest main. No other worker changes touched.

## Finished
- Pending verification.

### In-progress checkpoint — 04:30 KST
- RED confirmed: backend and frontend focused tests failed due to missing preview modules.
- GREEN confirmed: backend 9/9, frontend 6/6 tests pass. Backend uses existing owner-scoped SECURITY DEFINER standing function; no SQL write, no migration. Web renders a verified server response and explicitly disclaims eligibility/transaction effects. Android generic app-api gateway path tested.
- Disk safety: removed only generated `.next` build output (396 MiB) from Development A's own completed 2026-10-24 23:25 worktree. No source, branches, or other agent worktrees deleted.
- Remaining: broad gates, real PostgreSQL, current-main refresh, release gate.
