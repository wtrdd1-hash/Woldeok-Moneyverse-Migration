# Backend B v770 — Global authorization problem response privacy

Date: 2026-11-03 KST. Starting and mid-run origin/main: `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`. QA v1480/v1481, latest planning v1682, open PRs and CI inspected. Distinct from frontend App API #2563 and AuthModule #2568.

## Implementation

The global NestJS `ProblemFilter` now forces `Cache-Control: private, no-store`, `X-Robots-Tag: noindex` and `Referrer-Policy: no-referrer` on HTTP 401/403 problems, overriding earlier permissive headers. It covers denied requests outside the AuthModule, including guard failures. Public 404 behavior, status/body/code, authorization rules, API contract and database are unchanged. The change does **not** claim Nginx/edge headers are fixed.

## Evidence

- RED: two 401/403 unit cases failed on inherited `public, max-age=600`.
- GREEN: 14 ProblemFilter unit and 3 real NestJS HTTP tests PASS.
- Full backend initial: 2,983 PASS / 8 FAIL / 518 SKIP. Six new failures were exact-string `noindex,nofollow` vs existing profile `noindex`; two unrelated profile authenticated HTTP 401-vs-200.
- Compatibility correction: use `noindex` to preserve existing profile header contract. Final backend: 2,989 PASS / 2 FAIL / 518 SKIP. Both remaining failures are pre-existing profile authenticated HTTP expected 200 but actual 401; development A has separate PR #2265. Not a full pass.
- Backend typecheck PASS, changed-file ESLint PASS, backend build PASS.
- Frontend 2,947 PASS, frontend typecheck PASS; DB package 72 PASS / 5 SKIP. DB-backed tests skipped and are not counted as passed.
- Root disk 96%, ~3.8 GiB free during work. No destructive cleanup, no shared database changes.

## Release HOLD

Full repository CI, default frontend build, real PostgreSQL/security/app-api and official isolated Test exact-SHA authenticated E2E/independent restore/GitOps gates not all PASS. Existing P0: Production localized HTTP500, broad app-role grants, migration checksum mismatches, capacity incident. Draft PR only; no merge, no Test/Production deployment.
