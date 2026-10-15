# Treasury System Full Re-analysis — v2026.10.15.676

**Status: READ-ONLY AUDIT / P0 FINANCIAL BLOCKED.** [Korean](TREASURY_SYSTEM_FULL_REANALYSIS_v2026.10.15.676.ko.md). This is an evidence-scoped source/runtime/database analysis, not an acceptance test, patch, payment or deployment.

## 1. Scope and precedence
- Source: GitHub web `origin/main f2bf939e53482721ee8bbf1074bd7ebf1922b13e`; branch `audit/treasury-full-reanalysis-v2026.10.15.676` kept isolated from PR #857 (v675 startup grant design) and all other agents.
- Deployment identity: Production symlink resolves to `/srv/moneyverse-data/releases/prod-v600`; Test symlink to `test-v618-7fa3f245bbc3`. Production copies of major treasury files inspected separately. Running backend/frontend/DB health reported active via @pc.
- Read: AGENTS, DOCUMENTATION_POLICY, PROJECT_PLAN and INTEGRATED_PLANNING_MASTER, adopted v523 central bank/mint/treasury/Economy Core, treasury redistribution, admin management, 30%-reserve/85%-liquidity authority drift, historic audit v629/v636/v652, latest v674 release gating, live schema and selected source/migration routes.
- Method: read-only SQL and filesystem/static call path inspection; **no authenticated member or administrator E2E, synthetic payment, destructive stress test, database mutation, web/server release, or runtime feature change**. Inventory is not proof that every function/click was executed.

## 2. Authoritative design contract
1. Central Bank authorizes monetary policy, Mint alone executes authorized issuance/retirement, Treasury redistributes **existing** WLD and controls tax/fiscal vaults, and Economy Core is authoritative for balanced postings, idempotency, projections, outbox and reconciliation. Fiscal transfers must not change monetary supply.
2. Five fiscal sub-vaults: VAULT_MAIN, VAULT_WELFARE, VAULT_EMERGENCY, VAULT_INFRA, VAULT_RESERVE. The 40/30/20/10 allocation applies to one defined distributable surplus; benefits are subordinate program allocations, not independently additive percentages.
3. The 30% reserve, 25M target, 85% cash-liquidity statement, protected pension/bond/refund liabilities require one unified numerator, denominator and priority contract. A 25M target is **not** authorization to mint WLD.
4. No fake UI receipt, grant approval, burn or coupon. Only domain-specific authorized server transaction linked to verifiable financial ledger receipt represents settlement.

## 3. Live evidence (2026-10-15 KST; read-only)
| Evidence | Observed |
| --- | --- |
| VAULT_MAIN at 13:47 KST | 185,296,675 WLD (previous read before scheduled cycle 184,460,884) |
| VAULT_EMERGENCY / WELFARE / INFRA / RESERVE | 34,832,520 / 20,564 / 0 / 0 WLD |
| Economy Core account type TREASURY, system_key treasury | 0 WLD |
| SWF config | is_enabled=true; auto_tax=true; auto_harvest=true; reserve floor 85,000,000; interval 1h; last execution 04:47:57 UTC |
| Recent SWF cycle | 124,000 WLD scripted tax/dividend + 711,791 WLD virtual portfolio harvest = **835,791 WLD**, recorded in system_treasury_ledger; same cycle Economy Core postings **not found** in listed subsequent transactions |
| SWF portfolio | 4 entries, reported valuation 199,381,358 WLD; cost basis 33,987,288 WLD; valuation does not establish realized external cash |
| Fiscal journal | 500 FEE_RECIRCULATION records totaling 125,955,707 WLD (all vaults). 4 disbursement register rows (two dividends, two community funding) |
| Economy Core | 831 ledger transactions, 1,692 postings (balanced aggregate debit and credit 871,193 WLD), last transaction at Oct 10; this does **not** prove balance projection = postings |
| DB migrations | 266 applied filenames, highest numeric 268; 269/270/271 exist in main but not applied |
| DB privileges | 241 public base tables, moneyverse_app INSERT/UPDATE/DELETE on 237 each; can UPDATE account_balances and DELETE audit_logs; 11 SECURITY DEFINER routines executable by database PUBLIC, including treasury disburse/grant routines. SQL PUBLIC role is **not** equivalent to HTTP public endpoint. |
| Specific role probes | app raw `economy_post_transaction` EXECUTE=false; app treasury grant EXECUTE=true; PUBLIC treasury grant EXECUTE=true |

