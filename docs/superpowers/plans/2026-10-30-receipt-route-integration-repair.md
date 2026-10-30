# Repair: merged receipt route and test syntax

Root cause evidence: origin/main bf8d0d48 has a duplicate `const response`, missing test-closing `});`, missing/incorrect summary fixtures, and an invalid `^d{4}` date regex in the private receipt route. Full lint fails at `frontend/src/app/api/shop/purchases/route.search.test.ts:99`. Prior repair PR #2032 closed unmerged after failed runtime checks; preserve its unique local commits.

Plan: RED reproduce syntax lint and receipt tests. GREEN surgically restore valid tests and canonical KST date validation in the private Next route; retain owner-only no-store/noindex and verified summary. Run focused test, lint, typecheck, build, mobile contract. Full suite and official Test remain mandatory before merge. Separate repair branch from latest main; no DB migration or service writes.

Rollback: revert this branch/PR. Do not merge if full gates fail.
