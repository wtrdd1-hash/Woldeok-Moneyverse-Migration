# P1 status source drill-down — repair-aware implementation plan

Source: latest origin/main a8541927c3a351d980454c66e95a3356c47e0722; avoid duplication with open attention-only PR #2264. No migration or table grants.

1. RED: backend strict `sourceKey` (lowercase source keys, length 3..64) rejects unknown/duplicates, filters authoritative `content_public_status()` normalized results; response includes `sourceKey` proof only for filtered requests.
2. GREEN: Nest controller and service; default API response remains backwards-compatible.
3. RED/GREEN: Android `GET /app-api/v1/status?sourceKey=...` gateway strict validation, rejects ignored source filters (including empty success), validates rows and response sourceKey proof; no-store/noindex.
4. RED/GREEN: Next `/status?sourceKey=...` source-specific detail navigation, full status overall headline unchanged, verified empty/error distinction, accessibility and noindex.
5. Verify actual DEV PostgreSQL `moneyverse_app` function in READ ONLY ROLLBACK, contract generation, tests/build/lint/typecheck, main recheck, CI and official Test release gates. Draft/HOLD until all evidence passes.

Rollback: revert branch/PR; no DB mutation or deployed state.
