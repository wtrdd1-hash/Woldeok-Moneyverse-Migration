# Internal worklog — v2026.09.17.172

Scope: local Bootstrap adoption and shared UI refinement.

- Started from `origin/main` at `d398f6e` in an isolated worktree.
- Re-read the current draft planning branch `docs/plan-v171` before implementation and again mid-run; runtime changes remain branch -> CI -> exact-SHA Test -> main -> Production.
- Downloaded Bootstrap 5.3.8 compiled distribution to the secondary drive and verified SHA-256.
- Added `bootstrap@5.3.8` to the frontend workspace so Next bundles it locally; no jsDelivr/CDN URL was added.
- Added product-scoped shell/card/button polish without changing application business logic or backend APIs.
- Validation: diff check pass, typecheck pass, 614/614 frontend tests pass, production build pass.
- Initial direct frontend typecheck failed only because `@moneyverse/contract` had not yet been built in the clean worktree; building the contract restored the expected workspace precondition and typecheck passed.
- Database migrations: none. Backend behavior change: none.
- Rollback: revert this version commit; secondary-drive vendor archive may remain as inert source material.
