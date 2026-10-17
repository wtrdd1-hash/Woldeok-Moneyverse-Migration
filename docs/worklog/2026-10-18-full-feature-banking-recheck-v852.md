# v2026.10.18.852 — All-feature and banking second verification

**Status: IN PROGRESS; production banking release NOT ACCEPTED.**

## Before work
- User requested a second independent verification of all existing functions, emphasizing banking reliability.
- New isolated worktree from current `origin/main=a5cebaf9380eaedde8b5a41f626c5013f755f310`, not the concurrent v851 fix PR; its CI `success` is distinct from real runtime acceptance.
- Authorities: `AGENTS.md`, `DOCS_INDEX.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/RELEASING.md`, `docs/CURRENT_RUNTIME_BASELINE.md`, current v801 audit/v851 pocket findings, backend API and runtime.
- Run **read-only** bank SQL and HTTP checks; tests/build in isolated source; no real production transaction, money edit, session mutation, release restart or traffic switch.

## Plan
- [ ] Re-evaluate deployed version/Test identity versus current main and proposed v851 patch.
- [ ] Financial release readiness: ledger/postings, account projection, rights and routines; actor/csrf/idempotency checks.
- [ ] Analyze all feature inventories and public/anonymous endpoint smoke without conflating 200 with authenticated success.
- [ ] Execute isolated full test/typecheck/lint/build and isolate skipped DB tests.
- [ ] Re-fetch main at meaningful checkpoints, record actionable P0/P1 defects and bilingual EN/KO logs.
- [ ] Report blockers rather than bypass mandatory release gates.

## In progress
- Started.

## Finished
- Pending.
