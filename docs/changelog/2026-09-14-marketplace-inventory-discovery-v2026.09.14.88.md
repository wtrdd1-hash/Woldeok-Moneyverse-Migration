# Marketplace inventory discovery v2026.09.14.88

- Date: 2026-09-14
- Baseline: `d66e2477d8445f7613f3d67667fd8c2302dfaa0b` (`origin/main` at branch creation)
- Branch: `feat/marketplace-inventory-discovery-v2026.09.14.88`
- User benefit: members can search their held items, filter by category/equipped/serialized state, sort by name/quantity/recent acquisition, and see acquisition dates on the marketplace workbench.
- Scope: frontend runtime only; existing authenticated `GET /api/v1/shop/holdings` remains the authority.
- Safety: filters explicitly do not claim tradability. Listing, escrow, settlement, transfer and crafting mutations remain disabled.
- Overlap review: PR #305 changes the calendar and Living Plan files, not the marketplace runtime. Dependabot PRs are dependency-only and were not folded into this feature branch.
- Tests added: URL query normalization, repeated-parameter handling, search, combined filters, sorting and non-mutation of API results.
- No database/API contract change and no production data mutation.
