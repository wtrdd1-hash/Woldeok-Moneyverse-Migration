# PvP ledger-only hold — v2026.10.17.750
Status: STARTED / security-critical financial release containment candidate, NOT deployed.
Main at start: fb8112a7df442a7b27da91bcbfd76e5ef84fccee
Isolated worktree: /srv/moneyverse-data/build-workspaces/pvp-finance-containment-v2026.10.17.750
Conflict avoidance: unmerged finance draft PR #898/#892 and treasury #871 not edited; latest main donation v744 incorporated.
Source evidence: `backend/src/casino/pvp-arena.repository.ts` joinAndPlay has direct account balance updates with no canonical ledger posting. v713 recommends Model A transfer with idempotency but not implemented. Existing waiting rooms must remain cancellable and historical battles readable. A write-disabled endpoint is safer than a pretend settlement.
Intent: TDD guard create/join against invalid non-ledger settlement, no SQL or balance write. Preserve safe list/cancel paths. No test/production promotion before exact SHA and real DB financial gates.

## Mid-work verification
- New financial hold negative tests RED (3 failed, 1 cancellation passed), then GREEN all 4 passed; frontend test initially invoked with production-mode dependency and failed React.act, rerun with NODE_ENV=test 1/1 passed.
- Full backend vitest: 1,230 passed, 396 DB tests skipped; frontend: 1,255 passed. Nest build succeeded, Next webpack 590 static pages succeeded.
- No Test/Production/db/feature-switch mutation. Exact main recheck before PR required.
