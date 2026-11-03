# v2026.11.03.1628 — Admin finance evidence freshness and source separation

**Status: SOURCE TESTED; TEST/PRODUCTION RELEASE PENDING.** [한국어](2026-11-03-finance-admin-freshness-v1628.ko.md)

## Start / authority
User reported screenshots showing KDIC 552/552 unlinked, NPS AUM 50,000 WLD, central bank 4,841,510 WLD, state holdings 365,000,000 WLD, with payout buttons paused. Start `origin/main=00a770ed7dadfd70f57189afe05b14d08f30f62f`; isolated worktree `fix/finance-admin-freshness-v1628` to avoid other workers' changes. Read current integrated plan, v1626.6 finance Production worklog, source controllers/repositories, frontend pages, documentation governance and QA records.

## Verified actual Production evidence (read-only)
- Verified public Nginx backend port 4214 / Next frontend 4215; read the active backend process `DATABASE_URL` privately, never printing credentials. Connected with `moneyverse_app` and `BEGIN READ ONLY` to the same `woldeok_moneyverse_dev` DB used by current Production.
- At approximately 08:56–08:58 KST: 891 canonical transactions, 1,829 postings, 42 accounts, **account sum 0 WLD**. Crucially this does NOT mean cash is absent: `USER_CASH=4,783,802`, `USER_BANK=57,708`, member cash+bank **4,841,510 WLD**. Treasury account **0**; Mint account **-5,078,810**; Sink account **237,300**, escrow accounts **0**. Do not cancel or reset a member's positive asset to force an aggregate sum.
- Active `system_treasury_ledger`: **0 total / 0 unlinked**. All five treasury vault projections sum 0 WLD. `pension_public_overview()` returns **0 AUM / 0 subscribers / 0 retired / 0 paid / 0 vault** and pension/ welfare escrow accounts are zero. Three state enterprises have **365,000,000 WLD NOMINAL model assets**, not spendable Treasury funds. Mint certificates 0; issuance freeze flag false does NOT authorize unsupported monetary issuance.
- Screenshot KDIC evidence was checked at **2026-11-02 23:13 KST**, before the v1626.6 reset that archived previous 552 legacy Treasury rows. 552 is not current live unlinked count. Screenshot pension 50,000 is likewise inconsistent with new `pension_public_overview` 0. Central bank 4,841,510 equals real member cash+bank balances, not a false extra Treasury balance.
- Existing UI already has `dynamic=force-dynamic` but client panels retain `useState(initialData)` across tab sleep/resume; manual refresh only. A mounted tab can continue displaying pre-reset data.

## Remediation / interim
- Introduce an isolated read-only finance-resume hook: revalidate on mount where applicable and on page focus/pageshow/visibility resume, 15s minimum interval to avoid request bursts.
- KDIC refuses initial ledger proof older than five minutes (or from the future >30s), clears stale snapshot before no-store dual endpoint refresh, and does not claim refreshed amounts on failures.
- NPS clears pre-reset initial AUM/payout data and automatically refetches both owner-protected endpoints; invalid results remain unknown, never fabricated zero.
- Central bank revalidates on focus, clearing stale monetary snapshot and using error state on failure. Enterprise control tower refreshes its dynamic server evidence on focus; independent model asset labels remain explicit. No finance write API modifications.
- Tested 17 targeted Vitest tests PASS, including old 552 evidence suppression and pre-reset 50,000 NPS replacement. Typecheck and scoped ESLint PASS. No DB changes, financial payments, administrator session bypass, or Production deploy claimed in this source step.

## Closeout
Pending GitHub CI, immutable Test source, authenticated UI verification, and Production cutover evidence.
