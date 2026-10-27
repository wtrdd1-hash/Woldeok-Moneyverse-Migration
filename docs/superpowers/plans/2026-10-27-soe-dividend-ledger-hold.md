# SOE dividend remittance P0 containment (B v586)

## Evidence and scope
Main c2a9306d; issue #1080. `EnterpriseRepository.distributeSoeDividends` performs nontransactional ledger insert, dividend-log insert, and vault UPDATE. It has no unique remittance key or authoritative balanced economy ledger. Retries or partial failure can create duplicate or inconsistent WLD treasury records. This is a source-backed risk, not proof of Production loss.

## TDD plan
1. RED: service rejects harvest with HTTP 503 without repository or Discord calls; repository rejects direct calls before any SQL; Next.js proxy returns 503 without forwarding; admin UI shows a disabled remittance control with explicit ledger-hold notice.
2. GREEN: replace unsafe repository implementation with fail-closed exception; guard service; hold Next.js proxy and remove synthetic success/log mutation; retain read-only list, overview and dividend log access.
3. Verify focused Backend/Frontend tests, full tests/typecheck/lint/build, contract, security audit, isolated real-PG checks if available, GitHub CI; report failures as blockers. Do not run mutations on shared DB.
4. Coordinate C PR #1540; keep Draft/hold and never merge or promote without real ledger-first SQL migration, immutable per-period/enterprise receipt, actor auth, locking, 100-way retry, app-role ACL and exact-SHA Test gates.

## API contract
`POST /api/v1/admin/enterprises/soes/harvest` and `POST /api/admin/enterprises/harvest`: HTTP 503, `SOE_DIVIDEND_LEDGER_UNAVAILABLE` in backend response / stable UI message; zero SQL mutations. Existing read-only endpoints unchanged. No migration or WLD changes.
