# B v549 — status collector single-flight evidence (P1 / HOLD)

## Before work — 2026-10-26 07:33 KST
- Authoritative main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent branch `auto/hourly-b-status-single-flight-v549-20261026-0735`.
- miniPC Debian 13.6: service status healthy; root `/` at 100% (783MiB available), data volume 76% (46GiB available). No deletion of others' worktrees.
- Read AGENTS.md, README.md, EN/KO PROJECT_PLAN, current open PRs and CI. Open status-page PR #1172 changes frontend only; no open PR identified modifying backend status collector.
- Selected P1: overlapping scheduled `collectOnce()` invocations can complete out of order and overwrite a newer outage with an older green status. Scope is backend status collector only, no ledger/DB schema/API changes.
- Plan: reproduce with deferred probes (RED); add minimal single-flight guard with finally reset; run focused, backend, build/typecheck, lint, security and CI; do not merge or deploy without all required gates.

## In progress
- Baseline on unmodified main: status collector 13/13 PASS.
- RED: new concurrency tests 2 FAIL / 1 PASS; overlapping invocations observed (2 calls) and 3 timer beats added 3 calls (4 total).
- GREEN: single-flight `collectOnce` guard with `finally` reset; 16/16 focused status tests PASS. No migration, route or public response changes.
- Mid-run `origin/main` re-fetch: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` unchanged.
- Code checkpoint SHA `15f8f47d1b141ded45295739b60e107542686a71` pushed; Draft PR #1385 opened.
- Backend full: 1,316 PASS / 398 SKIPPED; Backend Build PASS; workspace typecheck PASS; lint 0 errors / 1,128 warnings.
- Database package: 15 PASS / 3 SKIPPED; contract package: 38 PASS; API schema: 179 endpoints PASS; security floor 18 PASS; repository security and control bytes PASS; bot 8 PASS after restoring existing local dependency symlink.
- Frontend full: 1,397 PASS / 6 FAIL (3 SEO, login touch target, registration link, admin monetary telemetry). Default Turbopack build FAIL due workspace symlink package resolution; Webpack alternative FAIL at 1,024MiB heap OOM.
- Production dependency audit FAIL (2 High); full dependency audit FAIL (2 Critical, 10 High, 11 Moderate, 3 Low).
- Isolated full-schema real PostgreSQL / official Test exact-SHA / authenticated E2E NOT RUN. Public Test version remained `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither equals candidate.
- No DB schema/migration, WLD balance, public API path or response contract changes. Single-process collector ordering only; cross-replica write ordering remains unverified. Root `/` 100% (~865MiB available), data volume 76%. No other worktrees modified or deleted.

## Finished — 2026-10-26 07:44 KST
- **PARTIAL / BLOCKED**: real backend code and three concurrency regression tests committed, Draft PR #1385 open. No merge and no Test/Production deployment.
- PR CI candidate runs #40241113823 and #40241316604 remained in progress at 07:44 KST; not accepted as PASS.
- Required release gates not green; no GitOps promotion, no Production smoke, no branch cleanup. Existing development/QA/planning automations untouched.
- Evidence: miniPC local logs `mv-b-v549-logs/red.log`, `green.log`, `backend_tests.log`, `frontend_tests.log`, `frontend_build.log`, `frontend_webpack.log`, `audit_prod.log`, `audit_all.log` and security logs.
- Safe rollback if reviewed later: revert only this code commit; does not require schema changes. Release HOLD until exact-SHA Test, CI, real DB and security gates all pass.
