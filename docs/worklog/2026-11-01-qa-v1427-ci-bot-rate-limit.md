# QA v1427 — deterministic Discord bot CI installation (DRAFT / RELEASE HOLD)

## Before work — 2026-11-01 03:18 KST
- Authority: `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`; isolated QA worktree and branch `qa/20261101-0315-v1427` on Debian 13.6.
- Read `AGENTS.md`, `README.md`, canonical English and Korean integrated planning masters, infrastructure and release safety rules, and prior QA v1426.
- Existing public Production/Test financial, database and release-identity P0 blockers remain; no Production promotion authorized.

## Root cause and plan — 03:19–03:22 KST
- Draft C PR #2245 exact SHA `f37d6f789337d87c075153fbecec648a8080cdd9` failed `runtime-check` in GitHub Actions run 41226836640 during `npm --prefix bot ci`.
- `youtube-dl-exec@3.1.15` postinstall downloads a yt-dlp release through an unauthenticated GitHub API request, which returned HTTP 403 rate limit on the runner. Bot tests did not execute in that failed job.
- Selected fix: skip the unnecessary external binary download **only in CI** using `YOUTUBE_DL_SKIP_DOWNLOAD=1`; retain bot tests and dependency audit. Runtime bot installation and deployment are unchanged. Alternative rejected: granting broad tokens or ignoring the failing job.

## Implementation and verification — 03:22–03:27 KST
- TDD RED: new regression test failed against the original workflow (exit 1); GREEN: policy 3/3 PASS after minimal workflow edit.
- Offline `npm --prefix bot ci` with the skip flag: exit 0, 74 packages. Bot test: 11/11 PASS. Release policy tests: 141/141 PASS. Repository security tests: 2/2 PASS; security scan PASS; diff whitespace check PASS.
- GitHub OAuth git push was rejected for `.github/workflows/ci.yml` due to missing `workflow` scope; authorized GitHub connector created the identical changes on the remote QA branch. Remote PR #2248 head `7bc5b5746c51ae72dfe9ceb52d00a8f1c63711bd`; local and remote Git trees matched `c8bc353a599df8655b94ce9876e7360daa8a6ad6` before this documentation entry.
- PR #2248 GitHub `classify` PASS and `policy` PASS; `runtime-check` SKIPPED by CONTROL_PLANE_ONLY classification. **Do not treat this as full runtime CI PASS.**

## QA and release gates — FINAL: FAILED / P0
- Independent network-none PostgreSQL 17.11 replay: 316/316 migrations PASS. Separate disposable loopback PostgreSQL 17.11 backend integration: 48 PASS / 2 SKIP (game, auth, shop, bank).
- Official Test still runs old `bc8cd8a6`; latest main is `f13bbce2`. Test migration drift and Production release identity/finance privilege blockers persist. Authenticated full-route E2E and external backup restore are not certified.
- Exact main `f13bbce2`: install/lint (0 errors, 1,022 warnings)/typecheck/full Production build/App API contract (184 endpoints)/contract 41/DB unit 62 PASS 4 SKIP/security 27/backend 2,950 PASS 517 SKIP/frontend 2,901 PASS/bot 11/route inventory 173 routes: all commands exit 0. Separate real PostgreSQL backend integration 48 PASS 2 SKIP, clean migration 316/316 PASS.
- Full dependency audit FAIL: 9 advisories (8 moderate/1 low); Production-only audit PASS (0 known vulnerabilities). Authenticated full-route ledger FAIL due missing five-pass evidence; 170 anonymous GETs are not authentication E2E. External independent backup restore remains BLOCKED.
- Production `verify-financial-readiness.mjs` against actual systemd EnvironmentFiles exit 0 `READY_FOR_OTHER_RELEASE_GATES` with three **operator-accepted existing DML** warnings (accounts/account_balances/system_treasury_vaults), 40 balance rows and 0 unexplained projection. This narrow owner-approved exception must not be misreported as new P0. Marketplace unjournaled SQL, other excess grants, treasury legacy provenance, Test migration drift, Production split-runtime and release identity still block release. Corrective evidence posted to issue #993.
- Final branch audit before publication: 27 non-main remote branches all unique, 351 pairwise comparisons with 39 content conflicts, 26 open Draft PRs; numeric 318 migration collision remains. No developer branch cleanup.
- Full internal evidence: `/srv/moneyverse-data/tasks/Moneyverse-QA-v2026.11.01.1427-internal.md` and `/srv/moneyverse-data/qa-reports/qa1427-evidence/`. Final QA issue #828 update pending publication.

## Release hold and preservation
- No main merge, shared database writes, finance transactions, Test/Production deployment, service restart, Nginx change or collaborator branch cleanup.
- Preserve all independent developer branches and Draft PRs. Promotion requires exact-SHA Test, CI runtime gates, authenticated E2E, financial reconciliation, independent rollback/restore and GitOps approval.

## Finished — 2026-11-01 03:34 KST
- QA code changes only: `.github/workflows/ci.yml` and `scripts/release/ci-bot-security-gate.test.mjs`, plus this worklog. No runtime binary changes. Draft/HOLD PR #2248; no merge or deployment.
- Exact PR GitHub policy and classify checks PASS; runtime-check SKIPPED by workflow classification. This is not full release approval.
- No Production/Test DB writes, finance transactions, service restart, Nginx change, GitOps promotion, or collaborator branch deletion. Existing P0 gates remain.
