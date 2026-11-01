# C v1276 — Collection unverified-count contract (English canonical)

## Start — 2026-11-01 23:16 KST
- Baseline `origin/main`: `3d5e321c3d1221febff677469fecdfcb3cf42e7d`; separate `auto/hourly-c-collection-count-v1276-20261101-2316` worktree.
- Inspected AGENTS.md, README.md, README/README.ko.md, both project plans, open PRs (135), CI, A/B/QA PRs, and collection API/SQL. Avoid #2323 owner privacy and other agents' work.
- P1 source evidence: backend collection repository and client use a regex literal `\\d` instead of digit class `\d`; 1-digit counts pass but 10+ verified SQL counts become 503 or error. This prevents truthful owner quarantine count for members with >=10 unverified legacy records.
- Scope: exact nonnegative decimal-string validation in existing Nest read contract and web UI; no ownership promotion, no SQL mutation, no financial writes. Retain private/noindex, mobile layout, keyboard retry, and screen-reader status. Test RED/GREEN on 10, 123 and malformed counts. Backend SECURITY DEFINER owner count is the authority.
- Gate: focused tests, full lint/typecheck/build/tests, contract, isolated PostgreSQL, security, HTTP/E2E and remote CI; no merge or deploy unless all pass.

## Checklist
- [x] Start/source review and isolation
- [ ] RED tests
- [ ] GREEN implementation
- [ ] Intermediate main/plan fetch
- [ ] Exact SHA verification and PR
- [ ] Final gate/deploy decision
