# Marketplace workbench v2026.09.13.20

- Selected feature: first runtime slice for Player Marketplace / Crafting.
- User benefit: signed-in members can inspect authoritative held shop items, quantities, categories and serialized instances in a dedicated `/marketplace` workbench.
- Baseline: current `main` `6ad8304ac743366ae8b9bc445934160b0eaecdee` plus latest migration-parity/banking candidate #224 `abdb75e48907f6326386c40b7b6413aa990c45b0`.
- Overlap review: #224 changes Banking and migration parity, not marketplace UI; using it as the branch baseline preserves its newer database-tree state without overwriting concurrent work.
- Runtime scope: frontend-only member page plus a discoverable link from `/shop`; no new API, database migration, ledger mutation or marketplace settlement path.
- Safety: listing, purchase, transfer, escrow and crafting mutations remain disabled until an atomic server/database contract is implemented and validated.
- Validation: PR CI is required before Test candidate creation. Exact-SHA isolated Test verification remains mandatory before merge/promotion.
- Infrastructure: `kuber-infrastructure` main remains `18eed320d3ae1eb2f29b32c11a0a9db8ffcebaf3`; Production is unchanged.
- Cleanup: superseded remote refs remain pending because all authorized remote devices are offline and the current GitHub connector does not expose delete-ref mutation.
- Remaining risk: the workbench is read-only; marketplace listing/escrow/settlement and crafting recipes are still unimplemented.
- Next priority: implement the server/database marketplace contract, then crafting recipes/settlement, while keeping inventory provenance and ledger invariants intact.
