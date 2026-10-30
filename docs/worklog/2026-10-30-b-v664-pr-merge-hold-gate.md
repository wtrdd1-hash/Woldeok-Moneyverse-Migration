# Backend B v664 — P0 PR merge HOLD enforcement

## Before work — 2026-10-30 19:35 KST

- Starting `origin/main`: `bf8d0d48f810932b43783d8605dce53954c60cff`.
- P0 issue #2031: draft/HOLD PR #2030 merged despite failed `runtime-check`; no claim that the repository workflow performed the merge.
- Live GitHub main protection at start: required checks `classify`, `policy`, `runtime-check`, strict=true, **enforce_admins=false**, no rulesets. This permits admin bypass of required checks.
- Design: preserve existing read-only integration workflow; enforce main required checks for admins in GitHub protection; add fail-closed PR draft/HOLD verification to the existing required CI `policy` job; trigger CI on PR metadata transitions; regression-test both event parsing and workflow wiring. No production runtime, DB, ledger, or user data changes.
- Scope: P0 merge admission, not a guarantee that every GitHub owner/bypass identity is audited. Existing CI/runtime failures and official Test release gate remain separate blockers.

## Plan / progress

- [x] Read AGENTS, README, EN/KO project plans, recent main, QA and CI, PR #2030 and P0 #2031.
- [x] Create isolated worktree and record baseline.
- [x] Enable `enforce_admins` on main and independently re-read protection.
- [x] RED tests for draft/HOLD PR admission and main-protection validation.
- [x] GREEN minimal policy implementation and CI event coverage.
- [x] Recheck latest main and plan, review changes, run local/remote gates (failures retained).
- [x] Draft/HOLD PR #2033 with evidence; no merge or Test/Production promotion.

## In progress

GitHub main branch protection now reports `enforce_admins=true`, `strict=true`, required `classify`, `policy`, `runtime-check`. PR merge admission code pending TDD.

## Finished — 2026-10-30 19:48 KST

- Draft/HOLD PR #2033, branch `auto/hourly-b-v664-pr-merge-hold-gate-20261030-1935`; remote candidate created through GitHub connector because miniPC OAuth credential lacks workflow-write scope. Local and remote trees were compared byte-for-byte by tree SHA.
- GitHub Actions exact remote candidate SHA verified the new policy step rejects the Draft/HOLD PR with `BLOCKED: draft or unknown readiness` (expected failure; NOT an overall CI pass).
- Release regression tests 129/129 PASS; changed-source ESLint with `--no-ignore` PASS; CI YAML parsed by Prettier. Live main branch protection PASS: admins enforced, strict, classify/policy/runtime-check required.
- Offline install PASS, typecheck PASS, backend build PASS, API contract 184 endpoints PASS, contract 41 PASS, database static 62 PASS/4 SKIP, security 17 PASS, production dependency audit no known vulnerabilities.
- Full lint FAIL: one pre-existing frontend receipt-search test parse error (plus 1,043 warnings). Frontend build FAIL: Node 1024 MiB heap OOM. Backend full 2,653 PASS/126 FAIL/501 SKIP. Frontend full 2,701 PASS/55 FAIL. No real PostgreSQL execution or official Test exact-SHA E2E for this control-plane-only change. All required release gates NOT satisfied.
- Additional P0 #1984 read-only finding: public Production version and current symlink advertise main `bf8d0d48...` while backend/frontend processes still run from deleted `prod-v2026.10.30.1515-0669f0f64fea` directories (started 09:52 KST). Test public version remains `c2129625...`. Version endpoint is not executable provenance; actor not attributed. Evidence posted to #1984 and #2031.
- Residual governance: required PR reviews are not configured; owners can still alter protection settings. Independent audit provenance and protected review policy need separate approval.
- No main merge, Test deployment, Production restart/promotion, shared DB or ledger mutation, other developer branch cleanup, or A/B/C/planning/QA reservation changes. RELEASE HOLD remains.


### Midpoint evidence — 2026-10-30 19:42 KST

- TDD RED: new PR eligibility module missing and old main-protection validator accepted admin bypass; exit 1 recorded. Additional stacked-PR case RED, then GREEN.
- TDD GREEN: 14 focused tests PASS; full release test set 128/128 PASS.
- Real GitHub protection JSON passes strengthened validator; real merged PR #2030 metadata is rejected as `BLOCKED: draft or unknown readiness`.
- `pnpm install --frozen-lockfile --offline` PASS; `pnpm typecheck` PASS; Backend build PASS; mobile API contract 184 endpoints PASS; contract 41 PASS; database static 62 PASS/4 SKIP; security tests 17 PASS.
- Full lint FAIL due to pre-existing parse error `frontend/src/app/api/shop/purchases/route.search.test.ts:99` in starting main (1043 warnings). This branch does not touch frontend.
- Frontend build and full Backend/Frontend suites launched in isolated background gate job; results pending. Official isolated Test exact-SHA and Production prohibited.
- P0 #2031 updated with branch-protection containment evidence; no claim of incident actor attribution.
