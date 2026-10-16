# v2026.10.16.722 — Production release blocker remediation worklog

**STATUS: IMPLEMENTED CANDIDATE / PRODUCTION BLOCKED**. [한국어](2026-10-16-monetary-p0-release-v722.ko.md)

## Start and authority
- 2026-10-16 17:25 KST, MiniPC MCP Debian. Read governance, current PROJECT_PLAN, integrated master, emergency v530 UI gate, RELEASING, existing v719/v720 Test evidence, and financial findings. Original main `b7cf876e`; isolated worktree `/srv/moneyverse-tasks/promotion-remediation-v721/repo`. Other agents' worktrees untouched.
- Mid-work main advanced to `10d5dfdb` (AI-blog PR #891), unrelated source paths. Rebased current work and renamed the isolated branch `fix/monetary-boundary-v2026.10.16.722`.

## Read-only Production risk repro
- Authoritative Production application DB `woldeok_moneyverse_dev`: 241 public tables, 237 with effective application-role INSERT/UPDATE/DELETE access, including account balances, ledger transactions, mint certificates and users. App role is `moneyverse_app`. This is an observed P0 boundary defect, not a speculative concern. No Production database writes performed.
- Official Test application DB `woldeok_moneyverse_v506_test`: 183 pg_class public relation tables and 15 with effective direct writes; it lacks the three Mint policy/certificate tables. It is not a representative Production migration/ACL acceptance environment.
- Existing Production applied migration ledger: 266 files through 268; source pending 269/270/271. No re-application or alteration of Production migrations.

## Isolated production-schema reproduction
- Read-only `pg_dump --schema-only` from Production, 2,043,808-byte schema-only custom archive; **no Production user rows or account balances copied**.
- Restored to separate database `moneyverse_v721_acl_audit` inside isolated Test PostgreSQL container; 241 tables. Original Test/Production databases unchanged.
- Forward 269, 270, 271 all apply cleanly there. App raw write exposure moves **237 → 224** tables; still P0.
- New forward-only `272-hold-unaudited-mint-policy-direct-dml.sql` revokes app INSERT/UPDATE/DELETE on `mint_certificates`, `retirement_certificates`, `monetary_policy_orders`. After applying on isolated clone, rights on all three are **false**; emergency `monetary_system_status` freeze rights are deliberately unchanged. Effective direct writable table count **224 → 221**. **221 remains BLOCKED.** Not applied to Production or official Test DB.
- Added focused real-database app-role negative privilege regression: PASSED against isolated schema-only Production replica. Existing full financial DML/ledger conservation behavior has **not** passed.

## Code containment
- Prior to correction Mint certificate execution, retirement and central-bank proposal/approval paths use unaudited raw application-role DML. Added separate default-off execution and ledger-certification flags; policy/certificate mutations reject before any SQL. Emergency freeze remains operable.
- RED: four mint safety regressions failed before the code change. GREEN: four monetary-focused suites, 19 tests passed.
- Complete backend test suite: 1,222 PASSED, 396 DB tests SKIPPED (must not be counted as passing); workspace typecheck and backend build PASS. Post-rebase verification to be recorded separately.

## Release decision and next constraints
- Production remains v717; official Test remains exact v719.2. No member funds, schema, session, bot, Nginx or feature flags altered.
- v530 five full authenticated passes (166 routes including 34 admin, 31 dynamic) not completed.
- A full ledger-first structural settlement rewrite of pension, FX, bond, vault and other direct account-balance writers, verified in representative real DB, and finance ACL reduction from 221 to an accepted allowlist are mandatory before Production cutover. CI success or isolated schema-only SQL results cannot substitute.
