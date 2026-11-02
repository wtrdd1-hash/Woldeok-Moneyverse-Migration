# v1623 Verified Treasury & Pension Recovery Plan

> For agentic workers: follow systematic-debugging, TDD RED/GREEN, and verification-before-completion.

**Goal:** Restore provably funded, newly created Treasury/NPS transactions and truthful failure states while preserving historical financial holds without generating phantom WLD.

**Architecture:** Test DB-owned `treasury_core_post` against a fresh isolated clone; trace public BFF/Nest session, CSRF and DB evidence boundaries; fix only reproducible defects in a narrow separate branch. Keep legacy 552 Treasury / 744 SOE dividends separate from newly certified funds.

**Stack:** PostgreSQL 17.11, NestJS, Next.js, Vitest, systemd/Nginx on miniPC.

## Gates and tasks
- [ ] Record snapshot counts, original account invariants, checksum of full backup, and isolate from live Production.
- [ ] Test funded NPS contribution of exactly 1,000 WLD on a clone with a real positive-balance member, validate two postings, unchanged total supply, escrow+wallet deltas, event/outbox and one immutable receipt.
- [ ] Replay same idempotency key and assert no duplicate money; reject mismatched key, insufficient funds, cross-member key and invalid inputs; test funded NPS full early withdrawal 95/5 split, two escrows and balances; safe rollback negative and no historical rewriting.
- [ ] Diagnose direct API and BFF auth/403/503 semantics for pension/KDIC and implement only reproduced defects, with failing tests written first.
- [ ] Run affected tests, whole typecheck/lint/build and CI. Recheck `main` SHA before integration. Don't promote any failed financial gate.
- [ ] Independently verify official Test and Production exact code+DB identities, backup/restore and canary cutover where permitted. Record start/mid/end plus EN/KO internal/GitHub updates.

## Release safety
Do not turn legacy mint or pension payouts on because a read API returns 200. Never backfill canonical transaction IDs without original evidence. Preserve 552/744 historical events, financial balances, active sessions and prior release units.
