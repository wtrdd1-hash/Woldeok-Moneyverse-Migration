# v2026.10.15.639 — Sequential functional and financial remediation plan

Source baseline: `c03b0a9b9c3018e7257c4be1d02bcbbf44d59961`. Isolated branch `fix/sequential-functional-remediation-v2026.10.15.639`. The user explicitly authorizes staged fixing, but not bypass of independent financial/test gates. Planning authority v530 remains BLOCKED pending acceptance.

## Architecture and risk decisions
1. Fix user-visible, well-reproduced, nonfinancial defects with test-first assertions: calculator signup CTA, misleading grant-claim state, Discord attendance, career guide, help onboarding, roadmap pet and legacy business links.
2. Restore typed stock-candle invalid-ID/404/500 response handling, with negative tests. No user balance modifications.
3. Close IndexNow external arbitrary submissions with admin-console auth, same-origin and owned-domain URL validation. Add role/session and recent reauthentication to backup trigger, with guard metadata tests.
4. Fix syntax-broken bot QA and route-acceptance script argument wiring; never synthesize five-pass success evidence. Preserve failed QA gate until real browser evidence is recorded.
5. Risk-gate remaining P0 financial SQL: no live broad REVOKE or payment changes without reproducible independent PG/ledger fixtures and rollback. Prior audits document 237 writable tables/24 direct balance mutations and non-atomic settlement, so mark unverified flow BLOCKED rather than certify.
6. Recheck main mid-run, unit/TypeScript/build/API contract, isolated backend+DB Test if present, code quality, CI, backup evidence, exact-SHA staging and zero-downtime production only once authoritative gates are demonstrably satisfied.

Execution ledger: `/srv/moneyverse-tasks/fix-v639-20261015/00-before.log`; red/green test logs; mid/end records and paired GitHub/internal updates.
