# Marketplace rarity filter v2026.09.14.89

- Baseline: app PR #306 exact head `43e85c4001bf5bde0664a7e91308a21145618132`, already resynced to current `main` `aea77def54ac4b839bb0299781253e9824ac8982`.
- User benefit: members can narrow held marketplace inventory by the authoritative `rarity` value in addition to search, category, state, and sorting.
- Scope: frontend only; no backend, API, database, economy, listing, escrow, settlement, transfer, or crafting mutations.
- Concurrency: calendar PR #305 and Dependabot PRs were reviewed and do not overlap these marketplace files.
- Release gate: this stacked change must not reach `main` or Production before its exact SHA passes CI and isolated Test. The Test environment remains fail-closed while GitOps declares a newer candidate than the public runtime serves.
