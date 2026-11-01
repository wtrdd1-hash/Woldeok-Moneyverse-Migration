# A 2026-11-01 12:25 — Shop upkeep ceiling source truth

## BEFORE (2026-11-01 12:54–13:00 KST)
- Source: origin/main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, fetched; AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md reviewed. EN authoritative, KO second language. QA/CI/PR and branch inventory inspected.
- 84 remote heads including main and 82 open PRs at audit. Existing local main dirty `implementation_plan.md` preserved; isolated worktree only.
- Debian 13.6, backend/frontend/nginx/docker active; DEV PostgreSQL connected. Host has ~647 MiB available RAM and high parallel task load: avoid concurrent heavy test workers.
- P1 issue: `/shop` sends `maxUpkeep`, Nest catalogue routes do not accept it, risking false weekly upkeep ceiling claim. No migrations, grants or financial writes permitted.

## IN PROGRESS
- [ ] RED baseline + regression tests
- [ ] Nest explicit upkeep cap and source verification
- [ ] Android fail-closed cap and web truth
- [ ] exact-SHA test/CI/DB evidence and full gate disposition

## FINISHED
- Pending; no merge or deploy authorized until all gates.

## IN PROGRESS checkpoint (12:57–13:00 KST)
- TDD RED reproduced: explicit Nest maxUpkeep 7/7 FAIL; Android/web 5 new cases FAIL. Root cause: public/member controller signatures do not accept `maxUpkeep`, and Android gateway forwards success-shaped unfiltered data; web renders false zero on source failure.
- GREEN: Nest explicit `maxUpkeep` validated before DB read; exact string BigInt ceiling after source read; session actor preserved. Android duplicate/noncanonical input 400 and unverified HTTP 200 503; filtered responses private/no-store/noindex/no-referrer. Web verifies source ceiling and suppresses false zero.
- Focused tests: backend 22/22 PASS, frontend 15/15 PASS, with one pinned CPU and single Vitest worker after initial host thread exhaustion. No migration, balance, grant, Test, or Production change.
- Initial baseline one-worker Vitest without CPU affinity failed OS thread creation (resource limit), resolved by CPU affinity and RAYON_NUM_THREADS=1; no other worker killed.
