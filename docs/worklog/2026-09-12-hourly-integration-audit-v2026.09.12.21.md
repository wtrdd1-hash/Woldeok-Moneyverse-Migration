# Hourly Integration Audit — v2026.09.12.21

Date: 2026-09-12
Application main at audit start: `3feb7f90b9be01b00fa98269789dd20d5fbc0959`
GitOps main at audit start: `fb3ca6ac89fc5fb5e31983116f967bbeb63089cf`

## Plan review

The latest `docs/planning/PROJECT_PLAN.md` was re-read before branch/PR work and again mid-work. Its fail-closed pre-production contract remains authoritative: a releasable SHA must be observed on the isolated Test origin with backend/database smoke evidence before Production may advance.

## Branch and PR classification

### Active work — preserved
- `docs/clubs-cooperative-economy-v2026.09.12.20` / PR #177: recently updated documentation work; CI is green and the PR remains active.
- `feat/economy-scenario-lab-v2026.09.12.14` / PR #169: runtime candidate still gated on exact-SHA Test evidence.
- `feat/event-calendar-v2026.09.12.8` / PR #162: runtime candidate still gated on exact-SHA Test evidence.
- `fix/admin-disable-auto-refresh` / PR #160: active runtime fix; Test verification required.
- `fix/business-settlement-boost-v2026.09.12.9` / PR #164: active PostgreSQL/runtime fix; Test verification required.
- `fix/trusted-client-ip-v2026.09.12.10` / PR #165: active security/runtime fix; Test verification required.
- `feat/v2026.09.12.1-auto-db-backup` / kuber-infrastructure PR #22: active draft; restore proof is still required.

### Useful but currently not safely mergeable
- `docs/banking-financial-services-v2026.09.12.17` / PR #174: valuable documentation, but GitHub reports it non-mergeable against current `main`. Its unique banking scope should be re-homed onto a fresh `main`-based branch rather than force-merging stale stacked history.

### Already integrated / obsolete
- `integrate/hourly-banking-v2026.09.12.20` currently points at exactly the same SHA as `main`; no branch-only commit remains.
- `docs/player-market-crafting-v2026.09.12.16` has already been re-homed and integrated through the current `main` history; the old stacked branch is obsolete.
- `test-candidate/economy-scenario-lab-v2026.09.12.14` and `test-candidate/trusted-client-ip-v2026.09.12.10` are retained because their associated runtime PRs remain active and Test evidence is still unresolved.

The repository cleanup workflow is expected to remove branches that are fully contained in `main`; no force update of `main` was used.

## CI and deployment evidence

The Production Release run for current application `main` SHA `3feb7f90b9be01b00fa98269789dd20d5fbc0959` failed in `test-gate`. The exact failure was that the isolated Test origin never served that SHA during the workflow polling window. The Production build job was skipped.

Therefore:
- Test exact-SHA gate: **FAILED / unavailable**.
- Migration completion for current main on Test: **not proven**.
- Test backend/API exact-SHA health: **not proven**.
- Test backend logs/container health/rollback readiness: **not proven**.
- Production promotion: **0**.
- Production health for this candidate: **not applicable because it was not promoted**.

## Remaining risks and next actions

1. Restore reliable exact-SHA identity on `test.easy-scraping.com` and verify the backend/database path, migrations, logs, service/container health, and rollback readiness.
2. Re-home PR #174 banking-only changes onto current `main` without carrying obsolete stacked parent history, then run CI before merging.
3. Keep PR #22 blocked until a non-production database run proves dump creation, checksum verification, restore, and backend health.
4. Do not promote any runtime candidate to Production without direct same-SHA Test evidence.