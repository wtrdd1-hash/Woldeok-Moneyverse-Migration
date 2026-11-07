# v1298 — Stock League Verified Source and Copy-Trading Hold

Date: 2026-11-02. Authority: origin/main a8541927c3a351d980454c66e95a3356c47e0722. Status: DRAFT / RELEASE HOLD.

## Source-verified defect
The current /stocks/league page advertises +184% returns, 24 traders, 434 followers, 1% settled copy-trading fee and live executions. stocks-league-client.tsx invents five traders and an active member subscription, falls back to invented traders on API errors, and even reports subscription success on network failure. The actual Nest POST /api/v1/stocks/league/copy-trade/subscribe is deliberately 503 pending ledger-backed settlement. The current GET /api/v1/stocks/league/current returns season, leaderboard, whales, mySubscriptions; no certified copy-trade execution receipts. This is P0 false financial state.

## Scope and approach
1. Write RED regression tests that reject fabricated success, financial counts and network-failure subscriptions.
2. Replace league client with server-rendered, validated current-season/leaderboard data from existing Nest GET. Unknown/malformed/503 must show unavailable; season=null is verified empty. Display public rankings only, not member-private subscription details or unsupported copy-trade results.
3. Remove false SEO copy and keep robots noindex; mark the Next GET bridge private no-store/noindex/no-referrer because it may return owner data. Explicitly reject subscription POST with 503, with no DB write or fake confirmation. Preserve existing cancel API for genuine legacy subscriptions; do not surface it without verified owner data.
4. Test strict response parser, failure/empty distinction, HTTP boundary, accessibility, and all required gates. Keep feature on release hold pending exact SHA official Test and auth E2E.

## Risks / rollback
Read-only UI and fail-closed POST only. No migration, finance write, existing shared service change, main edit or deployment. Rollback by reverting isolated PR. Other workers protected. English canonical; Korean companion worklog.
