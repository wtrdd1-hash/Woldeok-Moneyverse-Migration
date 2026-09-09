# Work logs

## Mandatory documentation workflow

Every implementation change must be documented as part of the same unit of work. Documentation is not optional follow-up work.

For each change:

1. Work on a non-`main` branch.
2. Record what changed, why it changed, affected files/areas, database/data-integrity impact, security impact, and known limitations.
3. Record validation results (CI, automated tests, build/typecheck/lint as applicable, and test-server verification).
4. Record deployment status separately for test and production.
5. Keep an English work log as the canonical developer-facing record and a Korean translation alongside it when the change is user/project significant.
6. Update the release/changelog documentation before the work is considered complete.
7. Do not merge to `main` or promote to production until the required test gates pass.
8. After successful production promotion, update the same work log with the final production result and completion status.
9. Before continuing long-running work, sync with upstream changes and reconcile concurrent changes instead of overwriting them.

A candidate is **not complete** until implementation, validation, deployment status, and documentation are all current.

## Current work

### 2026-09-09

- [Core data-integrity hardening](2026-09-09-core-data-integrity.md) · [한국어](2026-09-09-core-data-integrity.ko.md)
- [Home AdSense / desktop UI fix](2026-09-09-home-ad-ui-fix.md) · [한국어](2026-09-09-home-ad-ui-fix.ko.md)

### 2026-09-08

- [Operations / observability remediation](2026-09-08-ops-observability-gap.md)
- [Public board / search discoverability](2026-09-08-public-board-seo.md)
