# Backend B v737 — P0 burn-draw ledger containment

## BEFORE WORK — 2026-11-02 01:02 KST
- Source: origin/main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; independent branch `auto/hourly-b-v737-security-audit-20261102-0100`.
- Reviewed AGENTS, README, canonical EN and KO project plans, QA v1450, open PRs and CI. No overlapping burn-draw PR found.
- Reproduced source-level P0: migration 263 `participate_anti_inflation_burn_draw` directly updates `account_balances`, writes legacy `ledger_entries`, has no idempotency. Backend and Next expose the write; UI advertises confirmed 10,000 WLD burn.
- No evidence of actual Production misuse. Do not touch shared databases or deployed services.

## IN PROGRESS
- [ ] RED: HTTP / BFF / SQL contract tests demonstrate unsafe settlement path.
- [ ] GREEN: block backend and BFF, disable unverified UI action, forward-only migration 324 with fail-closed function and ACL revoke.
- [ ] Verify migration against disposable PostgreSQL, targeted/full test, lint, typecheck, build, security, CI, exact-SHA Test.
- [ ] Re-fetch main and planning before PR integration; never merge or promote on failed gates.

## FINISHED
- Pending verification. RELEASE HOLD.
