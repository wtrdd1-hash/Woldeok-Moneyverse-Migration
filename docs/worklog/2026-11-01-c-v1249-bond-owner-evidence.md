# C v1249 — Owner virtual-bond evidence and outage integrity

## BEFORE WORK (2026-11-01 06:15 KST)
- Baseline: `f13bbce273ffc65e8576170992d82ea00c27a1c9` from freshly fetched `origin/main`; independent `auto/hourly-c-bond-owner-evidence-v1249-20261101-0615` worktree.
- Read AGENTS.md, README.md, README/README.ko.md, English canonical and Korean PROJECT_PLAN, open PRs (including C #2267, A #2264, B #2266, QA #2263), latest main, and bond backend SQL/controller.
- Proven P1 gap: public `/bonds` maps *any* owner holdings fetch failure to `isLoggedIn=false`, maps repo read failure to `[]`, and accepts arbitrary JSON as financial holdings; this can claim an authenticated member is logged out or has zero loans. Repo and subscription writes already return 503 in Nest; never imply they can settle.
- Bounded design approved by standing automation scope: authenticate independently, verify exact owner holdings/repo data shape before display, distinguish guest / verified empty / unavailable, prevent financial actions on unverified owner data, preserve public market and existing owner SQL functions. No DB or ledger mutation. Keyboard retry, mobile and screen-reader status. No index private data.
- Plan: (1) RED tests for malformed/duplicate owner data and API outage; (2) implement pure owner read validators; (3) integrate SSR + client guarded states; (4) focused and whole-repo gates, isolated PG, official CI/Test if available; (5) review, log, PR, HOLD unless all release gates pass.
- Guardrails: do not touch other A/B/QA/Gemini worktrees, dirty main `implementation_plan.md`, existing schedules, shared DB, Test or Production.

## IN PROGRESS
- Pending tests and implementation.

## FINISHED
- Pending evidence and release decision.
