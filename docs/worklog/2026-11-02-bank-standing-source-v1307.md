# C v1307 — Verified owner bank standing and interest presentation

## Before work — 2026-11-02 19:43 KST
- Source: origin/main `3eb1441090cb0602e054908547dcf43bfe4299dd`; isolated `auto/hourly-c-bank-standing-proof-v1307-20261102-1945` worktree.
- Read AGENTS.md, README.md, README/README.ko.md, English/Korean living plans, latest QA v1469, current A/B/C/Planning PR inventory and CI. Existing C #2518 covers casino, C #2490 saving pockets, B #243? bank privacy; this task concerns the distinct `/banking/standing` source.
- Proven gap: `/bank` accepts an unchecked `BankStanding` generic, converts raw `cash_balance`, `bank_balance`, bond principal and loan debt to `BigInt`, crashing on malformed upstream. Android GET `/app-api/v1/banking/standing` forwards success-shaped invalid data; its response privacy lacks explicit noindex/referrer. Hero fabricates second-by-second interest using rounded `Number` instead of PostgreSQL accrued amount.
- DB contract: `bank_get_my_standing(actor)` SECURITY DEFINER in migration 194, returning owner-scoped cash/deposit, rates, loan and bonds; no new schema or grants.
- Plan: TDD RED malformed/valid huge/loan/bond/Android; strict parser; web verified/unavailable and accessible retry; Android fail-closed private response; no fabricated accrued interest; targeted and full gates; official exact-SHA Test only if gates PASS.
- Release: HOLD pending every mandatory gate; protect all other worktrees and reservations.

## In progress
- Pending RED, implementation and verification.

## Finished
- Pending.
