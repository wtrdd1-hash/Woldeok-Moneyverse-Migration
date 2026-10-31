# P0 Bank Pocket Durable Customization Replay — Implementation Plan

**Goal:** Prevent any pocket style mutation or WLD charge from reusing a previously committed idempotency key with a different intent, including concurrent requests and ambiguous retries. Restore the minimal missing pocket table/function on fresh schema; preserve release HOLD for other missing pocket operations and UI quote mismatch.

**Source evidence:** Issue #2070, DEV read-only `pg_get_functiondef(bank_customize_pocket)` and `economy_post_transaction` (2026-10-31 01:35 KST). DEV's ledger hash binds pocket+cost but not theme/icon, and the existing function changes style even on replay. Fresh 002..312 has no pocket table/function. DEV app role has direct UPDATE on the pocket table. Prior API boundary PR #2069 requires UUIDv4 but is not included in this SQL branch.

**Branch:** v671 from main `bf8d0d48` through migration prerequisite #2058 (313). New migration 314 only, never edit applied migration. PR base #2058. Do not merge or deploy without all gates and PR #2069 integration.

**Contract:** `bank_customize_pocket(uuid,uuid,uuid,text,text)` retains exact return columns. Canonical theme/icon are trimmed nonempty defaults (`sky`, `piggy-bank`) and max 32 chars. Transaction-scoped advisory lock on key BEFORE replay lookup; durable receipt keyed by UUID, binding actor+pocket+theme+icon, original cost/remaining cash and ledger transaction. Same payload returns original response; changed payload and unknown legacy ledger key fail closed; cross-actor denied. Owner scoped pocket row lock; economy_post_transaction performs double-entry charge; receipt/style/ledger in one transaction. No direct app table access. Legacy DEV 100 WLD cost is preserved as a compatibility value, **not approved pricing**; UI currently advertises 100/300/400 WLD and must be reconciled before release.

## Tasks
1. Write real PostgreSQL regression tests for same-key replay, changed payload, cross-owner, ACL and concurrent same-key; run RED on disposable 313 schema (missing table/function).
2. Implement forward-only 314: create minimal bank_saving_pockets when absent, durable receipt table, scoped definer function, grants and revokes; do not touch legacy text-key overloads.
3. Apply full 002..314 migration sequence to disposable PostgreSQL 17, run tests GREEN, inspect posting/balance invariants, run static/lint/typecheck/build/security/API/CI gates.
4. Re-fetch main and plans, inspect diff and tests, commit and push independent Draft/HOLD PR stacked on #2058; record API/DB contract and blockers, no Test/Production mutation.

**Release HOLD:** missing clean-schema list/create/transfer/archive functions, exact price quote/UX parity, failing full suites, CI, exact-SHA Test, independent restore, Production provenance #1984. No shared DEV/Production DB writes.
