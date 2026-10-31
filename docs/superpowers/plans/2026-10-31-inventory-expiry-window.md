# Inventory Expiry Window — Bounded Full-stack Plan

1. RED: backend controller tests reject invalid filters and assert actor-scoped 7/30 day DB reads; frontend selection tests validate canonical query and gateway proof; Android proxy tests reject forged 200 and enforce privacy.
2. GREEN: extend existing owner SECURITY DEFINER read via parameterized SQL expiry predicate; Nest validates query and preserves old filter; SSR Next shows separate expiry result while retaining full equipped showcase and unavailable/verified-empty distinction; app-api enforces filter and response proof.
3. Verify: target tests, typecheck, lint, build, full tests, actual PostgreSQL role with transaction rollback, mobile contract, security/SEO/a11y, exact SHA CI and official Test.
4. Record before/mid/end SHA and branch inventory, release hold and rollback. Do not touch main, production, other worktrees or applied migrations.
