# B v635 — Exact-UUID-only wallet recipient privacy

## Context and decision
- Issue #1855: wallet transfer UI promises exact-UUID-only recipient entry, while a legacy NestJS endpoint and a Next proxy enumerate member display names using unbounded `ILIKE` substring queries. A P2P modal consumes the proxy.
- Privacy-first candidate: retire both name-search HTTP routes with `410 Gone` and `no-store`, remove the backend profile lookup, and keep P2P usable with recipient-supplied exact UUID. This is an owner-reviewable product-policy change, not evidence of a production privacy breach.
- Do not touch the ledger, applied migrations, auth guards, production deployment or other workers' branches. Do not claim the P0 ambiguous transfer retry issue #1854 is solved.

## Implementation and verification
1. Isolated worktree from fresh origin/main; review QA v1367 and PR overlaps.
2. RED: backend controller privacy tests, Next proxy tests, P2P source guard. GREEN: retire discovery endpoints and replace nickname search with UUID input. Add HTTP test for 410/no-store and no profile access.
3. Reject invented P2P transaction receipts; only a canonical ledger UUID may appear as success.
4. Run targeted and full tests, lint, typecheck, build, API contract and security audit. Record real PostgreSQL and exact-SHA Test gaps explicitly.
5. Push Draft/HOLD PR; do not merge or deploy without owner approval, all gates, and an exact-SHA isolated Test.
