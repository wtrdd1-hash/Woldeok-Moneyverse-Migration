# Backend B v771 — Production HTTP 500 problem-detail confidentiality

## Before work — 2026-11-03T06:36:00+09:00
- Main: f5c3fbedae1c3b3ec2374882b049aac43a655eb4; branch: auto/hourly-b-v771-http500-problem-redaction-20261103-0635; isolated worktree.
- QA v1482: Production 24/28 HTTP 500; no assertion that this patch fixes those 500 causes.
- Root disk 97%; no shared cleanup. Other PRs #2578 (401/403 headers), #2568 (auth middleware) are separate.
- Reproduction target: explicit HttpException(500, secret-bearing detail/code/errors) reaches ProblemFilter without production redaction; unrecognised errors are already redacted.
- Scope: HTTP 500 response payload only; keep 4xx and 503 contracts unchanged, no DB/API route/ledger/migration changes.

## In progress
- [x] RED regression reproduces leak.
- [x] Minimal safe implementation.
- [x] Focused HTTP/unit and wider gates (with blockers).
- [x] Recheck main and plan; CI/Test blockers recorded.

## Work status
- See the final verification and release hold below.

## In progress — $(date -Is)
- RED: explicit HTTP 500 leaks detail/code and message arrays (see logs/red-test.txt).

- GREEN: 15/15 ProblemFilter tests; explicit 500 detail/code/errors removed only in production.

- Midpoint main re-fetched: f5c3fbedae1c3b3ec2374882b049aac43a655eb4; latest planning Draft #2581 reviewed; no overlap with #2578.
- HTTP boundary tests 17/17 PASS.

## Verification and review — 2026-11-03T06:45:35+09:00
- Main rechecked at start/mid/final: f5c3fbedae1c3b3ec2374882b049aac43a655eb4 (unchanged). Latest proposed planning v1684 Draft #2581 and QA v1482 read. Production 24/28 HTTP 500 remains a separate operational defect; this patch only prevents explicit 500 diagnostics from being returned after deployment.
- RED: 2 failing regressions with raw 500 secret strings and array messages; GREEN: 17/17 focused unit+Nest HTTP tests. Final formatting rerun: 17/17 PASS; typecheck and changed-file ESLint PASS.
- Backend full: 2,989 PASS / 2 FAIL / 518 SKIP; both failures are existing authenticated profile HTTP 401-versus-200 (#2265), unrelated to changed filter. Backend build PASS.
- Frontend: 2,947 PASS, typecheck PASS, Webpack build PASS. Full ESLint: 0 errors / 1,027 warnings.
- Database package: 72 PASS / 5 SKIP; no actual PostgreSQL integration or schema mutation performed.
- Mobile API contract: 184 endpoints / 684 methods PASS. Security advisory-floor 11 PASS. Production-dependency audit 0 known vulnerabilities; full audit FAIL: 9 advisories (8 moderate, 1 low).
- Files: backend/src/core/problem.filter.ts, unit regression, Nest HTTP regression. API routes/statuses and DB schema/ledger/transaction contracts unchanged; 4xx and 503 code semantics preserved. 500 diagnostic detail/code/errors redacted in production only.
- Overlap: Draft PR #2578 also edits ProblemFilter for 401/403 headers; merge/rebase must resolve both behaviors and rerun tests. No integration claim.
- Official Test exact-SHA backend/auth/E2E, independent PostgreSQL, off-host restore, GitOps release gate: BLOCKED / not run. Root disk 97%, ~3.6GB free; shared volumes/workspaces not cleaned.
- No main merge, Test deploy, Production deploy, branch cleanup, shared DB/service change, or automation change.

## Finished — 2026-11-03T06:45:35+09:00
- [x] RED regression reproduces leak.
- [x] Minimal safe implementation.
- [x] Focused HTTP/unit and wide local gates; failures and skipped gates recorded above.
- [x] Main and plans rechecked; Draft PR pending CI, no merge/promotion.
- Final classification: PARTIAL / BLOCKED, RELEASE HOLD.
