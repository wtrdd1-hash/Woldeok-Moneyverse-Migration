# v2026.11.03.1651 — Fix actual fiscal-epoch privilege error blocking Treasury revenue and expenditure

**Start 2026-11-03 12:55 KST; development started, Test/Production pending.**

- User requests real Treasury/Mint functionality. Production v1629 Treasury revenue panel reports unavailable. Isolated branch `fix/treasury-revenue-expense-scoped-epoch-v1651` from main `a8e967b11bc67948caf422f120410c04306657b2`; other developer's dirty security-audit checkout preserved.
- Reviewed integrated planning, Treasury/Mint policies, prior SQL 320/326/327/328 migrations and least-privilege tests.
- Read-only SQL against current live backend's actual DB as `moneyverse_app`: same query as TreasuryRepository.getRevenue failed **42501 permission denied for table treasury_fiscal_epochs**. App can SELECT system_treasury_ledger, intentionally cannot SELECT treasury_fiscal_epochs (per migration 320/327).
- Existing DB-owned SECURITY DEFINER `public.treasury_fiscal_proof_read()` is executable and returned epoch_opened_at 2026-10-31T13:53:31.686Z; scope-filtered revenue query then succeeded (zero active revenue rows at this time). Refactor revenue and expenditure filters to use that permitted narrowly scoped function, not direct GRANT on the private table.
- No monetary issuance, member account change, live transfers, raw app table privileges or legacy payout unblock.
- Mid/final: source regression, CI, official Test, Production HTTP 200 and post-release ledger intact evidence pending.

## Midpoint
Midpoint: changed the two repository SQL reads to scoped fiscal-proof function. No raw ACL escalation. 27 tests PASS. Typecheck/lint pending.
