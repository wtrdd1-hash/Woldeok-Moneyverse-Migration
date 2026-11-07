# Development C v1309 — First-day onboarding evidence (DRAFT / RELEASE HOLD)

## START — 2026-11-02 21:11 KST
- Debian 13.6 miniPC status: seven principal services active; DEV PostgreSQL connected.
- Origin/main starting SHA: 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b.
- Branch: auto/hourly-c-first-day-source-v1309-20261102-2110, independent clean worktree.
- Inspected AGENTS, README, README/README.ko.md, EN/KO PROJECT_PLAN, PRs, CI, QA, A/B/C/planning activity. Open #2395 covers quest board, not first-day flow; #2339 protects early-game backend edge, not response evidence.
- P1 source defect: /quests assumes firstDay.steps is an array and trusts step_done, amounts and step_href; Android app-api forwards malformed success and upstream cache policy. Source: migration 103 early_first_day_flow, Nest GET /api/v1/early-game/first-day. Scope: one read-only owner onboarding feature. No new SQL, writes, ledger, or DB privileges.
- RED tests before implementation; re-fetch main mid-run and before any merge. No release without every gate PASS.

## MID — 2026-11-02 21:15 KST
- Re-fetched origin/main, still 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b. Active A/B/QA/planning PRs unchanged for this feature.
- RED reproduced: 20 missing-parser tests and 3 Android gateway tests failed. Initial default Vitest worker pool timed out under shared host load; reran deterministically with one thread, no file parallelism.
- GREEN: 24/24 focused parser, Android gateway and SEO config tests passed after fail-closed implementation. Added accessible 44px link target and SSR regression.
- No DB writes or migrations. Candidate not merged or deployed. Continue exact-SHA gates.

## END — 2026-11-02 21:32 KST (DRAFT / RELEASE HOLD)
- Candidate implementation commit b28d1190c9c0d980671e390f7a28e0e55f73a016. Main re-fetched at start, mid, and before PR: 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b (unchanged). Final documentation commit HEAD and CI are recorded in PR.
- P1 implemented: strict SQL-shaped first-day step parser, canonical nonnegative PostgreSQL bigint values, no duplicate step codes, metric/verified/completed consistency, allowlisted local links, safe verified-empty vs unavailable, Android owner GET 503 fail-closed and sanitized 401/403/429/5xx, private no-store/noindex/no-referrer, six localized private Next route headers, accessible 44px focusable navigation.
- Existing backend Nest session/consent/active-member guard and public.early_first_day_flow from migration 103 reused; no database schema, ledger, user, feature switch, or production mutation. Validation alone is not cryptographic proof of SQL provenance.
- RED: 20 parser and 3 app-api cases reproduced failures before fix. GREEN: focused parser/Android/SEO 24/24 PASS; SSR navigation 1/1 PASS.
- Typecheck: contract, database, backend, frontend all PASS individually. Initial root recursive typecheck FAILED transient /bin/sh Cannot fork under concurrent host load. Lint PASS (0 errors, 1,027 warnings). Backend Nest build PASS; Next standalone build PASS.
- Backend full unit/integration: 2,981 PASS, 2 FAIL (profile-private-response.http.test.ts expected 200, got 401), 518 SKIP. Not called PASS. Frontend full: single-thread run worker teardown FAIL, fork-mode retry timed out at 230 seconds; no full-suite PASS. No false count claimed.
- Isolated PostgreSQL 17.11: 323/323 migrations 002–324 applied. Real early-game SQL tests 13/13 PASS (incl. actor rejection and least privilege). Database package 62 PASS, 5 SKIP. Test container is disposable and is removed at end.
- Mobile API contract 184 endpoints PASS. Security advisory policy tests 14 PASS; production dependency high+ audit PASS. Full dependency audit FAIL: 9 vulnerabilities (8 moderate, 1 low).
- Route ledger QA FAIL: artifacts/qa/full-route-ledger.json missing. Official authenticated browser/Android E2E and official exact-SHA Test backend/API/DB/auth/user flow BLOCKED; independent restore not executed.
- Standalone Next HTTP: /quests and /en,/ko,/ja,/zh,/vi/quests all HTTP 200 and private/no-store/noindex/no-referrer; /frontend-version exact implementation commit b28d1190c9c0d980671e390f7a28e0e55f73a016.
- Official Test frontend-version abfbb8aee63393c9f58e72159bd5bcab06f99412; Production 6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e; both /health HTTP 200. Neither matches candidate. Public health is not login or backend SHA attestation.
- Release: no main merge, no official Test or Production deploy, no GitOps promotion, no rollback needed. No foreign worktree/PR/branch deleted. Preserve draft branch and dependency PRs, A/B/Gemini/QA tasks and all five scheduled automations unchanged.
- Outcome: PARTIAL / RELEASE BLOCKED. Do not merge or promote until complete suite, QA ledger, vulnerability policy, CI, authenticated E2E and exact-SHA official Test all pass. English canonical; Korean parity.
