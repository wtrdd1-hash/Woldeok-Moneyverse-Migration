# P1 Verified Help Related Articles — isolated implementation plan

## Intent and invariant
Members reading an independently approved help article can discover up to five other current approved articles in the same locale/category. Never expose expired, withdrawn, unreviewed, or cross-locale content. When the current article is not published, respond 404; when the service is unavailable, do not invent suggestions. No user tracking, ledger mutation, new DB grants or migration.

## Alternatives and decision
Client-only category matching would bypass authoritative published-only reads and could expose stale results; adding a new SQL migration would collide with concurrent numbered migrations. Reuse the already-applied, SECURITY DEFINER `help_public_article` and `help_public_search` functions (migration 282) in a server-only related-read composition. The existing `VERIFIED_HELP_CENTER_V1` switch remains OFF unless independently approved.

## TDD steps
1. RED: add backend controller tests for 404, 503, category+locale scope, current-article exclusion, five-result cap and SQL function-only repository contract.
2. RED: add Android allowlist/no-store regression and accessible related-links component tests.
3. GREEN: implement NestJS read-only related route, add Android allowlist, force no-store on all help app-api responses, and SSR related article links with a fail-closed empty state.
4. VERIFY: targeted tests, lint/typecheck/build/full tests, real isolated PostgreSQL fixture validating only approved unexpired results and app role DML refusal. Re-read latest main/plans/PR/QA before integration. No merge or production release without all exact SHA gates and official Test evidence.

## Review
Spec: same category+locale, only independently approved rows, no guessed suggestions, no PII or monetary effects. Quality: no new migration, SQL function-only reads, no cache, no unauthorized app-api paths, stable accessible navigation.
