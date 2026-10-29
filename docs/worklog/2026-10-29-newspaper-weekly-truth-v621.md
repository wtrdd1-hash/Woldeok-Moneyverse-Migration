# B v621 — Weekly economic brief evidence integrity

## Before work — 2026-10-29 02:35 KST
- Base main: `35971c600f25869c96f1c666d4b9f58927202730`; isolated branch `auto/hourly-b-newspaper-weekly-truth-v621-20261029-0235`.
- Read AGENTS, README, current main EN/KO plans, QA v1354, open PRs/CI. No overlapping newspaper weekly-brief PR. Preserve A/C/Gemini/QA worktrees and shared finance DB.
- Initial chat cursor hypothesis was **already fixed on actual origin/main**, though stale shared checkout still had parseInt. Independent RED tests returned 86 GREEN before implementation; removed redundant tests without reporting a fix. Pivot to a genuinely reproducible P1 defect.
- P1 defect: `GET /api/v1/newspaper/weekly-brief` returns `success:true` and invented M0, weekly sink, inflation, stock-volume and named-member leaderboards even without a DB. It silently catches DB errors and rounds 64-bit WLD with Number. The Next.js `WeeklyWorldBrief` defaults to equally invented figures when the API fails. This is false public financial/market reporting, not verified ledger evidence.
- Safe scope: fail closed with typed HTTP 503 until the *whole* weekly-brief report has verified source-backed data; show explicit unavailable state on web, never substitute demo values. Keep live market pulse, public educational articles and other newspaper functions unchanged. No migrations, WLD or DB writes.

## TDD and verification
- [x] RED backend and frontend tests for missing DB, query failure, fabricated data, unavailable UI, normal verified-data rendering.
- [x] GREEN backend fail-closed contract, frontend unavailable state and test-only fixture migration.
- [x] Focused tests, backend full, typecheck/lint/build, security/API contract, isolated PostgreSQL if relevant and resource-safe.
- [x] Refresh main/plans and PR overlap mid-work, publish Draft+hold PR and evidence; Production prohibited until exact-SHA gates.

## In progress
Pending implementation.

## Finished
Pending final SHA. No merge or deployment authorized.

## In progress — verified checkpoints
- Chat hypothesis abandoned because actual main already contained the fix; redundant tests removed. No false RED or code success claimed.
- RED: Backend 3/3 fail because route returned fabricated success (no DB, DB error, partial WLD evidence). Frontend static-render test 1/1 fail because default fabricated 12,450,000 WLD, 1.4% inflation, named leaders rendered without API data. Initial React Testing Library run failed due shared React.act environment; replaced with static SSR test to isolate actual behavior.
- GREEN: Backend unit 8/8, HTTP 2/2, Frontend 3/3. The weekly-brief API now returns typed 503 before any SQL and Swagger advertises 503. UI shows a readable unavailable state; demo fixture moved to test-only file. Other public newspaper pulse unaffected.
- First Backend full run used an incomplete shared `node_modules` link and failed module resolution for `undici`; no code conclusion drawn. Switched only this worktree's symlinks to v620's complete dependency tree. Backend full rerun **1,944 PASS / 440 SKIPPED**; Database unit **46 PASS / 4 SKIPPED**; Typecheck, Backend Build, Lint (0 errors, 1,099 warnings), 180 API contract and repository security scan PASS.
- Dependency audit FAIL: `qs@6.16.0` Moderate advisory, patched >=6.16.1, already tracked by QA Draft PR #1687. No dependency edits to avoid overlap. Full frontend/Next.js build, isolated official Test exact-SHA, real PostgreSQL full schema and authenticated E2E not certified; shared disk 98% and /tmp 96% prohibit resource-heavy gates. No financial or Production change.
- Mid-work main re-fetch: `35971c600f25869c96f1c666d4b9f58927202730` unchanged. EN/KO current-main plans re-read; QA v1354 still FAILED/HOLD.

## Integration overlap discovered before PR
- GitHub all-state PR search found **closed, unmerged C #1405** (2026-10-26) with a richer verified balance-snapshot design for the same weekly-brief defect. It is not in current main and has no open competing PR; do **not** delete or overwrite its history. This v621 patch is a narrower **fail-closed containment**, not a replacement or claim of unique feature completion. The broader C source-backed snapshot should be reviewed/recovered and may supersede this patch. Also found closed C #1215 for the separate newspaper poll; deliberately left poll untouched.
- Merge hold is mandatory until the C #1405 recovery/reconciliation decision, complete official Test gates and security audit. This worktree does not touch other workers' branches.

## Finished — source candidate only
- Backend/API and public unavailable UX implemented and tested. Full release acceptance remains **BLOCKED**. No Test/Production deployment or DB mutation. PR Draft+hold; branch preserved.
