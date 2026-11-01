# Safety moderation HTTP privacy implementation plan

> **For agentic workers:** Use isolated worktree, systematic debugging, TDD, and verification before completion.

## Scope and decision
P1: protect emergency takedown submission/status and administrator safety queues, including private 1:1 chat evidence, from shared caching, search indexing and referrer leakage. Current SafetyModule has no pre-guard response middleware. Public submission remains unauthenticated; admin authorization and CSRF stay unchanged. No database, ledger, API body or frontend contract changes. Existing Draft PRs #2229/#2239 address inventory, not safety. P0 season SQL ACL #2357 needs a collision-free forward migration; pending 318/319/320 migrations make a standalone contiguous migration unsafe in this cycle.

## Steps
- [x] Inspect latest main, QA and competing PRs; establish RED using real NestJS HTTP fixture against SafetyModule.
- [x] Apply minimal pre-guard middleware to SafetyController routes only, setting Cache-Control private,no-store, X-Robots-Tag noindex and Referrer-Policy no-referrer.
- [x] Verify 400/401/403/200/HEAD and public unrelated endpoint, plus existing safety tests.
- [ ] Run lint, typecheck, build, full suites, contract, real PostgreSQL isolation, security and exact-SHA Test checks; record failures honestly.
- [ ] Recheck latest main/plans/CI, publish Draft/HOLD PR, keep main and Production unchanged unless all release gates pass.
