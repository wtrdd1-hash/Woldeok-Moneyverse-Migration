# v2026.10.29.1201 — Ledger storage redesign (work in progress)

Baseline: origin/main `2ac90063`; isolated worktree branch `fix/ledger-storage-v2026.10.29.1201` to avoid colliding with concurrent Gemini work.

Findings: existing `ledger_postings` and `account_balances` use exact PostgreSQL NUMERIC; `system_treasury_ledger` uses TEXT for money fields; 2026-10-16 release documents report 19 historic unmatched account projections and app-role direct DML. Latest inspected reconciliation snapshots are dated Oct 24 and passed, but do not certify Oct 29 Production. The connected MCP database is `woldeok_moneyverse_dev`, not Production.

Implementation stage 1: forward-only migration 282 adds exact base-1e9 JSONB chunk transport codec and strict validation. Existing ledger amounts, accounts and balances are untouched. JSONB is an interchange format, NOT the source of truth. No `Number()` or floating-point arithmetic is acceptable for money movements.

Next gates: apply on disposable Test, run verify/282, inspect real PostgreSQL `data_directory` and disk placement, assess cache/Redis and all money writers, reconcile per-account legacy differences with signed evidence, check grants, then approve/execute safe Production promotion. NEVER reset historical balances or fabricate postings to conceal differences. AI may author and test schema in isolated branches and designated Test as permitted by DB role; privileges must not be construed as authority to bypass financial controls, audit logging or Production release gates.
