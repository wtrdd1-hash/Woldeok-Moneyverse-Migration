# C v1144 — AI market-news publication consent and truthful receipts

## BEFORE (2026-10-29 05:12 KST)
- Debian 13.6 miniPC seven services active; development PostgreSQL connected. Root 98% full, /tmp 97% full. Do not touch shared DB or run unsafe backup root test.
- Base `origin/main` `35971c600f25869c96f1c666d4b9f58927202730`, independent `auto/hourly-c-ai-news-consent-v1144-20261029-0545` worktree. Canonical English and Korean plans read from this exact main. QA v1356 FAILED/HOLD, 94 Draft PRs; A #1781 shop, B #1782 SWF, C #1783 backup, planning #1780 glossary. No open AI-news consent PR.
- **Reproduced from source:** `AiNewsAutoGenerateCard` promises unchecked checkbox only drafts, but controller ignores POST body, service always calls `publish()` when a candidate exists. Frontend expects `success/scenario` but backend returns `generated/published/eventId/headline/engine`; UI reports success even for `{skipped:true}`. Fallback deterministic engine is mislabeled AI.
- Scope: preserve scheduled auto-publication behavior; for admin POST explicitly honor `publishImmediate`, default false; validate real backend receipt and state; label deterministic engine honestly. No SQL migration, production WLD write, service restart or deployment.
- Design: backend DTO boolean, controller explicit flag, service draft-only early return after durable batch creation; client default unchecked, exact typed response parsing and fail-closed unknown/skipped results. Keyboard/reader checkbox label and responsive card preserved. Test RED then GREEN.
- Gate: focused backend/frontend, full suites when safe, lint/typecheck/build, app-api contract, security audit, isolated PG if capacity allows, CI and official Test exact SHA. HOLD on any failure.

## IN PROGRESS
- Pending RED/GREEN, mid-main refresh and tests.

## FINISHED
- Pending exact HEAD evidence and release decision.
