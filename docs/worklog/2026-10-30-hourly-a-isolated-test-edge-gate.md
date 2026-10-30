# Development A — 2026-10-30 10:25 KST — P0 isolated-Test public edge gate

## Before work
- Authority: Debian 13.6 miniPC status checked. Production/backend/frontend/Nginx/Docker active; development PostgreSQL reachable. No service or database mutation authorized.
- Starting main: a7f8730b9838b9324b6ece25e394dfcc8709aadf; fresh isolated branch auto/hourly-a-release-proof-20261030-1025.
- Read AGENTS.md, README.md, EN/KO living plans, integrated master, INFRASTRUCTURE.md, RELEASING.md, QA v1386 and open PRs.
- Incident #1979: Production v1515 was promoted before completed exact-source CI PASS, while Test remains at an older SHA and exposes synthetic Treasury HTTP 200. Incident #1968: unapproved mass cleanup recovery unverified.
- Existing Build Production Release Test gate checks backend version, catalog and noindex, but not independent frontend build identity or fail-closed public Treasury. This gap is distinct from QA's docs-only API schema repair #1978 and B/C runtime work.
- Scope: add a **read-only**, deterministic fail-closed public-edge verifier and require it in the Test gate. This does not authorize Production promotion, replace authenticated E2E, or solve host manual bypass.
- Plan: (1) RED negative tests; (2) pure verifier and one-shot CLI; (3) wire exact-source workflow; (4) targeted/policy tests; (5) main/plan recheck and Draft PR; (6) release HOLD evidence.
- Production, Test services, DB, ledger, Docker volumes, branches owned by others and backups remain untouched.

## In progress
- TDD RED test file created. Awaiting implementation and exact-SHA verification.

## Finished
- Pending.

### Implementation and verification checkpoint
- RED: verifier import missing, test failed as expected. GREEN: 6/6 focused tests passed.
- GitHub Production Release Test gate now checks independent public frontend SHA and fail-closed Treasury disclosure using a read-only verifier from the exact candidate repository head. The original backend/catalog/noindex checks remain.
- Full release policy suite: 104 PASS / 0 FAIL; security policy: 2 PASS; database unit: 56 PASS / 4 SKIP. Workflow and new scripts Prettier PASS; typecheck PASS; git diff --check PASS.
- Full lint emitted 0 errors and 1,043 warnings in an initial run; an independent bounded rerun timed out, so no unqualified exact-run lint PASS is claimed. Full build reached static generation and trace collection but was SIGTERM-terminated under a bounded run with overlapping build attempts; build PASS is unproven. API contract check FAIL: EN/KO generated 183 endpoints versus committed 182; QA #1978 owns the separate repair. Generated documentation was restored in this isolated worktree, not committed.
- Read-only live Test gate against main a7f8730b returned exit 1: backend_version_unverified, frontend_version_unverified, public_treasury_not_fail_closed. Actual public Test remains c2129625; Production 0669f0f6 and Treasury 503. No candidate was deployed.
- A separate Backend B v655 branch is modifying an earlier, non-overlapping block of the same release workflow to require exact-source CI. Both changes require independent review and final-main revalidation.
- Remote main a7f8730b unchanged at mid-check. Remote branches before new push: 4 (main + 3 existing PR heads), open Draft PRs: 3. No branch or PR cleanup attempted.

## Finished
- Source and tests are implemented in the isolated branch. Draft PR and exact-SHA CI evidence to follow.
- Release HOLD: official Test exact SHA, authenticated E2E, real-PG finance/security, independent backup restore, source CI, rollback and GitOps approval are not jointly PASS.
- No Production/Test service restart, DB or ledger mutation, Docker cleanup, branch deletion, main merge, Production promotion or rollback performed.
- Rollback for this unmerged control-plane patch: do not merge the Draft PR; existing Production/Test runtime remains unchanged.
