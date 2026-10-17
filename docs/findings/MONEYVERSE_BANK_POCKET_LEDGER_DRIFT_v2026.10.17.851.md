# P0: Saving Pocket Ledger/Projection Divergence — v2026.10.17.851

**English canonical** | [한국어](MONEYVERSE_BANK_POCKET_LEDGER_DRIFT_v2026.10.17.851.ko.md)

**Status:** Read-only live database introspection **confirmed unsafe SQL path**, remediation **NOT IMPLEMENTED**, Production release **BLOCKED**. 2026-10-17 KST.

## Authority and evidence

- Audited the backend service's database `woldeok_moneyverse_dev` using read-only PostgreSQL `pg_proc.prosrc`, `pg_trigger` and grants metadata via the authorized miniPC MCP, plus official release financial preflight with `REPEATABLE READ READ ONLY` and rollback. No user-level data or bank write requests were executed.
- `public.bank_transfer_pocket(p_key uuid, p_user_id uuid, p_pocket_id uuid, p_direction text, p_amount bigint)` is `SECURITY DEFINER`, owned by `moneyverse_migrator`, executable by `moneyverse_app` (definition `md5(prosrc)=b939d1c53e8c4856644f4d443fab44d9`). The body updates `public.accounts.balance` and `public.bank_saving_pockets.balance` directly for deposit/withdraw. It never calls `economy_post_transaction`, never writes `ledger_postings` or `account_balances`, and merely checks `p_key IS NULL`; key replay is **not enforced**. It requires directions `deposit`/`withdraw`.
- `public.bank_get_my_standing` reads `public.account_balances.available_amount` for `USER_CASH` and `USER_BANK`, not `accounts.balance`. There were **no user-defined triggers** on `accounts`, `account_balances`, or `bank_saving_pockets`. **A pocket transfer can therefore mutate legacy cash but not the displayed/canonical cash projection or ledger.** This is an architectural integrity defect; no claim that a particular user's money was lost.
- `public.bank_archive_pocket` charges **500 WLD** via the canonical ledger, then returns the full pocket balance via **direct `UPDATE public.accounts`**, leaving the canonical projection and journal untouched for the refund (function MD5 `b48e8fc7e647c8f6c1c713f9df1c3a70`). The UI did not disclose the 500 WLD fee before this patch.
- `public.bank_customize_pocket` charges a fixed **100 WLD** per call, while v851 pre-fix frontend advertised 100 WLD for color plus 300 WLD for icon, potentially 400 total (function MD5 `3f45ae40e0a6ffe4b9645c4157641d2c`). v851 source now shows the observed actual flat 100 WLD and computes affordability with `BigInt`; server contract must be versioned with future pricing.
- `public.bank_create_saving_pocket` has **no idempotency argument** (function MD5 `6731a84a7af9f1efdd1636253d414601`); the current Nest controller DTO requires `idempotencyKey` but repository does not forward it. Duplicate creations on retry remain possible. The source patch adds the required request field, but **does not claim durable creation idempotency**.
- `grep -R` of checked-in `packages/database/**/*.sql` did not find definitions for these four pocket functions. This database-to-migration provenance gap must be resolved before changing them; editing existing migration checksums is prohibited.

## Read-only financial release gate — failed

Actual service-database probe: **BLOCKED**, 40 balance rows, 19 uncertified ledger/projection discrepancies totaling +4,779,188 WLD; five balances without postings totaling +2,627,807 WLD; all five core financial tables directly writable by `moneyverse_app`. No unbalanced journal transactions or orphan journal transactions found. Opening balances, treasury supply and runtime behavior are not certified. This is not evidence of theft/loss.

## Safe remediation design (NOT YET EXECUTED)

1. Recover actual historic `bank_saving_pockets` balances, account projections, journal origins, original migration/DDL receipts and backup/restore proofs; determine the recognized source of funds and liability before opening any escrow account. Record all differences without changing money rows.
2. Write **forward-only numbered migration(s)** implementing atomic, actor-bound saving-pocket transfers as two-sided canonical journal transactions with explicit custodial/escrow liability and an immutable receipt. Enforce the same key advisory lock, replay ownership check and idempotency semantics as migration 045; never update `accounts.balance` to emulate ledger postings. Treat archive balance-return and fee as separately traceable, replay-safe operations.
3. Add unique replay receipts for pocket creation, and verify caller authorization and target-amount limits. On theme changes enforce at-most-once ledger fees and source-of-truth pricing exposure; owner/role checks and account locks inside DB functions. Revoke excessive application DML only via reviewed privilege migration and Test negative checks, not by broadening grants.
4. Reproduce deposits, withdrawals, abort/rollback, insufficient funds, duplicate same-key concurrent requests, key reuse by a different user, huge WLD amounts, archive refund, zero-sum and projection conservation in a **disposable restored Test database** with production-shaped data. Include negative ACL and owner-isolation checks.
5. Require fresh finance gate **PASS**, exact Test SHA identity, full authenticated member/admin UX, session preservation, recovery drills and zero-downtime canary before even considering Production promotion. No undocumented waiver or balancing plug.

**Disposition:** v851 PR repairs request-contract and pricing disclosure only; database pocket movement path and full Production gate remain **P0 BLOCKED**.
