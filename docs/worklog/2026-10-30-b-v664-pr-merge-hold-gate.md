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
- [ ] Recheck latest main and plan, review changes, run local/remote gates.
- [ ] Draft/HOLD PR with evidence; no merge or Test/Production promotion.

## In progress

GitHub main branch protection now reports `enforce_admins=true`, `strict=true`, required `classify`, `policy`, `runtime-check`. PR merge admission code pending TDD.

## Finished

Pending.

### Midpoint evidence — 2026-10-30 19:42 KST

- TDD RED: new PR eligibility module missing and old main-protection validator accepted admin bypass; exit 1 recorded. Additional stacked-PR case RED, then GREEN.
- TDD GREEN: 14 focused tests PASS; full release test set 128/128 PASS.
- Real GitHub protection JSON passes strengthened validator; real merged PR #2030 metadata is rejected as `BLOCKED: draft or unknown readiness`.
- `pnpm install --frozen-lockfile --offline` PASS; `pnpm typecheck` PASS; Backend build PASS; mobile API contract 184 endpoints PASS; contract 41 PASS; database static 62 PASS/4 SKIP; security tests 17 PASS.
- Full lint FAIL due to pre-existing parse error `frontend/src/app/api/shop/purchases/route.search.test.ts:99` in starting main (1043 warnings). This branch does not touch frontend.
- Frontend build and full Backend/Frontend suites launched in isolated background gate job; results pending. Official isolated Test exact-SHA and Production prohibited.
- P0 #2031 updated with branch-protection containment evidence; no claim of incident actor attribution.
