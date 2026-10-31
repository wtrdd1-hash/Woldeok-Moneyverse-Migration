# C v1232 — Prediction source truth (2026-10-31)

## Start (20:16 KST)
- MiniPC: Debian 13.6; backend/frontend/bot/MCP/desktop commander/nginx/docker active; development PostgreSQL connected.
- Base: origin/main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; new isolated worktree `auto/hourly-c-prediction-source-truth-v1232-20261031-2016`.
- Read AGENTS, README, README/README.ko.md, and EN/KO integrated planning; checked open PRs, CI and A/B/QA ownership. No open PR currently covers `/prediction`.
- P0: `/prediction` hardcodes four prediction markets and 5,080,000 WLD pool; clicking Buy produces a success receipt without an API call. No backend prediction controller or ledger settlement exists. Avoid new financial writes. Reuse existing public stock list API as a clearly labelled reference-only snapshot; no prediction trade or odds until authoritative DB settlement exists.
- Gates: RED test first, isolated implementation, then exact-SHA build/lint/typecheck/unit/integration/PG/security/app-api/E2E/CI; release HOLD until all PASS.

## Middle (20:18 KST)
- Verified actual stock backend: `StockController.list()` uses `StockRepository.list()` -> `public.stock_market_overview()` SECURITY DEFINER read model, with `current_price::text`; no prediction-market controller or settlement exists.
- RED test reproduced missing prediction source; GREEN after replacing fabricated markets with server-side stock read, strict UUID/price validation, verified-empty vs unavailable states, and no trade action. Production NODE_ENV leaked into Vitest; use `NODE_ENV=test` explicitly for tests. Initial assertions also matched explanatory warnings and were corrected.
- Re-fetched origin/main and EN/KO plan hashes: main unchanged. A/B/QA branches remain isolated. No ledger/DB mutation.
