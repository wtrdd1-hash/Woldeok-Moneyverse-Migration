# Banking Safety Overview — v2026.09.13.17

## User benefit
The private `/bank` overview now makes the game-only boundary explicit and gives the member one repayment-oriented next action derived from authoritative banking standing.

## Runtime changes
- Replaced real-finance-like overview wording with explicit virtual/simulated/game-only language.
- Added a prominent disclosure covering savings, credit grades, loans, interest, and virtual bonds.
- Added a safe next-action card for active-loan repayment planning.
- Shows minimum-repayment affordability and maturity context when an active loan exists.
- Preserves integer-string/BigInt WLD arithmetic and reuses the existing banking standing API.

## Reconciliation from v2026.09.13.15
The previous PR #217 was based on an older repository state. Its CI did not fail on the Banking UI change: migration parity detected duplicate migration number `163` and a missing `179` in that stale merge baseline. Applied migrations were not edited to work around the failure. Instead, the runtime change was transplanted onto current `main` so the candidate inherits the repository's current migration sequence.

## Scope
Frontend only. No new API, migration, ledger mutation, rate change, balance change, loan policy change, or bond settlement change.

## Baseline and concurrency
- Baseline `main`: `a785869ebeb8f9e3a9b5dc017cad3498685df59a`.
- Open runtime PRs were rechecked immediately before preparing this candidate. No newer open PR overlaps `frontend/src/app/bank/page.tsx`.
- Portfolio Analysis #215, Event Calendar #195, Economy Scenario Lab #189, and Casino spec #192 remain independent validation/spec candidates.
- `kuber-infrastructure` `main` remains on Test candidate `cf73d089883f7d98d21b7b25b7d4083d9e37c02f`; this Banking candidate has not been promoted to Test.

## Validation and release gate
The exact final candidate must pass secret scan, lint, typecheck, production build, database migration parity, automated tests, and dependency audit. It must then be built as immutable Test images and observed on isolated `wdmv-test` at the exact candidate SHA before any `main` or Production promotion. Production remains unchanged until those gates pass.
