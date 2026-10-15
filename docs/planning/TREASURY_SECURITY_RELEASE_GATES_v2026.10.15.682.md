# Treasury secured read model and financial rollout gate — v2026.10.15.682

**Status:** implementation candidate. No money movement, no production software deployment. The user approved promotion only when every safety condition is met.

## Authority and observed defects
- Follow PROJECT_PLAN / INTEGRATED_PLANNING_MASTER and prior finance v523/v542, plus v676 audit and v678 planned reconciliation.
- Production prod-v600 has an hourly SWF model that fabricated fiscal inflows. At 2026-10-15 14:51 KST, authorized emergency setting was turned off after independently verified encrypted database/photo backup. At 15:18 KST, is_enabled=false and no new FEE_RECIRCULATION record since switch-off. Confirm again after 15:47 scheduled interval.
- Read-only restored Production database: separate \`wdmv_treasury_v680\` (266 historical migration entries), applied 269–271 **in this isolated copy only**. However, the 269 \`treasury_deposit_donation\` function fails upon invocation due to nonexistent ledger_transactions.tx_type; 271 removes public direct SELECT for the app role from vault and fiscal journal, so proposed v678 admin reconciliation direct SELECT fails under the new role. Existing broader Treasury admin overview has additional raw SQL paths requiring independent privilege repair.
- Historical treasury-vault balances and 15,139,295 WLD subsidiary journal discrepancies are not spendable Economy Core funds. Do not clone those numbers into Core, mint, disburse, or mark as RECONCILED.

## Narrow v682 development
Create an operator-authorized, purpose-scoped SECURITY DEFINER read-only PostgreSQL function for Treasury reconciliation. It must use the same independent per-vault movement / continuity algorithm and emit aggregate numeric strings only; REVOKE PUBLIC execute and grant exactly to moneyverse_app. Server controller must derive actor user UUID from the authenticated admin session and pass through service/repository. No arbitrary actor supplied by frontend or query parameters. Existing entire admin overview still needs a separately audited privileged read model: **do not promote** until this and finance ACL contract are complete.
Tests: absent fn pre-migration RED, anonymous / nonoperator denial, direct table SELECT denied as app, operator scoped SELECT accepted, 0-vault SQL behavior, real data discrepancy response. Source Vitest red/green and contract/build.

## Hard promotion prerequisites
1. SWF remains disabled after next scheduled hourly execution; recoverable backup and source evidence preserved.
2. 269 broken donation call and legacy direct-balance update disbursements fixed in new forward-only migration without money creation; test full roles/negative and settlement atomicity.
3. Real Test frontend/backend/db all run **the same SHA**, with schema migration/checksum parity and session continuity. Existing Test reported v618 pointers but backend 888311cc; running tests alone does not count.
4. Backup/rollback, production canary readiness and Nginx zero-downtime transition proven; users' sessions and actual balances unchanged; no prior P0 remains.
5. Merge newest main only after independent review and corrected Test evidence. A documentation/CI green PR alone is NOT production promotion.
