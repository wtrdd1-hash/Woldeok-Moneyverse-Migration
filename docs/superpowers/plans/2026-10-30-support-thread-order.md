# Support conversation order: bounded owner-private read

## Decision
Provide a choice between newest and oldest *within the newest 100 owner conversations*, with newest as the existing default. Avoid a misleading all-history sort. The owner-scoped `public.support_my_threads(actor,100)` is the sole database source; do not grant table access or alter applied migrations. The optional `sort=oldest` parameter is validated strictly (including duplicate rejection), applied after optional status/subject filtering and before LIMIT 50. Web form and selection links preserve the filter. Android forwards the parameter and rejects malformed or unordered upstream success responses. Cache-Control private/no-store and X-Robots-Tag noindex remain mandatory. Rollback: omit sort; no persistent data change.

## Tasks
1. Write failing NestJS controller and repository tests for invalid/duplicate sort, default compatibility, bounded SQL ascending order and owner argument.
2. Write failing Next.js support page test for sort selector, URL and disclosure; Android app-api test for forward/no-store/noindex and malformed success refusal.
3. Implement minimal controller/repository, page and gateway validator; preserve legacy default and status/search behavior.
4. Add isolated PostgreSQL regression with owner and stranger rows, sorted bounded result, no direct app table read, rollback.
5. Run focused tests, workspace typecheck, lint, build, real PostgreSQL test, exact SHA CI and release gates; record failures rather than bypassing.
