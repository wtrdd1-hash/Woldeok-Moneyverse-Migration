# Development C v1229 — Evidence-backed Public Onboarding (DRAFT / RELEASE HOLD)

**2026-10-31 18:16 KST.** Canonical origin/main at start and midpoint: `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`. Independent `auto/hourly-c-roadmap-source-truth-v1229-20261031-1815` worktree on Debian 13.6 miniPC; seven services active, DEV PostgreSQL connected. Reviewed AGENTS, README/README.ko, EN/KO integrated plan, 94 open PRs, latest QA v1417 and concurrent A/B/C Drafts. No shared branch changes.

## Proven P1 and scope
`/roadmap` publicly promised 100,000 WLD in three minutes, guaranteed roulette wins, 7.2% compound interest and a day-30 property landlord outcome. SEO HowTo repeated unsupported claims. Existing backend `GET /api/v1/stocks` reads `public.stock_market_overview()`; no new DB or payment API needed for a truthful introductory guide.

Replaced the public route with three navigable steps (register, work, stocks), source-backed listing count, distinct valid-empty/malformed/unavailable states, and an explicit freshness limitation. The parser rejects duplicate UUID/symbols, noncanonical price/quantity strings and malformed envelopes. No unsupported WLD reward, rent, interest or transaction guarantee is presented. 320px-responsive cards, keyboard-reachable 44px CTAs, screenreader status and accurate public SEO. Legacy simulation source is retained but no longer routed.

## TDD and gates
- RED: 3 new route tests failed before implementation, parser missing; log in task evidence.
- GREEN: 19/19 focused frontend tests PASS (9 parser, 3 server route, 7 legacy simulator).
- Whole lint PASS (0 errors, 1,050 warnings), typecheck PASS, backend/contract/database build PASS.
- Initial Next build FAIL (1 GB heap OOM); 2 GB heap retry PASS. App API contract PASS (184 endpoints); contract 41 PASS; DB package 62 PASS/4 SKIP; security/backup/release guards 26 PASS.
- Production-only dependency audit PASS (no known high-or-higher vulnerabilities); all-dependency audit FAIL (13: 3 low, 10 moderate).
- Full frontend/backend regression, isolated fresh PostgreSQL replay, authenticated official exact-SHA Test/E2E, remote CI and independent restore are not certified at this checkpoint. No release authorization until all mandatory gates PASS.

## Release and preservation
No money/ledger/schema/Production/Test mutations. No main merge or GitOps promotion. Preserve all unique A/B/Gemini/QA worktrees and all five recurring automations. Final test status and exact SHA to be recorded in GitHub issue/PR and independent task evidence; branch remains Draft/HOLD.
