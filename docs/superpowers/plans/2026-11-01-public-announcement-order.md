# Public announcement snapshot ordering (2026-11-01)

## Design and scope
A visitor may sort the existing published announcement **snapshot of up to 20 rows** by publication time. The canonical default remains pinned-first as defined by `content_list_published_announcements(20)`; `sort=newest` and `sort=oldest` reorder only that already-public snapshot. Do not claim to search all historical notices. No table reads, grants, migrations, money or privileged data changes. Return 400 for malformed/duplicate/unknown query values. Android app-api must reject a stale backend that silently ignores sorting and must not cache filtered responses. Frontend form remains keyboard-accessible and noindexed for filtered result pages. No change to other workers' files outside isolated worktree.

## Implementation / TDD
1. Add failing parser and ordering unit tests in backend; test default pinned-first, newest, oldest, timestamp ties and invalid query. RED then GREEN.
2. Extend public and app controllers to accept strict query, and service to order only the normalized published snapshot; controller tests for 400 and response ordering.
3. Add failing Android gateway tests for duplicate/invalid sort, stale upstream order and verified sorted results; implement fail-closed validation and no-store/noindex.
4. Add an accessible GET select form to `/announcements`, explain the 20-row pinned-first snapshot, and metadata robots noindex for filtered requests.
5. Verify target tests, typecheck, lint, build, full suites if feasible, live PostgreSQL read-only, CI and exact SHA. Keep Draft/HOLD if any mandatory gate is missing. Record branch audit, hashes, QA, release and rollback evidence.

## Release
Feature is reversible by reverting the candidate PR. Do not change DB schema, official Test or Production until complete exact-SHA release gates pass. This plan is non-interactive: requirements derive from existing published announcement route and safety constraints; user approval is not inferred for deployment.
