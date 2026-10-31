# Development C v1245 — Stock League Source Truth (English canonical)

## BEFORE WORK — 2026-11-01 03:44 KST
- MiniPC Debian 13.6 reachable; seven services active and development PostgreSQL connected (system status read).
- Source main `f13bbce273ffc65e8576170992d82ea00c27a1c9`; worktree branch `auto/hourly-c-league-truth-v1245-20261101-0345`; main has unrelated dirty `implementation_plan.md` and is untouched.
- Read AGENTS.md, README.md, README/README.ko.md, canonical docs/planning/PROJECT_PLAN.md and PROJECT_PLAN.ko.md; inspected all 25 open PRs and recent A/B/QA/planning drafts. Avoided A gallery search, B schema and QA CI tasks, prior C stock comparison.
- P0/P1 evidence: /stocks/league shows hardcoded five whales, 184.2% ROI, 24 traders, 1,480,000 WLD, a fabricated active subscription, and on network failure locally declares successful copy-trade subscription. Backend subscribe already returns 503 pending ledger settlement; current GET can return real season/whales or no season.
- Risk: misleading financial metrics and unjournaled trading success; never invent balances, leaderboard, or subscriptions.

## PLAN
- [x] TDD: verify strict league response parser and reject malformed or duplicate evidence.
- [x] Replace fabricated client and subscription controls with verified, read-only league display; handle error/empty/loaded states, mobile, keyboard and screen readers.
- [x] Protect BFF response headers and page SEO; add regression tests.
- [ ] Validate exact HEAD lint/typecheck/build/unit/integration/PG/security/app-api/E2E/CI; record PASS/FAIL/BLOCKED truthfully.
- [ ] Re-fetch main, publish draft PR if unverified; do not merge or deploy unless all release gates PASS.

## IN PROGRESS
- 03:45 TDD RED: original fabricated UI, missing parser and absent BFF privacy headers caused test failures.
- 03:47 GREEN: 11 focused parser/UI/BFF tests passed with NODE_ENV=test. Initial jsdom test attempt without NODE_ENV=test failed with React.act; fixed runner invocation. New BFF test initially failed due Vitest hoisted mock; corrected.
- 03:47 workspace typecheck PASS after building local contract. First typecheck failed because contract dist had not been built; no source defect.
- Mid-run origin/main still `f13bbce273ffc65e8576170992d82ea00c27a1c9`. Existing BFF GET and Nest current league read retained; copy-trade subscription POST already returns HTTP 503. No database, ledger, or schema write.
- Pending full gate runs and official Test/Production verification.

## FINISHED
- Pending.
