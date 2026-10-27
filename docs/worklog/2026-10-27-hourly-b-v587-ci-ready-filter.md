# Backend B v587 — QA P1 #1558 Auto Integrate API quota containment

**Status:** CODE CANDIDATE / DRAFT + HOLD. No merge, Test deployment or Production promotion.

**Source main (start/mid):** `c2a9306ddc0424438bc0ab297ea9543bb167aee6`.

**Branch:** `auto/hourly-b-ci-ready-pr-filter-v587-20261027-1735`.

## Source and impact

QA #1558 reproduced GitHub Actions installation API 403 in the automatic branch drain. The workflow enumerated all open-main PR heads, then performed branch, compare and pull-request REST calls before checking whether each PR was draft. A fresh read-only GitHub snapshot during this work observed 358 open PRs, 343 draft, 15 ready, 336 draft allowlisted-prefix heads and **zero ready allowlisted-prefix heads**. This is CI control-plane reliability, not application test failure. No automatic merge eligibility is broadened.

## Change

- `.github/workflows/auto-integrate-promote.yml`: materialize paginated open-main PR snapshot with checked exit status; API 403/partial snapshot causes hard failure before branch processing. Run unit-tested ready/WIP/allowlist selector before per-branch calls. Add explicit snapshot and skip counts. Revalidate PR head/state before cleanup and recheck draft/hold/title/exact head immediately before merge.
- `scripts/release/select-integration-prs.jq`: filter draft/unknown, WIP labels/titles, forks, disallowed prefixes before branch REST.
- `scripts/release/auto-integrate-ready-filter.test.mjs`: 270 draft + 15 ready negative fixture, ready positive, unknown draft, HTTP 403 fake-GH no mutation, head/readiness guard.
- No API or DB contract changes. No migration or direct financial ledger writes.

## Verification (candidate worktree)

- TDD RED: selector missing and workflow lacked checked pagination; fresh readiness-guard test also failed before implementation.
- TDD GREEN: focus 6/6; all release tests 62/62.
- `pnpm typecheck`: PASS.
- `pnpm lint`: PASS (0 errors, 1,132 existing warnings).
- `pnpm test`: PASS (Backend 1,326 PASS / 398 SKIPPED; Frontend 1,427 PASS). Skips are not counted as passes.
- `pnpm build`: PASS.
- Bash syntax, Prettier YAML/JS parsing, git diff check: PASS.
- `pnpm audit --audit-level high`: FAIL (2 Critical, 8 High, 11 Moderate, 3 Low).
- `npm --prefix bot audit --audit-level high`: FAIL (1 Critical, 5 High).
- Isolated real PostgreSQL: NOT APPLICABLE to this CI-only no-DB change; full mandatory finance/DB release verification still BLOCKED.
- Official Test exact-SHA/auth/core-flow/Production GitOps: BLOCKED; no Test candidate deployment or release requested.

## Isolation / handoff

Debian 13.6 miniPC healthy at start; root and data volumes 82% and 72% used. A/C/QA/Gemini branches and drafts not changed. No branch deleted, no workflow/automation disabled, no PR merged, no Production promotion. Final candidate SHA, CI and PR status to be appended in PR review evidence after push.