**Interpretation:** vault and Economy Core treasury account are different storage models, so numerical inequality alone is not proof of lost money. However, design requires a verifiable accounting bridge, and the current code exhibits direct fiscal vault and user balance mutations without corresponding balanced postings. Neither displayed VAULT_MAIN balance nor reported SWF portfolio appreciation establishes spendable funding.

## 4. Findings by severity

### P0 — verified runtime/source risks
**TR676-01 — Synthetic SWF fiscal inflows while scheduler is live.** Deployed `backend/src/admin/treasury/auto-swf.service.ts` starts automatically 30 seconds after process startup and hourly. With DB is_enabled=true it adds a **fixed 124,000 WLD** tax/enterprise dividend and simulated ~1.2% per-cycle portfolio asset appreciation with ~30% of growth 'harvested' into VAULT_MAIN, by direct `UPDATE system_treasury_vaults` and fiscal ledger inserts. The latest main adds `MONEYVERSE_SWF_EXECUTION_ENABLED`/`SCHEDULER_ENABLED` gates that are **absent from prod-v600**. Current DB repeated hourly runs corroborate execution. No matching authoritative Economy Core transfer is evidenced. Safest action is preserve evidence, inspect source/receipt provenance, and seek controlled freeze of runtime cycle. Never fix by copying vault balances to account_balances.

**TR676-02 — Treasury reconciliation always reports success.** Both current main and prod-v600 `backend/src/admin/treasury/treasury.repository.ts:getReconciliation` set `status='RECONCILED'`, `total_ledger_net_flow_wld=totalVaults`, `discrepancy_amount_wld='0'` without independently summing postings or checking ledger/obligations. The overview repeats the synthetic reconciliation. Existing balance/payout status displays therefore are not evidence of accounting integrity.

**TR676-03 — Unbalanced welfare, dividends and grants.** Existing SQL migrations `240` and `268` increment `account_balances` for beneficiaries and decrement `system_treasury_vaults` directly, writing the fiscal subledger but no two-sided Economy Core postings. `treasury_disburse_grant` accepts nullable beneficiary and no application id/idempotency receipt. Four historical disbursements in live DB establish legacy register usage, not conservation. Main currently blocks the separate Next startup application/review and citizen claim routes with HTTP 503; prod-v600 still returns fabricated success for claim and saves unauthenticated applicant identity strings in grant JSON.

**TR676-04 — Broad DB privileges and executable functions.** moneyverse_app can write 237 public tables including protected balances and audit deletions; 11 SECURITY DEFINER functions permit PUBLIC EXECUTE. The specific treasury SQL functions have actor checks in some paths; this is a powerful privilege exposure **requiring negative privilege/actor tests**, not proof of internet access or an exploit. Do not indiscriminately revoke against Production: first restore compatible DB and test dependencies.

**TR676-05 — Public treasury portal is a fictional reporting layer.** `frontend/src/app/treasury/page.tsx` and `frontend/src/app/api/treasury/overview/route.ts` call admin-only backend overview (AdminGuard) and silently substitute `25,000,000` WLD, paid/burned totals, 1,420 beneficiaries, fabricated entries `disb-101..105`, artificial timestamps and fixed eligibility and 3,200-WLD wallet. An ordinary visitor is not receiving a validated public finance read model. Remove fictitious 'paid' proof; show unavailable/unknown until a purpose-scoped public read API is verified.

### P1 — demonstrable contracts, missing end-to-end acceptance
**TR676-06 — Public budget voting bypasses identity uniqueness.** `frontend/src/app/api/treasury/proposals/route.ts` stores voting/proposals in JSON, seeds default fabricated examples, and PUT increments `votesCount` without user-vote unique key; repeated/parallel requests can count again and overwrite each other. A separate DB voting function exists but is not connected to this public page.

**TR676-07 — Reserve and spending rules drift.** Disbursement functions use 30% of current VAULT_MAIN; autonomous SWF uses an 85M absolute floor, separate 25M target, and project documentation mentions 85% cash liquidity. `treasury.repository.ts:getOverview` computes available = sum(vaults) - emergency vault with `committedWld=0`, omitting other restricted reserves, fiscal liabilities and corroboration. The same 'available' number is unsuitable for payout authorization.

**TR676-08 — Bonds/pension/enterprise business paths bypass source-of-funds postings.** Inspected `backend/src/admin/bonds/treasury-bond.repository.ts`, `admin/pension/national-pension.repository.ts`, `admin/enterprises/enterprise.repository.ts`, SWF direct account/vault UPDATE. In bond subscription, the code attempts `system_treasury_ledger.tx_type='TAX_COLLECTION'`, while the inspected live CHECK constraint excludes TAX_COLLECTION. This predicts a rejected transaction **when that path is exercised**, not a verified live failed order.

