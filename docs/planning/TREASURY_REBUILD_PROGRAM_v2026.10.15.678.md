# Treasury-wide Rebuild Program — v2026.10.15.678

**State:** staged P0 engineering; no authorization for production payments. [Korean](TREASURY_REBUILD_PROGRAM_v2026.10.15.678.ko.md)

## Authorities and accounting invariants
Project Plan → Integrated Planning Master → adopted v523 monetary/treasury/Economy Core and v542 integrity policy. References: merged product v675 review; v675 grant draft PR #857; v676 audit PR #859.
Taxes, grants, dividends, pensions, bond coupons and budget transfers must move existing WLD, not mint new supply. The Central Bank authorizes policy; the Mint issues/retires only approved amounts; the Treasury earmarks/disburses existing funds; Economy Core alone settles immutable balanced ledger entries and receipts.
Reported vault cash, independently proven monetary backing, and spendable unencumbered funds are three distinct concepts. Spendable = max(0, verified backed cash minus legally/policy protected reserves minus pension/bond/coupon/refund liabilities minus already approved commitments). If any component is unknown, fail closed. The 30% reserve, 25M cash target, 85% liquidity policy and 85M current reserve configuration need one approved denominator, priority, liability definition and rounding contract.

## Domain-by-domain build matrix
| Domain | Existing code or migration | Required work | P0 negative acceptance |
|---|---|---|---|
| Five vaults + subsidiary ledger | SQL 224, 241 | Opening source mapping, Core receipt cross-reference | No cash from synthetic opening |
| Recon and available funds | TreasuryRepository | v678 real per-vault journal net, continuity, UNVERIFIED | No fake reconciled/0 result |
| SWF and enterprise cash flows | auto-swf.service, SQL 249/250/258 | Stop synthetic 124k income, separate 1.2% valuation from realized cash | No scheduled phantom money |
| Tax, donation and FX | SQL 242/268, FX repository | Source party debit and Treasury credit, exact tax rate | Rollback, replay, user balance conservation |
| Inject, burn and mint | SQL 224 and mint bureau | Signed monetary authority and paired posting/retirement evidence | No direct unauthorized balance change |
| Budget 40/30/20/10 | SQL 241 | One surplus base, earmark vs spend vs burn, protect liabilities | Double commitment refused |
| Dividend/welfare/grant | SQL 240/268, JSON applicant | Verified recipient ID, eligibility, separate approval/settlement and receipt | Repeat/forged user, insufficient balance |
| Treasury bonds and pension | Bond and NPS repositories | Principal/coupon liability, verified cash; fix TAX_COLLECTION constraint | No artificial interest or double maturity |
| Public treasury portal | /treasury and /api/treasury/overview | Verified public-only read API, remove fake payouts/timestamps | Outage displays unknown, not paid |
| DAO/votes | JSON proposals, SQL 241 | Authenticated actor, DB uniqueness and atomic tally | One member cannot vote repeatedly |
| Financial DB security | SQL 269–271 | Restored-Test DML and PUBLIC EXECUTE restrictions, forward-only migration | Non-admin privilege denial |
| Release | prod-v600/Test-v618, source main | Exact-sha front/back DB, session, backup, rollback | No promotion with unmet gates |

## Financial command protocol
Request must bind session actor, policy version, integer WLD string, canonical account/beneficiary, immutable idempotency key, audit reason and funding reference. Statuses: PENDING_REVIEW → APPROVED → RESERVED → SETTLED; REJECTED/PAUSED/FAILED never imply payout. Within one locked transaction verify funding and reserve, post double entry, subsidiary fiscal journal, audit, outbox and receipt; commit all or none. Duplicate key returns the same immutable receipt only if request hash is identical. Never compensate by direct balance UPDATE.
Legacy VAULT_MAIN and VAULT_EMERGENCY balances are not assumed to equal the Economy Core TREASURY account. Opening seeds, 25M anchor changes, SWF valuation and bond/pension liabilities must be classified as verified/legacy/simulated/unresolved before any transfer. Corrective entries need documented evidence and reversible journal, never a silent overwrite.

## Release slices
G0: preserve evidence and obtain operations approval to freeze the deployed hourly synthetic SWF; test that new synthetic entries stop after a full interval.
G1: v678 candidate — real fiscal reconciliation, UNKNOWN or DISCREPANCY UI, conservative admin spendability; TDD and read-only DB evidence.
G2: restored isolated PostgreSQL Test DB funding bridge, legacy provenance, liability reserve, function ACL and migration parity.
G3: separate atomic settlement PRs for taxes, SWF, budget, bonds/NPS, dividends/welfare and grants; real DB idempotency/race/overflow/security negative tests.
G4: public finance truth, member grant workflow and DB 1-user-1-vote DAO; EN canonical/KO second, mobile 320–430px.
G5: exact-SHA CI and Test backend/frontend/DB, admin & member E2E, full UI 5-pass, session continuity, rollback rehearsal; only then reversible zero-downtime Production promotion.

## Live evidence, not a correction instruction
On 2026-10-15 ~13:47 KST read-only fiscal vault-journal checks identified MAIN 45 WLD and EMERGENCY 15,139,250 WLD per-vault differences (absolute total 15,139,295 WLD). A MAIN entry at 2026-10-07 03:43 UTC began 45 WLD below its predecessor’s reported closing balance. No unapproved journal correction is authorized.

## Sources
- [IMF Treasury Single Account](https://www.imf.org/en/publications/wp/issues/2016/12/31/treasury-single-account-concept-design-and-implementation-issues-23927)
- [PostgreSQL 17 business invariants and concurrency](https://www.postgresql.org/docs/17/applevel-consistency.html)
- [PostgreSQL default PUBLIC function privileges](https://www.postgresql.org/docs/18/ddl-priv.html)

**Neither production freeze nor full Treasury redevelopment is declared completed here.**
