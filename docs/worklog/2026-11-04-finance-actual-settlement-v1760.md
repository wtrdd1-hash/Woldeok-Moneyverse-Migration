# v2026.11.04.1760 — Real finance service recovery and canonical-money settlement

## BEFORE — 2026-11-04 19:50 KST
Owner repeatedly ordered actual SOE Treasury/NPS/KDIC/SWF/Mint/CB functionality in public Production, not cosmetic cards or read-only health. Images show SOE nominal 365,000,000 WLD and modeled dividend 108,000 WLD/hour (NOT real cash); no authorized Mint orders or certificates; Treasury 0 WLD, SWF policy 77/23 yet execution held.

Current authoritative main 8adb48015ab6781f47e339f12af830a6c9d9c63b, public Production v1742 SHA dfb98c7..., 891 journal transactions / 1829 postings / 42 balances / 0 new finance proofs. Actual Production SQL333 dynamic tax migration applied but not present in main; SQL334 Mint bounded read PR #2683 fails CI due missing SQL333, SQL335 KDIC bounded read in separate isolated branch. Other developers own tax PR #2682 and Mint #2683; do not rewrite their branch, preserve main diff, verify each before merge.

Read integration DOCS_INDEX first, then AGENTS, Treasury Core, release guide, migration-parity, previous authorizations and issue #2366. The canonical ledger is the only authority for WLD. No ad-hoc simulated dividends, auto mint to fix zero Treasury, or broad app DB writes.

## PLAN
1. Reconcile already-applied Production SQL333 with source on contributor PR #2682; verify immutable checksum, guard the rollout with full CI and provenance.
2. Restore Mint DB-backed evidence SQL334 and KDIC Test HTTP500 scoped read SQL335 in ordered branches without corrupting concurrent contributor branches.
3. Add new receipt-backed, approved Treasury/Mint financial commands only after genuine separate-approver policy and funded negative/positive tests on fresh isolated Production/Test copies; do not grant web role raw ledger DML.
4. Test backend/frontend source, migration parity, actual Test current schema and user auth/session, then execute zero-downtime production promotion with rollback.
5. Document start/mid/end and bilingual internal/GitHub changes. Explicitly separate backed funded flows from historical phantom profit obligations.
## MID — pending
## END — pending

## MID — 2026-11-04 20:10 KST
- Current Production tax migration `333-dynamic-tax-policy-and-work-income-tax.sql` is present in real PostgreSQL `schema_migrations` but omitted from current main: SHA256 `779ffa2df40bad476c87fad8b9c8f350dff272b8f05ec3969ff84b50179941e1`. Contributor branch SQL333 byte-identical.
- Tax PR #2682 full GitHub CI PASS but branch protection rejected merging old head onto current main (`405: required status checks are expected`). Protected contributor branches were **not rewritten**. Cherry-picked four original tax feature/fix commits on our new isolated branch and preserved the original SQL333 digest.
- Cherry-picked existing Mint #2683 SQL334 and DB-backed-only certificate read changes, and KDIC truthful fund source #2685 on this separate branch, without altering either contributor branch. Imported our prior KDIC access source SQL335 and fixed Test-only HTTP500 root cause using four bounded SECURITY DEFINER fund/institution/role-scoped private reads; actor guard additionally checks `admin_role_holder(..., operator)`. No direct app SELECT/DML grants were added.
- Source checks: `packages/database/test/migration-parity.test.ts` 6/6 PASS with contiguous 002-335. KDIC/Mint backend 24/24 PASS, relevant economy/KDIC/NPS frontend 95/95 PASS; contract build and both backend/frontend TypeScript PASS. No skipped tests counted as success.
- Actual Test and Production full snapshots created, checksums recorded, archive TOC validated. Test 20,908,568 bytes, SHA256 a67d1e05572e98ad6214f4ead068d2d131ca48a3098cfd206d1cf869d05f67cd. Production 136,893,909 bytes, SHA256 d5463c00fb66434cef775e8ec828ac7e09bfcfde6ba6d60a9d28b66a292ffc34. Both independently restored to distinct network-none PostgreSQL17.11 containers `mv-v1760-testclone` and `mv-v1760-prodclone` with separate PGDATA and required roles; restore exit 0.
- Attempt to apply new SQL333/334/335 into isolated Test clone was blocked by remote command tool safety inspection. DO NOT claim real DB migration, Admin role QA, Test release or Production promotion passed. Both original Test and Production DB remain untouched by v1760. Continue standard source CI through GitHub PR and retain release hold until genuine DB/HTTP authentication tests succeed.
- Owner screenshot request remains broader than this branch: unbacked SOE hourly dividends, NPS legacy periodic payouts, KDIC actual claims, SWF nominal valuations and Mint/CB authorized actual issuance must be implemented against canonical money with approvals; 0 spendable Treasury cannot pay them. Source integration here restores blocked migration order and public KDIC/Mint observation, **not** these monetary transactions.

## MID — tax auto-adjust security boundary recognized
- Identified that SQL333 grants `moneyverse_app` direct EXECUTE on the privileged no-actor `economy_auto_adjust_tax_rates()` writer. Drafted a forward-only SQL336 actor-bound wrapper and RED/GREEN regression concept, but last test was not green (test whitespace expectation), and remote safety review blocked correction. **Excluded SQL336 and its failed test from this release branch**, preserving the exact original SQL333 migration. Draft isolated outside the repo under task `unverified-drafts/`. Do not report this hardening as implemented; do not invoke auto-adjust against live Production via unverified paths. Need follow-up with DB-proven role hardening before broader monetary commands.
