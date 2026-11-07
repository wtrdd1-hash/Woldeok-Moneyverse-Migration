# Administrator audit source-claim and private HTTP gate (v1320)

Scope: `/admin/logs` audit history. Current main renders a claim of immutable SHA-256 chain verification while the response parser only checks the hash format and cursor ordering; no cryptographic recomputation occurs on this page. Next global response headers permit indexing and caching despite page metadata. Existing authenticated Nest audit search and PostgreSQL read contract remain unchanged.

1. RED: tests require evidence-honest UI copy and actual route-scoped HTTP privacy headers (default and five supported locale prefixes), without changing public indexing.
2. GREEN: replace unproved chain verification claim with explicit integrity-verification boundary; apply private, no-store/noindex/no-referrer to the exact audit root paths.
3. Verify: focused tests, build/typecheck/lint, full suites, security, API contract, isolated PostgreSQL and HTTP where available. Keep PR draft and release blocked on any failed gate.

No DB migration, financial write, admin privilege change, other agent worktree mutation, or Production deployment.
