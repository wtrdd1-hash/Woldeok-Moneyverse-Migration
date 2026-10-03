# Monetary / Fiscal Institutional Separation Worklog — v2026.10.04.523

- Date: 2026-10-04
- Branch: `docs/monetary-fiscal-separation-v2026.10.04.523`
- Start origin/main: `c10e1582ccc0c058dff5c5356ad8b1893759f72c`
- Scope: planning/docs only; no runtime, Test, or Production mutation.
- Objective: separate Moneyverse Economy Core into Central Bank, Mint, Central Treasury, and settlement/ledger responsibilities while preserving current treasury redistribution behavior.
- Authority order read before editing: `docs/DOCUMENTATION_POLICY.md`, `docs/DOCUMENT_CATALOG.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, and current treasury/economy specifications.
- External evidence lanes: IMF treasury–central-bank coordination/TSA, ECB euro issuance/production, US Federal Reserve/BEP and US Mint role separation, virtual-economy faucet/sink practice.
- Safety: existing runtime claims are not upgraded by this planning cycle. Existing concurrent branches are not modified.

## Mid-work record
- Mid-work `origin/main` moved from `c10e1582ccc0c058dff5c5356ad8b1893759f72c` to `065ee42204a4238c5010897212c7fc2a6c848f64`.
- The new main added treasury English/architecture documentation and related UI text. The isolated branch was rebased onto that exact main before authority edits; concurrent changes were preserved.
- External primary/first-party review covered IMF treasury-central-bank coordination/TSA, ECB issuance and production, Federal Reserve/BEP, U.S. Mint, Bank of Korea, Bank of England money creation, and EVE first-party economic reporting.

## Implementation decisions
- Central Bank = monetary-policy approval.
- Mint Bureau = execution-only mint/retire with certificates.
- Central Treasury = existing-WLD fiscal cash/tax/budget/expenditure.
- Economy Core/Settlement Ledger = double-entry settlement, idempotency, supply and treasury reconciliation.
- AI cannot mint/retire, approve monetary orders, or monetize treasury shortfalls.
- Initial bank lending remains fully funded from existing WLD; deposit-money creation is deferred.

## Validation checkpoint
- `git diff --check`: PASS after correcting one Markdown trailing-space line.
- EN/KO central-bank specification pair: present.
- PROJECT_PLAN and integrated-master v523 markers: present in both languages.
- Runtime/Test/Production: not changed by this cycle.

## Mid-work record
- Mid-work `origin/main` moved from `c10e1582ccc0c058dff5c5356ad8b1893759f72c` to `065ee42204a4238c5010897212c7fc2a6c848f64`.
- The new main added treasury English/architecture documentation. The isolated branch was rebased onto that exact main before authority edits.
- Primary/first-party review covered IMF treasury-central-bank coordination/TSA, ECB issuance/production, Federal Reserve/BEP, U.S. Mint, Bank of Korea, Bank of England money creation, and EVE economic reporting.

## Validation checkpoint
- Central Bank = monetary-policy approval; Mint = execution-only; Treasury = existing-WLD fiscal authority; Economy Core = ledger/reconciliation.
- AI direct mint/retire and fiscal-shortfall monetization are prohibited.
- Initial bank lending remains fully funded from existing WLD.
- `git diff --check`: PASS after one trailing-space correction.
- EN/KO v523 specification and authority markers: present.
- No runtime/Test/Production change.
