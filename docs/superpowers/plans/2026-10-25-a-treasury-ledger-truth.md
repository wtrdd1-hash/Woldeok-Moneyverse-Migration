# A Treasury Ledger Truth — implementation plan

1. RED: tests require owner-scoped PostgreSQL USER_TO_TREASURY debit/outflow count with 100-digit integer-string precision, no counterparty details, no writes.
2. GREEN: repository SQL, validated service DTO and GET /wallet/treasury-outflows, private/no-store; legacy fabricated GET /wallet/tax-receipt returns 503.
3. RED/GREEN: verified wallet component, honest unavailable state and clear 'not tax / not allocations' boundary; replace fabricated card on wallet dashboard; Android app-api forwarding and privacy tests.
4. Verify isolated PG app-role SELECT/no INSERT/UPDATE with ROLLBACK, lint/typecheck/build/full tests/security/SEO/accessibility/app-api; compare exact SHA with latest main and PR/CI. Only merge after all required gates.
5. Record changed files, start/mid/end branch/PR counts, blockers, Test/Production and rollback; protect all other worktrees and branch tips.
