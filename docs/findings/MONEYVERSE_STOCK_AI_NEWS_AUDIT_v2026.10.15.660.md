# Stock AI News — Production Read-only Runtime Investigation

- **Version:** v2026.10.15.660
- **Time (KST):** 2026-10-15, ~11:00
- **Repository baseline:** `origin/main` `bf55b0571193b4470c9a305ea8b5937bacd2d501` at investigation start; Production backend deployment points to `prod-v600` (not the same code identity as latest main)
- **Authority:** `docs/planning/PROJECT_PLAN.md` v261, v325; `docs/planning/INTEGRATED_PLANNING_MASTER.md`; `docs/planning/AI_SCENARIO_USER_NEWSPAPER_SPEC.md`; `docs/DOCUMENTATION_POLICY.md`
- **Scope:** observational only. No manual generation, model prompt call, database write, service restart, feature switch, Test deployment or Production promotion.

## Verdict

**P0 / NOT OPERATIONAL:** automatic fictional stock-market news creation/publication is currently failing. Running backend and local Ollama services do not imply a functioning news pipeline.

## Verified runtime evidence

1. `moneyverse-backend`, `moneyverse-economy-ai` and PostgreSQL are active. The locally configured OpenAI-compatible Ollama endpoint `http://127.0.0.1:11434/v1/models` answers HTTP 200 and lists `llama3.2:3b`.
2. The effective backend environment has `AI_NEWS_AUTO_ENABLED=true`, an actor UUID, local loopback AI endpoint, and `AI_NEWS_AUTO_MODEL=llama3.2:3b`. An unattended API key is absent, which is not itself proof of failure for Ollama; do not expose credential values.
3. The hourly `stock.ai_scenario_auto` scheduler runs. Production `journalctl -u moneyverse-backend` on 2026-10-15 10:27 KST shows `failed` with `the model API could not be reached`. The database `scheduled_job_runs` row has the same error. Observed cumulative statuses: 131 failed; 469 succeeded (some success rows may have been skips, not publications). Last `succeeded` scheduled row: 2026-10-11 17:25 KST.
4. The database holds 4 AI scenario batches, 4 published scenarios, and 5 `virtual_stock_market_events` rows with `source='ai'`. Latest AI batch/event: 2026-10-11 17:26 KST. **Currently active AI market events: 0** (as of investigation time).
5. The exact Production compiled `dist/security/ssrf-defense.js` independently rejects `http://127.0.0.1:11434/v1/chat/completions` with `SsrffSecurityError: Blocked outbound destination: 127.0.0.1 targets internal network or metadata service.` This reproduces the mismatch without publishing or prompting a model.

## Root cause and impact

**NEWS-660-01 / P0.** `backend/src/admin/ai-news.service.ts::send` routes generation through generic `safeFetch()` from `backend/src/security/ssrf-defense.ts`. This security component deliberately rejects loopback/private destinations. The unattended runtime deliberately points at Ollama loopback. `send()` catches the security exception and reports a misleading transport-level `ai_news_model_unreachable`; the scheduler repeatedly records failure. The local model server responds to `/v1/models`, so the SSRF block—not proven Ollama downtime—is the demonstrated failure mechanism.

**NEWS-660-02 / P1.** `backend/src/stock/newspaper.controller.ts::getMarketPulse()` returns fixed sentiment 68, 4 active events, a canned headline and summary with a dynamic `updatedAt`. These cannot be presented as live market measurements. The `weekly-brief` response also mixes DB-derived amounts and fixed sample trading numbers/claims.

**NEWS-660-03 / P1.** `frontend/src/app/newspaper/page.tsx` and the stock-market news component retrieve current market events, which means expired events will not provide a current news feed. A complete historical newspaper projection, archive, clear AI/game-only labels and correction workflow from v325 are not established by this read-only check. Do not claim those requirements implemented.

## Safe corrective plan (NOT EXECUTED)

1. Keep generic SSRF defense strict. Add a **separately authorized internal-model transport** restricted to a deployment-controlled loopback endpoint and exact permitted route; prevent user-supplied host, DNS/redirect and credential forwarding abuse. Do not globally allow localhost or private ranges.
2. Add negative security tests for arbitrary private/metadata URLs and tests for only the approved model transport, plus generation response/schema/timeout tests against isolated local Ollama.
3. Verify scheduler record changes from `failed` to a non-skipped completed generation; verify an AI batch, bounded publication, active market event and `/newspaper`/`/stocks` article appear, and duplicate or unsafe events remain blocked. Use isolated Test database and an approved non-production actor; **do not test by publishing a price-moving event to Production**.
4. Replace market pulse/weekly brief placeholders with real-source-backed data or explicit `sample` markers. Add publication/archive/AI attribution acceptance tests.
5. Before deployment: re-fetch origin/main, reconcile concurrent Gemini/GPT branches, create a fix branch, run unit+integration+security+API tests and exact-SHA Test backend, then separately authorize and verify zero-downtime Production promotion.

## Limits

Direct inference success, authenticated UI flows, exact-SHA isolated Test and end-to-end Production auto-publication were **not** verified. This document records an incident, not a fix or release.
