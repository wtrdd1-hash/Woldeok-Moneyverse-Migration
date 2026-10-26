# A2245 QA — Private active virtual-stock alert CSV integration repair

**Decision: PARTIAL / BLOCKED; do not merge or promote.** Supersedes the gate status (not the history) of A1555 Draft #1425. The repair branch starts at main `0fe614b2ca1a7bc0df540514e54db78130479e2a`, ports the four previously TDD-tested A commits, and corrects Android OpenAPI generated artifacts. No new schema, production data or ledger writes.

## Source / changes
- Isolated branch `auto/hourly-a-repair-stock-alert-export-20261026-2245`; worktree `/srv/moneyverse-data/build-workspaces/a2245-stock-alert-export-repair` on data disk.
- Pre-report verified candidate `7b5e4957d7485b312ae1a54da293481a01fb3185`. Final documentation-only SHA will be recorded in the PR check/comment; no production artifact is claimed.
- 20 changed files before this QA report: owner-scoped backend GET + repository read through existing SECURITY DEFINER, bounded CSV Next route + UI, Android app-api 180-endpoint schema, focused tests and logs. `docs/mobile-api-contract.json` and EN/KO references regenerated to eliminate unsupported manually authored `const=100` schema drift; runtime asserts exact limit 100.

## Verified gates on candidate
- Backend focused 3 PASS; frontend + app-api focused 18 PASS.
- `pnpm api:contract:check` PASS, 180 endpoints / 639 controller methods.
- `pnpm typecheck` PASS; `pnpm lint` PASS (0 errors, 1131 warnings).
- `pnpm test` PASS: contract 38; database 15 PASS / 3 SKIP; backend 1329 PASS / 398 SKIP; frontend 1431 PASS. DB-backed tests are NOT passed merely because skipped.
- `pnpm build` PASS with actual Next production compilation.
- Isolated PostgreSQL scratch `wdmv_a2245_test` cloned from test DB using consistent dump, 281 applied migrations. Transaction fixture 101 active rules: actor 101 visible, other actor 0, `9007199254740993` precision preserved; app direct rule SELECT denied; ledger INSERT denied; ROLLBACK left 0 fixture rows. Source main has 278 migration files, so this is not migration parity or full finance integration acceptance.
- Security production dependency audit PASS (0 known); full dependency audit FAIL (2 critical / 8 high / 11 moderate / 3 low); bot audit FAIL (1 critical / 5 high). Security release gate BLOCKED.
- Exact-SHA Test runtime identity FAIL: public Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, host manifest/backend/frontend/build `9f39f041c336b59f41e9a8c43ea14dc1d29a2586`; candidate is different. Authenticated Test E2E, full backend/API/DB/user-flow and backup/restore gate NOT performed. Production public `6a989b5ac0c6155587d43426d64f6def6b62c917` unchanged.

## Branch and release safety
- Audit at 22:44 KST: 289 remote branches (288 non-main), 282 open PRs (267 Draft), 276 proven unmerged, 10 missing Git objects, 2 proven merged but retained, 9 conflict PRs, 204 PRs with failing checks; no duplicate head SHA. Zero branch deletions. Preserve all unknown and unique commits, including B/C/Gemini work.
- No migration edits, Production writes, service restart, GitOps promotion, rollback invocation or branch cleanup. Existing P0 app-role grants and root disk pressure remain independent blockers. Rollback if later integrated: revert the read-only endpoint/UI/contract code; no schema/data rollback required. Do not promote without a fresh full-gate exact SHA Test and authorized GitOps release.
