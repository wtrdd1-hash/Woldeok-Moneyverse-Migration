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
