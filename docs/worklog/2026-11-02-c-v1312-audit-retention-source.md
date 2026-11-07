# Development C v1312 — Audit Retention Source Integrity

## Before work (2026-11-02 22:48 KST)
- miniPC Debian 13.6 and seven services active; development PostgreSQL reachable.
- Canonical origin/main: `b1f858c6b3684066bd609b06eebc59d65fb317af`.
- Read AGENTS.md, README.md, README/README.ko.md, canonical/KO PROJECT_PLAN, active PRs, QA v1470, A/B records. No open PR specifically hardens audit retention overview count/sequence provenance.
- P1 observed: `parseAuditRetention` accepts expired_rows=0 with non-null expired sequence bounds, expired_rows>0 with missing bounds, and unmatched last disposition/moment. This can falsely certify retention state and expose admin policy controls. SQL 065 returns MIN/MAX for expired rows and a paired last disposition/moment; reject contradictory payloads.
- Plan: TDD RED, implement fail-closed owner/admin read-model validator, focused regression, full gates, re-fetch main, Draft PR only if not releasable. No migrations or financial writes.

## In progress (2026-11-02 22:53 KST)
- Source main advanced during worktree creation: actual clean start `b1f858c6b3684066bd609b06eebc59d65fb317af` (not earlier `3accc3a`). No other worktree modified.
- TDD RED: 1 failed / 6 passed on contradictory expired range; GREEN: 10/10 focused parser + admin page tests.
- Found and fixed test mock setup error (undefined URL), then reran 10/10 PASS.
- Existing Nest admin audit API and SQL migration 065 are authoritative: SQL computes expired count and MIN/MAX from the same predicate; joins latest disposition method/time as a pair. New parser refuses inconsistent fields and future disposition evidence. No API/DB schema change.
- Real isolated Next.js HTTP probe exposed a second P1: `/admin/logs/integrity` and `/en/admin/logs/integrity` returned `X-Robots-Tag: index, follow` despite page metadata `noindex`. Root cause: global Next.js HTTP header in next.config overrides page metadata; added route-specific override for canonical and five localized paths, plus private no-store and no-referrer.
- Edge TDD RED 1 failed/8 passed, GREEN combined 19/19 parser/page/security-header tests. Existing responsive table and accessible retry preserved.
- First exact SHA e301cba6eb: lint/typecheck/build/frontend full suite PASS; backend and other gates running. New edge change requires a fresh final SHA gate cycle.
- Isolated PostgreSQL 17.11, 323/323 migrations applied; app role `audit_logs` direct SELECT=false, `admin_audit_retention_overview(uuid)` EXECUTE=true. No persistent DB touched.
- Mid-run origin/main advanced from b1f858c to 9cade11 (blog docs only, no source overlap). Rebase and final exact-SHA revalidation pending.

## Finished (release disposition, 2026-11-02 23:06 KST)
- Implementation: fail-closed audit retention count/sequence and disposition/time validation, plus HTTP private/noindex/no-referrer on six canonical/localized admin integrity routes. Existing Nest/PG contract reused; no DB schema, financial write or main mutation.
- First gate run at initial implementation SHA `e301cba6eb8d4e89ff67fd39f1b44a1188d34828`: lint, typecheck, build, frontend 2,940 PASS, database package, contract, app-api 184 endpoints, security scripts PASS. Backend 2,981 PASS / 2 FAIL / 518 SKIP (pre-existing profile HTTP 401-vs-200). Full-route QA FAIL missing `artifacts/qa/full-route-ledger.json`. New edge changes were made afterward; first gate evidence does not certify final SHA.
- Isolated PostgreSQL 17.11: 323 migrations PASS, app role cannot SELECT/INSERT/UPDATE/DELETE audit_logs, SECURITY DEFINER function executable, unauthorized actor rejected. Container ephemeral; no shared database writes.
- Initial independent HTTP confirmed `index, follow` on `/admin/logs/integrity` and `/en/admin/logs/integrity`; fix covered by 19/19 focused tests. Actual post-fix HTTP must be rechecked after final build.
- Main rechecked and rebased from `b1f858c` onto `9cade11af53db9f27c2b9f0ea9d39005ea8d0387` (blog-only change); no conflict. Exact final SHA gates pending at this checkpoint; publish their results to PR #2542.
- **PARTIAL / RELEASE HOLD:** authenticated browser/Android E2E, official Test exact-SHA, independent restore, all-green backend and QA remain unproven. Draft PR only. No merge, Production, GitOps or rollback action. No other branch/worktree removed; A/B/Gemini/QA preserved. Five recurring tasks untouched.
