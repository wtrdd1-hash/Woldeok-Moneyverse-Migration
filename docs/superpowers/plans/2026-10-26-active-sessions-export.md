# P1 active-session export implementation plan

1. Write failing backend repository/controller tests: only session-derived actor/current-session, bounded 101-row read, explicit over-cap refusal, no sensitive identifiers.
2. Write failing CSV serializer, route, Android gateway, accessibility/SEO tests: no formula injection, no malformed/partial data, private headers, failure propagation.
3. Add repository read-only bounded query through existing SECDEF; controller guarded owner snapshot and safe JSON contract.
4. Add server-only Next CSV route and keyboard-accessible download link; Android gateway private response headers, generated EN/KO app-api reference.
5. Verify isolated real PostgreSQL 17 app-role EXECUTE and table/ledger DML denial; no migration, production DB or user data writes.
6. Run focused + full lint/typecheck/build/unit/integration/security/a11y/SEO/app-api gates; check exact SHA and GitHub CI; hold integration if any mandatory failure.
