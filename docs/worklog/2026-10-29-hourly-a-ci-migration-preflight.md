# 2026-10-29 Development A — P0 migration preflight and branch preservation

## Before work — 18:22–18:24 KST
- MiniPC Debian 13.6 and backend/frontend/Discord/nginx/docker active; DEV PostgreSQL reachable. Start main `5faa7de1aaa41939260d601496d57dca4175897c`; source read: AGENTS.md, README.md, living English/Korean plans, QA v1370, prior A worklog, open PRs and CI.
- Initial remote refs: 79 including main; 76 open Draft PRs. QA v1370 independently recorded 93 non-main refs (77 conflict, 16 merged). No remote mutation before audit.
- P0 #1878: source migration numbers 291/292/293/295 collide, and real DEV DB records 293 applied migrations. The latest integration added more colliding files; no applied SQL or checksums may be rewritten.
- Isolated local clone + linked worktree, branch `auto/hourly-a-repair-migration-lineage-20261029-1825`. Design and step plan recorded before source changes in `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-29-1825/design-and-plan.md`.

## During work — 18:24–18:36 KST
- TDD RED: duplicate-number test failed (missing exception); gap/empty and preflight tests failed before implementation. TDD GREEN: six Node tests passed. `ci-apply.mjs` now rejects repeated numeric IDs, gaps and empty migration directories **before** requesting credentials or executing any SQL. Original 300+ migration files remain byte-identical.
- Main moved through `9cd4bc86`, `ac2b4630` and `76d63a5840a4a185fcaeb02f8b1132dd145f19e4`. Rebasing was limited to this branch; integrated planning files and all other developer worktrees were left untouched.
- **New P0 branch incident:** at 18:30 the remote was down to main alone and 0 open PRs. Reconciliation of the 76 initial PRs: 62 marked MERGED, **14 CLOSED but not merged**. Restored **77/77** QA conflict-classified refs at their exact original SHA, without force-updates; reopened **14/14** unmerged Draft PRs. Independent post-recovery audit: 78 refs including main, 14 open Draft PRs, all 14 PR heads exact. See #1663 and internal evidence. The 62 merged PRs have not been certified patch-equivalent to main, so their refs were preserved.
- GitHub REST-token ref creation returned 404; GitHub connector creation succeeded. No other PR was merged, and no branch was deleted by this task.

## Verification and release state — 18:37 KST
- Final local patch commit (rebased): `8065fbb1056ffb75b5552e96dbbdd830ea288542` against `76d63a5840a4a185fcaeb02f8b1132dd145f19e4`. Changed code: `packages/database/ci-apply.mjs`, `packages/database/ci-apply.test.mjs`; this worklog is a separate documentation commit.
- Targeted Node helper tests: **6 PASS**. Initial full ESLint: **0 errors, 1,047 warnings**; final SHA full ESLint **FAIL (1 pre-existing frontend reauth test error, 1,047 warnings)**. Production dependency security audit: **0 known vulnerabilities**.
- Full typecheck **FAIL** (five existing backend duplicate/missing-export errors on integration main); full build **FAIL**; full `pnpm test` **FAIL** (mobile API contract generated-doc drift); migration parity **FAIL** (1/6, duplicate IDs). These are explicit release blockers, not claimed as patch passes.
- Real DEV PostgreSQL read-only inspection: 293 applied migrations; **no DB DML/DDL**. Isolated real PostgreSQL replay and official Test exact-SHA authenticated E2E **BLOCKED** by migration collisions; Production promotion prohibited. Test/Production unchanged by this task. Rollback: revert the unmerged preflight PR; no database rollback required. Any future applied SQL correction must be forward-only.
- No new user-facing end-to-end feature was delivered; this is P0 containment, not feature completion. Preserve all restored refs and unresolved historical 462-ref recovery evidence.

### Additional independent audit — 18:39 KST
- Fetched every restored ref into this isolated clone. **All 77/77 original head SHAs are now ancestors of main `76d63a58`**; this cohort has **0 unique commits outside main**. The 14 reopened Draft PRs remain for deliberate review of GitHub's closed-but-unmerged metadata, not as evidence of lost code. This does **not** certify functional/financial acceptance. The older 462-ref incident remains separate.
- PR #1880 is Draft/HOLD. At 18:38 there were 79 remote refs (main + 77 restored + this repair branch), 15 open Draft PRs, no PR head mismatch. No branch or PR cleanup performed by this task.

### Exact-SHA CI and final gates — 18:41 KST
- Candidate `60681d22df9e5ec6cb428ce505ffa183dd95ef0c`: CI run `40851281013` **FAIL** (runtime-check failed at existing `frontend/src/app/account/security/reauth-authorization-receipt.test.ts:60` ESLint error); candidate run `40851273248` **FAIL**, image build and Production dispatch **SKIPPED**. No claim of CI or image PASS.
- Final local targeted ESLint **PASS**; helper Node **6/6 PASS**; Android app-api **37/37 PASS**; Backend help targeted **7/8 PASS, 1 FAIL** (pre-existing result payload vs whitespace test mismatch). Full typecheck **5 errors**, build **FAIL**, full test **FAIL** (API generated-doc drift), parity **1 FAIL / 5 PASS**, production dependency audit **0 known vulnerabilities**. Exact Test/Production both serve `c2129625aa6629c616fb31ce790950618b8d92b2`, not this candidate.
- These failures are outside the preflight guard and remain unmodified for independent repair. Candidate is Draft/HOLD; no merge, deployment, DB migration or branch deletion.
