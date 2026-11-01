# A 2026-11-01 11:25 — Recent public board date discovery

## Start — P1 / isolated candidate
- Scope: date-bound discovery for the latest 50 publicly visible board posts, without claiming historical search or exposing private posts.
- Baseline: `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`; 75 remote refs and 72 open PRs at initial audit (subject to concurrent changes).
- Guardrails: use existing `SECURITY DEFINER` public projection, bind all SQL values, no migration or privilege changes, do not touch existing worktrees or other agents' branches.
- Plan: RED tests for ISO date validity and duplicate/unknown query parameters; service SQL date bounds; web form and SEO; Android gateway validation and response verification; real PostgreSQL read-only and full gates.
- Release: HOLD until exact SHA CI, authenticated isolated Test and GitOps evidence are green. No Production changes.

## Checkpoints
- [x] Inspect current main, policies, living plan, recent QA, PRs and CI.
- [ ] RED regression tests.
- [ ] Backend/SQL, frontend and Android gateway implementation.
- [ ] Full and targeted tests, actual PostgreSQL read-only evidence.
- [ ] Midpoint and pre-integration main/plan refresh; PR/CI and final HOLD report.

## Midpoint — implementation and regression evidence
- Added canonical Gregorian day validation and half-open Asia/Seoul date bounds to the existing latest-50 `SECURITY DEFINER` public board projection; no schema or permission changes.
- Web adds accessible date filter and rejects unverified `appliedDay` echo; Android gateway rejects duplicate/unknown/invalid day inputs, and rejects stale HTTP 200 responses without the exact applied day and row-level timestamp proof.
- RED confirmed backend 7 failing/new cases and frontend 5 failing/new cases; GREEN: backend 25/25 and frontend 7/7 targeted tests passed.
- Re-fetched origin/main and both living plans at midpoint. No plan file changed in this worktree. Release remains HOLD.
