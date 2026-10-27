# Development A — verified help center recovery (2026-10-27 11:50 KST)

## Scope and provenance

- Source: the **uncommitted** A1025 verified-help candidate in `/dev/shm/mv-a-verified-help-20261027-1025`. It was copied, not modified, into a new worktree created from the exact current remote `main` `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`.
- New branch: `auto/hourly-a-help-repair-20261027-1150`. The old A1025 worktree and concurrent A1125 wallet-period, B, C, Gemini and QA worktrees remain untouched.
- Product: default-OFF, evidence-gated Korean/English public help search and detail, administrator draft/independent approval/retraction, and allowlisted read-only Android app API. No WLD/ledger mutation.
- English source and Korean companion plan were inspected; planning v1352 and v1354 are **unmerged DRAFT/HOLD**, not approved production requirements.

## Sequence and reproducible evidence

1. **START / v1:** Debian 13.6 services and database connected; root filesystem at 100%, data filesystem at 99% initially. Main and AGENTS/README/plans/QA/PR/CI inspected. Remote audit before this branch was published: 336 non-main branches, 329 open PRs (314 draft), 53 local `merge-tree` conflicts, 10 branch heads missing local objects. No remote branches deleted.
2. **RED / v2:** `backend/src/route-map.e2e.test.ts` failed to instantiate `SessionGuard`: `SessionRepository` was not exported into `HelpModule` scope. **GREEN:** import `AuthModule` in `HelpModule`; rerun: 141/141 route-map E2E tests passed.
3. **RED / v3:** new English-locale test failed because `help/locale.ts` did not exist. **GREEN:** strict `ko/en` selection, bounded public article links, English search payload and article detail, language selector and English-facing labels; 3/3 focused frontend tests passed. Search terms stay in POST bodies, never in article URLs.
4. **v4 gates:** backend 1,336 PASS / 398 SKIP (DB-dependent tests not falsely claimed); frontend 1,430 PASS; isolated PostgreSQL 17 fixture bootstrap, migration 282, published-only/ACL negatives, replay/approval/retraction and immutable events all PASS. Backend and frontend typechecks PASS, backend build PASS, Next.js 16 webpack build PASS with 2 GiB heap (Turbopack failed due external node_modules symlink; 1 GiB webpack heap failed OOM). Full lint PASS with 1,131 existing warnings; Android app API contract PASS (179 endpoints); Bot tests 8/8 PASS after using existing dependencies.
5. **BLOCKED:** migration parity fails exactly because numbered 280/281 migrations are absent from authoritative main while this candidate adds 282. Never fabricate 280/281 or edit applied migrations. Full `pnpm audit` FAIL: 2 critical / 8 high (plus lower severities); Bot audit FAIL: 1 critical / 5 high. Independent source digest verification, public retraction 410 semantics, complete cursor traversal, authenticated official Test exact-SHA, restore, accessibility/browser E2E and GitOps gate are not approved/complete. Keep feature switch OFF and PR Draft.

## Release and rollback

- Verified official Test `/api/version` = `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production = `6a989b5ac0c6155587d43426d64f6def6b62c917`. Both HTTP 200, neither equals current main or candidate. This is **not** authenticated E2E acceptance.
- No shared/live DB write, official Test deployment, Production deployment, main merge, branch deletion, feature switch enable or WLD mutation. Rollback is not required because no environment was changed.
- Retain all unique branch heads and other agents' worktrees. Release status **DRAFT / BLOCKED / PRODUCTION HOLD**. The new code is a preserved development candidate, not a shipped user feature.
