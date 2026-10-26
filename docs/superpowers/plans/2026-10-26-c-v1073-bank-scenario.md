# C v1073: Bank Liquidity Scenario Truth — Implementation Plan

## Decision
The live `/bank` analytics component receives a member's verified bank balance, active loan debt and credit limit from the authenticated banking standing API. It must not extrapolate these to institution-wide utilization, legally reserved assets, or guaranteed withdrawal capacity. Keep the existing kinked-rate *mathematical demonstration*, but never present its output as an applied contract rate or actual reserve.

## TDD and implementation
1. Add `frontend/src/app/bank/bank-liquidity-card.test.tsx`: with zero debt, no fabricated 35% usage; no 100% guarantee/legally frozen funds; empty deposit shows unavailable model rather than false rates; with debt show modeled ratio, and separate verified credit limit. Run RED.
2. Change `frontend/src/app/bank/bank-liquidity-card.tsx` to compute using bankBalance and loanDebt exactly; zero deposit → explanatory empty state; distinguish modeled 20% reserve and model rates, member actual loan/credit limit, and disclose no actual legal guarantee. Add screen-reader status, mobile responsive layout.
3. Clarify misleading legacy doc comments in `frontend/src/app/bank/kinked-interest.ts`; keep the mathematical contract unchanged. Run focused GREEN.
4. Re-fetch main and canonical planning, verify branch isolation; run full lint, typecheck, build, unit, integration, app-api, PostgreSQL, security and E2E gates; post PR only with accurate status. Never merge or deploy on failure.
