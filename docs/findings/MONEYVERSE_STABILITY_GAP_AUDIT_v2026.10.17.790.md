# Moneyverse current-plan/source/runtime stability gaps — v2026.10.17.790

**Evidence boundary:** static code inventory and targeted tests on `origin/main` 4997cf2b; live public version, systemd, read-only Production DB financial preflight. This is not a complete authenticated end-to-end validation of every feature.

## Current observed inventory
- Source inventory: **166 Next `page.tsx`**, of which **34 under admin**; **78 Next route handlers**, **82 Nest controllers**, **274 numbered SQL migration files**. Test inventory (file count, not executed assertions): **215 backend `.test.ts`**, **239 frontend `.test.ts(x)`**.
- Published Production API version: `176ca04e` (v717); published Test API version: `4a7c1398` (v755 lineage), latest reviewed `main` `4997cf2b` (v786). Running backend/frontend and connected database are necessary but not sufficient evidence of full service fitness.
- Host disk readout: `/` 72% full, `/srv/moneyverse-data` 61% full; database/release/backups on separate data mount. No cleanup or storage migration performed.

## Prioritized remediation register
| Priority | Evidence and impacted area | Safe next gate |
| --- | --- | --- |
| P0 | Live app role still has direct INSERT/UPDATE/DELETE on `accounts`, `account_balances`, `ledger_transactions`, `ledger_postings`, `system_treasury_vaults`. | Replace each live writer with actor-scoped idempotent SECURITY DEFINER ledger settlement, validate DB-clone negative privilege tests and rollback, then revoke obsolete DML grants. |
| P0 | Live read-only snap: 40 account balances; 19 balance-projection deltas +4,779,188 WLD; 5 accounts with no journal posting 2,627,807 WLD. Individual entries are not proven to be unauthorized. | Historical snapshot/opening-balance provenance per account; no synthetic balancing entries; independent supply and treasury reconciliation. |
| P0 | Static direct-account-balance update patterns remain in seven backend source files: marketplace service, black-market repository, PvP repository, treasury bonds repository, SWF service, national pension repository and FX repository. Some paths may already be fail-closed; static matches alone cannot establish live reachability. | Trace caller → guard → transaction/function → ledger receipt; prioritize reachable writers and concurrency/rollback. |
| P0 | v530 acceptance requires 166 page routes including 34 admin with five complete authenticated passes; available audit evidence does not certify the current source. | Browser session tests on exact Test SHA for mobile 320–430px, desktop, admin roles, non-200 states, CTA/BFF/API/DB. |
| P0 | Main source does not match public Test or Production app version; several concurrently running historical backend generations require job-leader verification. | Exact-SHA isolated Test, session restart continuity, one scheduler owner, canary/rollback and no-downtime provenance. |
| P1 | Finance preflight v737 treated missing numeric ledger metrics as zeros in JS comparisons. | **Fixed in this branch:** reject malformed evidence; RED/GREEN regression and 55 release unit tests passed. |
| P1 | Product planning identifies unfinished region-specific SEO truth, onboarding reward proof, stock/news source truth, API-to-UI reachability and Android compatibility. | Verify each against runtime with receipts, scoped credentials and non-success/error cases; do not interpret planning entries as deployed capabilities. |

## Scope and changes
`verify-financial-readiness.mjs` evidence validation only, 3 new negative test groups. No schema/DB mutation, member session or running app changes. Candidate Test and Production promotion remain blocked by unrelated, currently unverified mandatory gates. See paired release notes.
