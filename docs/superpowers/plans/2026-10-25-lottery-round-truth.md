# Lottery Round Truth — P0 bounded design and implementation plan

## Problem
The /tools lottery card invents winning numbers, historical draws, user tickets, jackpot, burn and success after a client-only timer. This is unsafe monetary copy. Existing national_treasury_lottery_rounds is a read-only public source of round records, but neither ticket purchases nor payouts have a ledger-backed command.

## Decision
Deliver a public, read-only, verified round-status feature, not a ticket purchase feature. No personal tickets, payout or actual burn claims. Display only round number, DB status, draw schedule, ticket price, recorded jackpot pool and settled winning numbers, never fabricated values. On unavailable DB render explicit unavailable; distinguish confirmed empty from failure. No writes, no new migration. Preserve public static /tools SEO via no-store Next route after hydration. Android uses same Nest GET via app gateway.

## Steps
1. Write failing Nest repository/controller tests: bounded SELECT, string money, DB unavailability, invalid row, no writes.
2. Implement backend/src/lottery repository/controller/module and register app.module.ts; read-only query; strict normalization; 503 on failure.
3. Write failing frontend parsing/route tests and Android gateway path assertion.
4. Implement /api/lottery/rounds, app gateway group and client card; no fake purchase/hard-coded draws; loading/empty/error/settled/open, accessibility/no-store.
5. Run focused/full tests, lint/typecheck/build, security scans, isolated PG role/rollback, CI. Recheck main/plan before PR; merge/deploy only on all green gates.

## Explicit exclusions
No ticket purchase, payout, ledger mutation, proof-of-fairness or actual WLD burn. These require a separately reviewed SECURITY DEFINER + idempotent ledger-backed design. Any missing schema, unauthorized role or unverified release gate means HOLD.
