# B v635 — Privacy-first wallet recipient lookup retirement (DRAFT/HOLD)

Issue: #1855. Preserve exact-UUID-only wallet transfer policy without leaking member names through legacy NestJS or Next discovery endpoints. Authenticated NestJS GET `/api/v1/wallet/recipients/search` and Next GET `/api/transfers/search` return `410 Gone` and `no-store`. P2P modal remains usable via recipient-provided UUID, with no nickname search, no unverified identity badge and no fabricated transaction receipt.

Removed the backend profile `ILIKE` search path. No DB migration, financial writes, ledger edits or new grants. Test coverage: backend direct and HTTP privacy boundary, Next proxy, P2P UI source. Owner product decision and Android compatibility are outstanding. P0 transfer ambiguous retry (#1854) remains open. All release gates must pass before merge/Test/Production; this is not a production privacy incident finding.
