# Development A worklog — 2026-10-24 10:25 KST — P0 CI classification repair

Status: **PARTIAL / RELEASE HOLD**. English is canonical; Korean companion follows in `.ko.md`.

## Before
- Connected directly to Debian 13.6 via miniPC system status and shell. Backend/frontend/bot/MCP/nginx/docker active; DB reported `woldeok_moneyverse_dev` with migrator principal, **not proven isolated from Production**. No DB writes, migration or service restart.
- Fetched `origin/main=033ac0ff9671a5f53b41c97eaa1ec9593453dfc0`; read `AGENTS.md`, README, English/Korean project plans in `docs/planning/`, QA v1209, relevant Superpowers skills, 9 open PRs and recent CI. Origin remote refs counted 12 at start; there are additional PR refs not equivalent to remote branches. No other branches modified/deleted.
- Main CI #40049145905 failed in `classify` with exit 2. Root cause reproduced locally: upstream main diff from `5072d43e` includes accidentally tracked `commit_msg.txt`, classified UNKNOWN by fail-closed release classifier. A separate historical PR CI had a credential-like test fixture; it is **not** the same main CI failure. Developer B #1098 changes auto-integration, not this classifier.

## During
- Created isolated branch/worktree `auto/hourly-a-repair-ci-classifier-20261024-1025` from latest main. Plan: `docs/superpowers/plans/2026-10-24-classifier-unknown-root-artifact.md`.
- TDD RED: new exact-path test failed (`UNKNOWN` vs expected `CONTROL_PLANE_ONLY`). GREEN: exact `^commit_msg\\.txt$` in CONTROL_PATHS; removed tracked root artifact. Arbitrary root text remains UNKNOWN. No broad allowlist or CI bypass.
- Code SHA: `f58e7db252a9d9e2065bed1e5301ce73fad23a5f`; files: deleted `commit_msg.txt`; modified `scripts/release/classify-release.mjs` and `.test.mjs`; added engineering plan.
- Local release classifier tests 57 PASS; focused 18 PASS; security scanner and its 2 tests PASS. `pnpm lint` PASS (0 errors, 1,119 warnings); `pnpm typecheck` PASS; `pnpm build` PASS. `pnpm test` **TIMEOUT 100s**, after backend 1,313 PASS/398 SKIP, database 15 PASS/3 SKIP and frontend at least 4 FAIL (3 SEO route + 1 locale). Do not count full test as PASS. `pnpm audit --audit-level high` FAIL: 26 total advisories, 2 Critical/10 High. No authenticated E2E, isolated real-PostgreSQL financial writes, accessibility/SEO/browser acceptance or GitOps release PASS.
- Candidate exact code SHA classifies `CONTROL_PLANE_ONLY`; prior failing main diff reclassified `MIXED` without allowing other unknown root files. Re-fetched main mid-work and pre-push: SHA unchanged.

## After / integration gate
- Created Draft PR #1107; no merge, Test promotion, Production deployment, rollback, DB migration, branch cleanup or service restart. Other A/B/C, QA, Gemini and planning changes retained. Post-push origin refs 15 and open PRs 11 (concurrent jobs changed counts; not all count changes belong to A).
- Gate **BLOCKED**: full frontend suite and dependency audit failed; exact final PR SHA CI, isolated Test/auth/DB/E2E and Production/dev DB separation require independent PASS evidence. Rollback for candidate is revert its PR commit and restore classifier metadata handling if needed; no live state changed. Code fix is not an end-to-end user feature and must not be reported as such.