**TR676-09 — Income/expense dashboards and audit history lack provenance and domain bridge.** Fiscal journal categories and display counts are not equivalent to immutable Economy Core postings. Even the otherwise balanced 831 historical Economy Core transactions do not validate the live fiscal vault liabilities, synthetic SWF accrual, retirement/issuance, or direct balance updates.

**TR676-10 — Source/Production/DB version split.** Production `prod-v600`, Test `test-v618-7fa3f245bbc3`; main has safe blocked claim/apply grant but Production has old successful-response routes. DB migration parity is behind latest main. Never equate docs, unmerged v675 design or source-only CI with Production implementation.

## 5. Domain disposition (not exhaustive E2E)
| Treasury area | Current source/runtime evidence | Decision |
| --- | --- | --- |
| Five vaults / tax / reserves | Real tables and fiscal ledger; synthetic SWF and non-unified floors | P0 BLOCKED for automatic spending |
| Admin treasury inject/drain | Database functions operate vault, not canonical mint/retirement receipt | P0 BLOCKED for monetary semantics |
| SWF investment/auto tax | Running synthetic credit and valuation engine in Production | P0 live risk |
| Citizen dividend / targeted relief / public grant | SQL paths exist but direct projection mutations; no balanced receipt | P0 BLOCKED for settlement |
| Member claim / startup applications | Current main 503; deployed old success / JSON weak identity | P0/P1 split; not accepted |
| DAO public voting | JSON, repeatable vote; not bound to verified DB voter | P1 BLOCKED |
| Public treasury overview | Example/fictional payouts and numbers | P0 truthfulness |
| Four-way budget & protected reserve | Schema/procedures exist but policy and liability reconciliation unverified | P1 BLOCKED |
| Treasury bond / national pension / SWF/enterprise flows | Direct mutations, category mismatch and obligations not settled | P0 for fund conservation |
| Admin API/auth | AdminGuard at controller; session-level/step-up and SQL PUBLIC/ACL require explicit negatives | P0 security acceptance |
| Operations/Test/Production | Real services active; source SHA, migration and UI Test parity incomplete | BLOCKED |

## 6. Ordered remediation and evidence gates
1. **Emergency containment / authorized operator action only:** Preserve current SWF/monetary configuration, runtime manifests, last automated journal and financial snapshots. On explicit change authorization, execute a controlled SWF freeze (prefer authoritative `treasury_swf_configs.is_enabled=false` after rollback plan; only after observing actual applicable controls); do not rely solely on environment variables absent from deployed code. Confirm after one scheduled interval that *new* synthetic entries stop. No changes were made in this audit.
2. **Accounting and privileges:** Restore an isolated exact Production data snapshot in Test; trace genesis seed, 25M target, all synthetic recirculation sources and direct mutations to a journaled authority. Establish formal cross-ledger mapping rather than assert vault and treasury account must be numerically identical. Implement read-only reconciliation and fail closed on unknown discrepancy. Test 237 DML grants and 11 PUBLIC routines individually; forward-only migrations, no production blanket REVOKE.
3. **Treasury transfers:** Rework donations, taxes, bonds, pensions, budget moves, dividends, relief, grant, buyback, mint/burn using one conservation-preserving posting and idempotency contract; ledger debit/credit, fiscal subledger, reserve/obligation checks, actor audit, outbox and receipt commit atomically. Prohibit adjusting balances directly to reconcile totals.
4. **Product truth and workflow:** Separate public read model from admin auth; remove fabricated benefits, simulated payouts and random dates. Migrate DAO/venture grants to actor-bound PostgreSQL with one-vote/idempotency, pending review/approved-awaiting-settlement/paid states; no JSON-generated disbursement.
5. **Acceptance:** New branch(es), negative tests for actor/role/replay/race/reserve/error rollback, schema checksum parity with restored PostgreSQL Test, 164-page 5-pass UI incl administrator and 320–430px/mobile, exact-SHA CI/Test back+front+DB, session continuity, rollback rehearsal, fresh main/PR review, reversible zero-downtime Production promotion and verified receipt after. No gate can be bypassed by prior 'FIXED' planning text.

**Current audited outcome: no file/DB/service feature switch modified beyond documentation-only audit records.**
