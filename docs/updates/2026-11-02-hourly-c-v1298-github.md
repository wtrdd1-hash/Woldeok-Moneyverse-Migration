# C v1298 GitHub Update — P0 Synthetic League and Copy-Trading Hold

Scope: /stocks/league SSR verified Nest source, strict rank/WLD parser, real empty vs outage, no fake trader/subscription/fills/fee claims. Copy-subscribe POST is fail-closed 503 until ledger-backed settlement; genuine legacy cancellation endpoint unchanged. Next BFF and Android app-api force private/no-store/noindex/no-referrer, Android rejects forged 200. Actual HTML edge noindex fixed for locale variants. No migration or ledger writes.

TDD: original 5 source defects RED, Android 3 RED, actual HTTP indexing RED, inconsistent count RED; focused 19 GREEN. Full pre-candidate frontend 2,937 PASS, backend 2,978 PASS/2 FAIL, isolated PG 322 migrations/27 integration PASS, app-api 184, security 166 PASS. Remaining release gates: backend 2 profile failures, 9 dependency advisories, route QA ledger missing, authenticated E2E/official Test exact SHA and independent restore unavailable. All PASS required before merge/Production. Final exact SHA/CI status in PR comments.

Authority: origin/main a8541927c3a351d980454c66e95a3356c47e0722, English canonical/Korean companion. Other A/B/C/QA and planning PRs preserved. DRAFT / HOLD.
