# Development C v1240 — Watchlist Source Integrity

## Before work — 2026-11-01 00:41 KST
- Host: Debian 13.6 miniPC, seven services active, development PostgreSQL connected.
- Starting canonical origin/main: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`.
- Reviewed AGENTS.md, README, Korean README, EN/KO project plans, open PRs and CI, recent QA, A/B and C work. Existing C PR #2225 handles protected HTTP headers; B #2227 handles marketplace settlement; no active watchlist change identified.
- Confirmed P1: `/stocks/watchlist` trusts unvalidated API values, and `BigInt()` may throw for malformed prices. `changeBasisPoints` truncates small movements and can mis-sort distinct changes. API source is authenticated `GET /api/v1/stocks/watchlist`, backed by `stock_my_watchlist(actor)`.
- Bounded design: fail closed on malformed/duplicate rows instead of rendering fabricated or partial results; preserve verified empty state; compare percent changes by exact cross multiplication; keep existing read-only API, no DB/ledger mutation. Mobile, keyboard, SEO and accessibility behavior must remain.
- Alternative rejected: dropping bad rows would falsely imply a shorter verified watchlist. Broad backend/schema changes unnecessary for this read-only correction.
- [x] RED regression tests. [x] GREEN source validation and exact sorting. [x] Local focused and full verification. [x] GitHub Draft PR #2228 and release HOLD evidence.

## In progress — 2026-11-01 00:43 KST
- TDD RED confirmed: new source-integrity test fails to import the not-yet-implemented parser (expected). Added query normalization and sub-basis-point label assertions before implementation.
- Worktree isolated under `/srv/moneyverse-data/tasks/mv-c-v1240-watchlist-truth/repo`. No shared processes or databases changed.
- TDD behavior RED: 5/5 regression assertions failed on deliberate stub; GREEN: 5/5 parser/sort and 3/3 server-rendered owner UI tests passed.
- Added strict UUID/ISO timestamp/integer/duplicate validation, exact cross-multiplication for change sort, zero-baseline unknown ordering, bounded repeated query normalization, authenticated fail-closed retry, and private robots metadata. Existing Nest owner API and PostgreSQL SECURITY DEFINER read unchanged.
- Mid-run origin/main re-fetched: unchanged `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`.

## Finished — 2026-11-01 00:56 KST (DRAFT / RELEASE HOLD)
- Code candidate `8e16d8c2fecac8ad675450a88a7ac18fcf5012ae` (final documentation checkpoint advances HEAD; rerun exact HEAD gates afterward). GitHub Draft PR #2228, not merged.
- Lint PASS (0 errors, 1,016 warnings), typecheck PASS, full build PASS, 184-endpoint app-api contract PASS. Full workspace tests PASS: contract 41, database 62 PASS / 4 SKIP, backend 2,944 PASS / 517 SKIP, frontend 2,909 PASS. Skips are not passes.
- Security production-dependency audit PASS (no known vulnerabilities); all-dependency audit FAIL (9: 1 low, 8 moderate). Full-route QA evidence FAIL because `artifacts/qa/full-route-ledger.json` is absent.
- Real isolated PostgreSQL 17.11: 316/316 migrations applied, app-role `stock_my_watchlist(uuid)` EXECUTE=true, direct `member_stock_watchlist` SELECT=false; seeded two owners return only their own VA1240/VB1240 symbols. Network disabled; test containers removed. No shared DB writes.
- Independent Next.js HTTP unauthenticated probe returned HTTP 200 with a framework error because INTERNAL_API_TOKEN was intentionally absent. This is **not** an authenticated E2E PASS. HTTP `X-Robots-Tag: index, follow` still overrides page noindex on this main; C Draft #2225 already addresses that separate issue, so no duplicate change here.
- Official Test `/frontend-version` and `/api/version` both `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not candidate. Production `/frontend-version` returned timestamp `1793450413898` while `/api/version` returned main `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; provenance mismatch. Production watchlist edge advertises index/follow. Exact-SHA official authenticated Test E2E, release identity, restore and GitOps gates remain BLOCKED.
- Mid and pre-merge main re-fetch: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, unchanged. No merge, Test deployment, Production promotion, GitOps, financial writes, rollback or branch deletion. All other A/B/QA/Gemini work preserved; five existing automations unchanged.
- CI `classify`/`policy` passed; `runtime-check` and Test candidate workflow still in progress at final documentation checkpoint. Draft/HOLD until exact final HEAD CI and all release gates pass.

## Integration checkpoint — 2026-11-01 01:04 KST
- `origin/main` advanced from `353c6d5d6...` to `f13bbce273ffc65e8576170992d82ea00c27a1c9` (Telegram PR #2226). Diff contains backend/Telegram and `implementation_plan.md`, no watchlist, planning, AGENTS or README overlap. Rebased the isolated branch on the new main; source and full exact-HEAD gates must be rerun. This supersedes the earlier pre-merge snapshot; **no merge was attempted**.
