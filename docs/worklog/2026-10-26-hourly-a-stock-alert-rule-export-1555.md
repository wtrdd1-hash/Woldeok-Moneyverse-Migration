# A1555 — Private active virtual-stock alert rules CSV

## Before work — 2026-10-26 15:55 KST
- Baseline: main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fresh remote check). Isolated branch `auto/hourly-a-stock-alert-rules-export-20261026-1555`.
- Scope: P1 owner-only active rule configuration CSV, not alert trigger event export Draft #1381 or member support Draft #1421. Reuse PostgreSQL `stock_alert_rules_list(actor)` from immutable migration 182; no new migration, no finance/ledger writes.
- Preconditions: read AGENTS.md, README.md, both canonical plans and integrated master, recent QA and PRs. Existing QA/frontend six failures and dependency security audit failures remain release blockers. Other workers' branches must remain untouched.
- Safety: at most 100 complete rows, reject overflow; authenticated and consent-checked session actor only; WLD integer strings, CSV injection defense, no-store/noindex, mobile app-api parity. Do not call production-linked database 5433.
- Tasks: [ ] RED/GREEN backend owner/overflow tests; [ ] RED/GREEN CSV formatting and route tests; [ ] UI and Android contract; [ ] isolated PG ACL; [ ] full gates; [ ] PR and release hold.

## In progress
Pending implementation. Official Test exact-SHA and Production gates BLOCKED until independently verified.

## In progress — 2026-10-26 16:00 KST
- TDD RED: backend 2 failures (missing export method/controller), frontend missing CSV helper. GREEN: backend 3 focused tests, CSV 3, private route 3, accessibility CTA 1, app gateway 11 including new session/cookie test.
- Implemented bounded `GET /api/v1/stocks/alerts/rules-export`, owner-supplied from guarded session only, PostgreSQL existing `stock_alert_rules_list` with deterministic 101-row overflow probe, HTTP 409 on overflow; no new migration or direct table grant.
- Implemented same-origin private CSV endpoint and member alert manager CTA, CSV injection mitigation, 64-bit integer-string validation, no-store/noindex. Android app-api contract now includes 180th route and EN/KO schema docs regenerated.
- Isolated PostgreSQL 17.11 `wdmv_v761_test_acl`: transaction-inserted 101 synthetic active rules; owner 101, foreign 0, 101-row cap observed, `moneyverse_app` direct alert SELECT denied and ledger INSERT denied, rollback left 0. Production-linked port 5433 untouched.
- Midpoint remote main still `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; latest unmerged planning Draft #1420 reviewed. Release remains HOLD.
