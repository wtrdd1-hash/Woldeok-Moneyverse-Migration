# C v1302: Verified owner bond holdings and repo loans (P1)

## Source evidence and choice
Latest main `a8541927c3a351d980454c66e95a3356c47e0722` public `/bonds` uses untyped `api<UserHoldingItem[]>` and `api<any[]>` without validation; repo failures become `[]` and show a false zero. Android `/app-api/v1/bonds/my-holdings` and `/my-repo-loans` do not force private headers or reject malformed success. Nest SessionGuard + AuthenticatedGuard calls actor-scoped `bond_owner_holdings`/`bond_owner_repo_loans` from migration 312. Do not grant raw tables or enable held financial writes.

## Design and implementation steps
1. Write RED unit/SSR/Android regression tests: owner data parsing, invalid amounts/dates/status/duplicates, unavailable vs verified empty, private headers and no upstream PII errors.
2. Implement a bounded strict owner row parser retaining only fields required by the UI, exact WLD strings and numeric rates. Reject unverified full arrays rather than silently dropping rows.
3. SSR: distinguish guest, verified owner and owner-read unavailable; render a visible retry state instead of zero. Keep existing market API verified and member writes subject to existing backend holds.
4. Android: validate owner responses before 200, return generic 503 on malformed success, protect all statuses with no-store/noindex/no-referrer. Apply web noindex/no-store to member-mixed bonds route, including locale variants.
5. Run targeted, full build/lint/typecheck/tests, real isolated PostgreSQL and CI, exact SHA; re-fetch main mid-run and before any merge. HOLD unless all gates pass.

## Safety
No DB schema, shared DB, ledger, main, other worktrees, GitOps, Test or Production writes. Draft PR on incomplete gates.
