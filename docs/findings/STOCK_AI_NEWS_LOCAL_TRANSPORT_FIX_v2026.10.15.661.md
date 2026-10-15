# Stock AI News Local Model Transport and Live Pulse — v2026.10.15.661

**English canonical** · Korean companion: [STOCK_AI_NEWS_LOCAL_TRANSPORT_FIX_v2026.10.15.661.ko.md](STOCK_AI_NEWS_LOCAL_TRANSPORT_FIX_v2026.10.15.661.ko.md)

## Scope and authority

- Baseline `origin/main=57b37a3899964d805219f98f355c70bf1e052c05`, after start/mid-work re-fetch.
- Authority: `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md` v261/v325, `docs/planning/INTEGRATED_PLANNING_MASTER.md` and `docs/planning/AI_SCENARIO_USER_NEWSPAPER_SPEC.md`.
- Root cause evidence: preceding read-only audit PR #849 (v660): 131 failed scheduler windows, latest AI market event 2026-10-11, deployed common SSRF blocked localhost Ollama.

## Implemented

1. **NEWS-660-01 — addressed in candidate:** `backend/src/admin/ai-news.service.ts` supports a tightly limited, explicitly deployment-owned model call to only `http://127.0.0.1:11434/v1/chat/completions`; redirects are `manual` and cannot be followed, the request is POST-only, all different hostnames/ports/paths/credentials/query/fragment targets fail closed. The regular administrative/manual model calls and generic `safeFetch()` retain strict SSRF blocking. Deployment mode is selected only for unattended model credentials explicitly supplied by the scheduler and the exact approved local base.
2. **NEWS-660-02 — market-pulse response corrected:** `backend/src/stock/newspaper.controller.ts` replaces hardcoded market sentiment (68), fictitious active events (4), and canned headline with actual active virtual-stock market events from `public.stock_market_events_active()`. The score is a bounded *active-event pressure indicator* (`50 +/- 7 × effect strength`), not a genuine trading price index. No events means neutral, no headline invention; failed DB read means HTTP 503, not a false live result. The returned timestamp is based on the newest event when present.
3. Added negative and positive regression tests for the only approved local URL, manual SSRF, redirect blocking, empty/failing DB results and live market event aggregation.

## Evidence and exact limitations

- TDD red: new local-model and pulse tests initially failed; green: 69 focused tests passed including generic SSRF regressions.
- Contract build, backend typecheck and Nest build succeeded on the candidate worktree.
- Backend full suite: **1,190 passed, 391 skipped** (53 DB-containing test files skipped): skipped tests do not prove DB acceptance.
- Isolated candidate backend (source build on port 3121, Test-only credentials/database, AI auto-publication disabled) returned `/health` 200, `/api/v1/newspaper/pulse` 200 and `/api/v1/stocks/market-events` 200 with valid internal token. Test pulse observed 0 active events and neutral output. The existing Test main services were not replaced.
- Read-only local-model smoke against Ollama `/v1/chat/completions`: HTTP 200, generated `READY`; **this does not prove safe five-scenario generation/publication**.
- **No model-triggered stock price modification**, no Production/Test release alias update, no service cutover, no live database write. This branch is a tested candidate, not a live repair.

## Open acceptance gates

- Independent exact-commit Test publication must demonstrate a valid structured batch, registered-symbol validation, bounded effects, DB-secured publication/duplicate protection and actual rendering without mutating the Production market.
- 391 skipped DB tests (including authorization), cross-environment release provenance, ledger safety, signed-in session retention, isolated Test identity mismatch and zero-downtime promotion prerequisites remain open per `docs/releases/v2026.10.15.652.md`.
- Existing `newspaper/weekly-brief` includes fixed trading examples and static weekly claims; removing those safely requires a separate real-data source and UI contract change. Do not claim all newspaper indicators live.
- Automated and manual paths have different credentials; manual operator-configured localhost models still use the generic SSRF block. Do not globally relax SSRF policy to accommodate a manually entered local address.
