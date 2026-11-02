# Backend B v771 — Production HTTP 500 problem-detail confidentiality

## Before work — 2026-11-03T06:36:00+09:00
- Main: f5c3fbedae1c3b3ec2374882b049aac43a655eb4; branch: auto/hourly-b-v771-http500-problem-redaction-20261103-0635; isolated worktree.
- QA v1482: Production 24/28 HTTP 500; no assertion that this patch fixes those 500 causes.
- Root disk 97%; no shared cleanup. Other PRs #2578 (401/403 headers), #2568 (auth middleware) are separate.
- Reproduction target: explicit HttpException(500, secret-bearing detail/code/errors) reaches ProblemFilter without production redaction; unrecognised errors are already redacted.
- Scope: HTTP 500 response payload only; keep 4xx and 503 contracts unchanged, no DB/API route/ledger/migration changes.

## In progress
- [ ] RED regression reproduces leak.
- [ ] Minimal safe implementation.
- [ ] Focused HTTP/unit and wider gates.
- [ ] Recheck main and plan; CI and Test evidence.

## Finished
- Pending verification.

## In progress — $(date -Is)
- RED: explicit HTTP 500 leaks detail/code and message arrays (see logs/red-test.txt).

- GREEN: 15/15 ProblemFilter tests; explicit 500 detail/code/errors removed only in production.

- Midpoint main re-fetched: f5c3fbedae1c3b3ec2374882b049aac43a655eb4; latest planning Draft #2581 reviewed; no overlap with #2578.
- HTTP boundary tests 17/17 PASS.
