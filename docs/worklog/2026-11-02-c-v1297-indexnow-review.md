# C v1297 — Source-bound IndexNow operator review (2026-11-02)
Status: STARTED / RELEASE HOLD. Canonical English record; Korean companion is secondary.

## Before work — 2026-11-02 13:41 KST
- Debian 13.6 miniPC connected; seven Moneyverse services active; DEV PostgreSQL connected. No shared service, database or other worker worktree will be changed.
- Fetched origin/main `a8541927c3a351d980454c66e95a3356c47e0722`. Read AGENTS.md, README.md, README/README.ko.md, canonical and Korean PROJECT_PLAN; reviewed open A/B/C/QA/planning PRs and CI. Latest planning #2473 remains DRAFT/HOLD; QA v1462 reports P0 production hold.
- Existing admin SEO audit GET reports candidate count but not the actual URL set; POST submits a newly generated set without binding it to what the operator inspected. A changed candidate set can be submitted under a stale preview. POST also lacks private noindex/no-referrer headers. Existing IndexNow API is real, not a DB transaction; acceptance is not search indexing.
- No open IndexNow-review PR found. B v753 changes manual X publishing, not this route. Distinct frontend/admin SEO scope.
- Plan: TDD reject unreviewed/stale candidate submission; provide a keyboard-accessible, mobile-friendly review/confirm flow and private HTTP response; retain live IndexNow notification semantics; do not invent indexing results. Verify exact SHA, isolate tests, preserve other PRs.
- [x] Worktree isolated from origin/main.
- [ ] RED tests
- [ ] Implementation and focused GREEN
- [ ] Full build/lint/typecheck/unit/integration/real-PG/security/app-api/E2E and CI
- [ ] Re-fetch main/plan; final release decision and evidence
