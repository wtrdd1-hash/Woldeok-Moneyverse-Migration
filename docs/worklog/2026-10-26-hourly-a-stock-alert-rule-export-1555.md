# A1555 — Private active virtual-stock alert rules CSV

## Before work — 2026-10-26 15:55 KST
- Baseline: main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fresh remote check). Isolated branch `auto/hourly-a-stock-alert-rules-export-20261026-1555`.
- Scope: P1 owner-only active rule configuration CSV, not alert trigger event export Draft #1381 or member support Draft #1421. Reuse PostgreSQL `stock_alert_rules_list(actor)` from immutable migration 182; no new migration, no finance/ledger writes.
- Preconditions: read AGENTS.md, README.md, both canonical plans and integrated master, recent QA and PRs. Existing QA/frontend six failures and dependency security audit failures remain release blockers. Other workers' branches must remain untouched.
- Safety: at most 100 complete rows, reject overflow; authenticated and consent-checked session actor only; WLD integer strings, CSV injection defense, no-store/noindex, mobile app-api parity. Do not call production-linked database 5433.
- Tasks: [ ] RED/GREEN backend owner/overflow tests; [ ] RED/GREEN CSV formatting and route tests; [ ] UI and Android contract; [ ] isolated PG ACL; [ ] full gates; [ ] PR and release hold.

## In progress
Pending implementation. Official Test exact-SHA and Production gates BLOCKED until independently verified.
