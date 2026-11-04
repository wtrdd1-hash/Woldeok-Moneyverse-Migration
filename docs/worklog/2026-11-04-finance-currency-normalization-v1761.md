# v2026.11.04.1761 — Canonical WLD currency integrity (legacy W alias)

## BEFORE — 2026-11-04 KST
User commands actual functioning financial services and accurate canonical money, no fake issuance. Reviewed master DOCS_INDEX, AGENTS, TREASURY_CORE, RELEASING and current main (8adb48015ab6781f47e339f12af830a6c9d9c63b). Separate PR #2705 current branch HEAD 50fa251efad88e613b4ca67a3c4e8be075d5333d is running full CI after SQL333-335. This work is isolated as the NEXT migration SQL336 and must not conflict with contributor branches. No real WLD writes or original financial records modified in staging.

## ROOT CAUSE
Read-only actual Production inspected: two active USER_CASH accounts use obsolete currency W character(3), values 1,066,011 and 1,076,011, sum 2,142,022, four canonical postings in those accounts. Neither user has a second WLD cash account; existing unique index one_user_account_per_type prevents same-user cash duplication. All 42 balance rows globally zero-sum with MINT -5,078,810 and SINK 237,300; member WLD-only cash+bank 2,699,488, but counting legacy W user-cash alias yields 4,841,510. Future functions requiring currency WLD can exclude these legitimate funded members; doing nothing leaves underreported WLD-specific liquidity and blocks their Treasury/NPS operations.

## PLAN
- TDD source and PostgreSQL read-only conservation proof; forward-only migration SQL336 to normalize W alias to WLD without changing any account ID, user ID, available_amount, postings, immutable receipts or supply.
- Assert exact currency schema context, existence/uniqueness, per-account postings/balance equality, global balanced journal, and no hidden other non-WLD currency before account updates. Preserve per-account normalization evidence; ensure migration rerun fails or idempotent as appropriate.
- Stop creation of new obsolete W accounts with a validated CHECK constraint when safe, while preserving all other access policies.
- Exact Test and Production clone SQL review+CI, authenticated Test operational transactions/session continuity and no-downtime Production promotion. No customer-balance reset.
- Versioned EN/KO internal and GitHub logs, before/mid/end, recheck main before completion.
## MID — pending
## END — pending

## MID — TDD and source proof
- After offline workspace dependency install, saw RED due missing migration SQL336. Implemented forward SQL336 that accepts only previously active USER_CASH W accounts with valid posted balances and globally zero-sum ledger; moves only accounts.currency W->WLD, retaining account IDs, owners, balances, transactions/postings and supplied user money.
- Per-account immutable SHA256 currency-code normalization evidence is inserted only for the alias accounts, app role loses all direct writes and new CHECK prevents reintroducing W on future accounts. Migration aborts before commit on unknown currencies, bad journal projection, global imbalance or mismatch in moved count. The small accounts metadata change holds an account-table write lock during the atomic transition to prevent races.
- Targeted source tests 2/2 GREEN. Separate repeatable READ ONLY post-migration proof saved as packages/database/test/finance-currency-alias-v1761.verify.sql; no actual financial Production/Test DB mutation or promotion claimed. Actual Production read-only two W member accounts have 2,142,022 in stored W alias and lack duplicate WLD cash, so this is an account code normalization, **not** a transfer or new issuance.
- This is an independent SQL336 stack based on PR #2705 source 50fa251...; CI and execution on restored real Test/Production databases must pass before any public release.
