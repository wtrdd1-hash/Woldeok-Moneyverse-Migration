# v2026.10.28.1415 — Treasury / Mint / Central Bank Truthful Containment

## Start and authority
Owner instructed remediation of the 2026-10-28 v1401 audit. Read authoritative PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, v523 separation and v542 integrity specifications; AGENTS.md and relevant Superpowers isolation/TDD/debugging/verification skills. Starting and mid-work GitHub main and installed Production SHA: `a28bed9aa40ff74d492824ae12892a7d52132fdd`. Unique isolated branch `fix/treasury-money-truth-v20261028-1415`; no concurrent Gemini worktree edited. Production DB and financial records remained read-only.

## Findings reproduced and source fixes
- Public `/treasury` and `/api/treasury/overview` advertised hardcoded fake 25M reserves, 3.42M expenditures, 1,420 beneficiaries, synthetic payments and ever-fresh timestamps after private API was inaccessible. New shared projection fails closed with `verified:false`/`UNVERIFIED`, no monetary totals or rows, and JSON HTTP 503/no-store; the page remains accessible with a clear warning.
- Historic `MintController` / `CentralBankController` expose process-memory-only mint batches, burn certificates, policy rates and fabricated M1/M2. HTTP surfaces now return stable `LEGACY_MONETARY_AUTHORITY_UNVERIFIED` 503 instead of misleading success; administrator mock widgets replaced by evidence-pending statements.
- New admin monetary `execute-mint` only inserted certificates without canonical account/ledger issuance. It and manually run/enable auto-monetary actions return `MONETARY_SETTLEMENT_UNVERIFIED` 503. Reading the policy and emergency freeze remain accessible.
- Direct treasury grant, donation, dividend, targeted subsidy, inject/drain, budget distribution, buyback burn and wealth tax routes lacked certified canonical double-entry linkage. Those financial writes now return `TREASURY_SETTLEMENT_UNVERIFIED` 503; status/read views remain accessible.
- SWF liquidation was observed failing on SQL `$1` inconsistent PostgreSQL type inference. The string/numeric/jsonb bindings in the audit insert now use explicit casts. Manual SWF rebalance/liquidation endpoints return 503 until supply, ledger and cash/portfolio preservation can be certified. Scheduled auto-operations remain disabled.
- The Next build initially spawned 15 static-generation workers and failed with SIGABRT on the 8.5GiB mini-PC; configure default 2 build workers (bounded override) and the subsequent production build completed.

## Verification
- New tests written first and observed RED; after source implementation: 8 backend files / 47 tests PASS and 4 frontend files / 7 tests PASS.
- Package contract, backend and frontend typechecks PASS; root lint exits 0 with zero errors and 1,096 pre-existing/general warnings.
- Backend Nest build PASS; frontend Next full production build PASS after worker-cap adjustment.
- Isolated preview on port 3881: `GET /ko/treasury` HTTP 200 with no fabricated 25M or 3.42M number; `GET /api/treasury/overview` HTTP 503 with UNVERIFIED, no-store and zero ledger items. Preview process terminated after smoke checks.
- Missing: authoritative isolated PostgreSQL authenticated Test finance E2E, app-role least privilege, canonical treasury/supply reconciliation and migration 272 parity, backup/restore and approved exact-SHA zero-downtime production gate. Those must not be described as passed by this source-only validation.

## Release disposition
Code is a containment candidate, not completed financial implementation. No financial database writes, migration apply, operating scheduler activation or Production cutover. See internal and GitHub notes under `docs/updates/v2026.10.28.1415-*`.
