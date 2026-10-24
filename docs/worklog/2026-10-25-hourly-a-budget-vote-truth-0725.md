# A0725 — Verified citizen budget priority vote (2026-10-25)

## Before work — 07:20 KST
- Debian 13.6 miniPC reachable; backend/frontend/bot/MCP/nginx/docker active. Root 100% (585 MiB free); data disk 101 GiB free. Worktree on data disk; no other worktrees touched.
- Source main `c9a868b1e622341e2daa8b936ddf0988eda9988e`; 117 remote heads; 113 open PRs; existing A/C/B/Gemini branches remain unmerged. Draft #1228 covers tax receipt and #1234 credit policy; avoid overlap. Prior A QA full frontend 6 failures and dependency advisories; CI release HOLD.
- Read AGENTS, README, EN canonical docs/planning/PROJECT_PLAN.md and KO counterpart, integrated master, latest planning #1235, recent A #1234, CI. Applicable Superpowers method (worktree isolation, plan, TDD red/green, verification) followed; skill files not installed on miniPC.
- P0/P1 feature: make citizen quarterly budget priority vote actually submit through the authorized Next server-action -> Nest -> PostgreSQL SECURITY DEFINER function path; four UI values currently do not match database enums, and direct browser POST `/api/v1/` is not exposed. Eliminate synthetic success, prevent invalid quarter and unverified success/ledger claims; Android app-api parity.
- No migrations, grants, finance ledger writes, production/test writes or deployment. No changes to other workers. Existing database upsert behavior allows one mutable choice per member/quarter; do not promise immutable one-time ballot.

## Plan (TDD, isolated)
1. Add backend unit tests for validated quarter/choice, fail-closed missing repository, and controller DTO; frontend server-action tests for confirmed success, CSRF gateway, errors, and false-success payload.
2. Implement authenticated backend input checks, explicit DTO, no synthetic success; Next server action through `mutate`, correct four radio values, safe success/error semantics and no false ledger claim.
3. Verify mobile app-api route/contract, add regression; real isolated PostgreSQL read-only function/ACL verification without casting a vote.
4. Run focused and full required gates, audit latest main mid/finish, commit, push Draft PR; HOLD on any failed gate.

## In progress
- 07:25 KST: isolated worktree created from main; preparing RED tests.

## Finished
- Pending.

## In progress — 07:29 KST
- RED: missing contract module/action failed as expected. GREEN: shared 2, backend 28, frontend+Android gateway 16 focused PASS; typecheck PASS. Four DB choice values now match UI; browser writes use CSRF server action, no false success on transport/receipt failure; tax read failures no longer appear as zero paid.
- Android contract added (180 endpoints), gateway POST forwarding test; generated schema docs updated.
- Isolated PostgreSQL `woldeok_moneyverse_ci` read-only probe found treasury vote function absent (`function_present=0`), so authenticated real-PG vote test BLOCKED; no database writes attempted. Do not use Production-connected 5433.
- Main re-fetched at 07:26 and remains c9a868b1e622341e2daa8b936ddf0988eda9988e. Other worker branches preserved.

## Finished — 07:35 KST (release hold)
- TDD: shared contract 2 PASS, focused backend 28 PASS, focused frontend+Android 16 PASS. Full backend 1,320 PASS/398 SKIPPED; full frontend 1,403 PASS/6 FAIL (existing locale/SEO/login/admin telemetry). Typecheck, lint (0 errors), default backend/frontend build, Android contract (180) PASS. Production audit 2 High, full audit 2 Critical/10 High, bot audit 1 Critical/5 High FAIL.
- Isolated PG `woldeok_moneyverse_ci`: connection PASS, 214 migrations, treasury vote function/table absent, ledger INSERT grant denied, ROLLBACK. No vote E2E; official Test exact-SHA authenticated flow blocked. Production-connected DB untouched.
- Before release audit: main unchanged, 118 remote heads (117 non-main with unique ahead commits), 113 open PRs, three known conflicting PRs, no duplicate tip patch IDs; no deletions or edits to other workers.
- Feature checkpoint `1e60a7a0fc576de6c22961a8bbe506ffe649581f`; QA reports `docs/releases/v2026.10.25.a0725.md` and `.ko.md`. No main merge, Test promotion, Production/GitOps, service restart, database/ledger mutation, rollback execution or branch deletion.
- Decision: Draft / PARTIAL / BLOCKED. Root causes and evidence in release reports and remote PR. Exact final reporting SHA and CI to be added to PR after push.
