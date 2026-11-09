# Funded Treasury Issuance and Truthful SWF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans, test-driven-development, and verification-before-completion; do not invent settled money.

**Goal:** Give a signed-in administrator two distinct, auditable ways to fund Treasury and remove unbacked SWF automatic-investment success claims.

**Architecture:** A personal contribution calls existing canonical `treasury_user_donate`: member-owned WLD decreases, Treasury increases, double-entry and epoch event share one transaction ID. Authorized new issuance requires a separate MINT/TREASURY_ISSUANCE policy, ledger `MINT -> TREASURY`, exact fiscal vault event, mint certificate and settlement receipt, all in a single PostgreSQL SECURITY DEFINER transaction. Respect existing issuance freeze, per-policy cap and token replay; never derive new cash from SWF portfolio marks. Automatic SWF remains fail-closed until a verified trade/settlement execution engine exists; add clear blocked/available-cash status rather than simulate investment profit.

**Tech Stack:** PostgreSQL 17.11, NestJS, Next.js, Vitest, GitHub Actions, English canonical and Korean second-language docs.

**Spec:** Existing docs/TREASURY_AUTONOMOUS_SWF_SPEC.md, migration 244/314/327/329/343/344 and PR #3000 v1948 runtime proof; current living implementation plan supersedes historic assumptions.

## Global constraints
- No production writes for test, no reset of user balances or historical archive and no automatic unfreeze; current `is_issuance_frozen=true` must remain true unless an authenticated admin explicitly acts.
- Maximum 10,000,000 WLD per direct Treasury MINT execution, positive integer exact strings, non-expired approved policy ceiling, per-request UUID replay, DB active role and no direct table INSERT grants to moneyverse_app.
- Real Treasury result requires double-entry proof, money balance update, central vault update, matching `system_treasury_ledger` source and immutable mint certificate+receipt; no certificate-only auto-credit label.
- Automatic SWF must not credit balance for modeled gains, `COMPOUND_GROWTH_CYCLE` or `PORTFOLIO_LIQUIDATED_TO_VAULT` without actual signed execution receipt. Current portfolio AUM 20,000,001 WLD is legacy simulated AUM, not spendable WLD.
- Isolated PG17 clone with pg_dump backup, no outside traffic, full regression and test→production exact SHA gate. Stop before Production changes if source/proof fails.

## Tasks
- [x] TDD / SQL contract: test missing Treasury issuance policy target, bounded canonical settlement, idempotency/actor/hold negatives. RED, implement forward-only migration 345, GREEN in isolated PG17 rollback.
- [x] TDD / HTTP: Backend controller/service and frontend same-origin BFF for Treasury issuance with idempotency UUID, amount and error mapping; reject certificate-only channel for Treasury.
- [x] TDD / UI: Admin own-cash donation form backed by `treasury_user_donate`, distinct Treasury Mint policy/action, show actual issuance frozen state; mobile and error states.
- [x] SWF correction: truthfully report `executed=false` without a verified settlement path; never auto-generate positive profits. Build explicit blocked reason and missing/available funding distinction, unit tests.
- [ ] Typechecks, affected Vitest, migration parity, restored production PG17 role/rollback, official Test exact SHA and full CI; only then backup + staged rollback promotion if feasible.
- [ ] EN/KO worklog start/mid/finish, internal/GitHub change notes, exact versioned artifact, PR and GitHub main fetch before merges.
