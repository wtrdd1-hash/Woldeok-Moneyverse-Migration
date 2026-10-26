# Backend B v552 — case-insensitive route rate-limit parity (DRAFT / RELEASE HOLD)

## Before work — 2026-10-26 10:35 KST
- Debian 13.6 miniPC checked with status, shell, and file MCP tools. Root filesystem 99% used; data volume 82% used. Do not delete other workers' data.
- Source main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent branch: `auto/hourly-b-rate-tier-case-v552-20261026-1035`.
- Read AGENTS.md, README.md, English/Korean living plans, open PRs and CI, QA #1317, A/C branches. Existing B #1380 edits client-IP identity in same module; preserve its change during later integration.
- Reproduction: Express 5.1.0 matches `/API/V1/AUTH/discord/authorize` and `/API/V1/WALLET/transfers` against lowercase routes, but `tierFor` compares case-sensitive path strings and assigns both the read tier (12000/min), rather than auth (20/min) or sensitive (60/min).
- Scope: classify paths consistently with Express case-insensitive routing; do not change rate budgets, authentication, identity, DB schema, ledger or existing route/DTO contracts.
- Plan: write failing unit regression tests for mixed-case auth, cheap auth read, and API writes; confirm RED; apply minimal case-insensitive matching; confirm GREEN; run workspace checks and CI; keep Draft/HOLD until full gates.

## In progress
- [x] TDD RED verified: 3 failing tests, 25 passing (Express 5.1.0 uppercase route matches)
- [x] Minimal backend fix + regression tests: 28/28 PASS; AUTH_PATH, CHEAP_AUTH_READ and API write prefix match case-insensitively
- [ ] Build, typecheck, lint, unit, integration/security/contract checks
- [ ] Mid-run main/plan refresh and other PR collision check
- [ ] Draft PR and CI evidence

## Finished
- Pending; no merge or deployment authorized before all gates pass.
