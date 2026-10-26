# QA A1555 — Private active virtual-stock alert rule CSV (RELEASE HOLD)

**Date:** 2026-10-26 KST. **Base main:** `1c5b84a1c45baafcca83f375a6f99698121e9bb5`. **Implementation SHA:** `18d365072a349be2713aca9636cf4a172ac2943c`. **Branch:** `auto/hourly-a-stock-alert-rules-export-20261026-1555`. Final documentation commit SHA is recorded in PR #1425 after push.

## Scope and non-overlap
- Backend `GET /api/v1/stocks/alerts/rules-export`: class-level session/authentication/consent guards, server-derived actor; existing migration 182 `stock_alert_rules_list(actor)` with deterministic `LIMIT 101` probe; 100 or fewer complete active rule records; HTTP 409 for overflow, no silent truncation. `Cache-Control: private, no-store`.
- Next private `/stocks/alerts/rules.csv`: 64-bit WLD integer strings, CSV formula/control-character defense, UTF-8 BOM, no-store/noindex, 401/403/428/409 propagation, 503 on invalid upstream data, no false-success partial file. Existing member alert manager gains keyboard-accessible link and truthful scope notice.
- Android `GET /app-api/v1/stocks/alerts/rules-export`: existing authenticated cookie-forwarding gateway, response schema/EN+KO docs updated (180 total documented endpoints). This is **active rule configuration**, not trigger history (#1381), paused/deleted history, investment advice or actual securities.
- No migration, table grant, ledger write, production data mutation, service restart or other-worker branch edit.

## Fresh validation — implementation SHA
| Gate | Result |
|---|---|
| Backend TDD focus | PASS 3 |
| Frontend CSV/route/a11y/app-gateway focus | PASS 18 (including 11 app-gateway) |
| Contract unit | PASS 38 |
| Database package | PASS 15, SKIP 3 |
| Backend entire suite | PASS 1,316, SKIP 398 |
| Frontend entire suite | **FAIL 6**, PASS 1,405 |
| Bot suite after isolated npm ci | PASS 8 |
| Typecheck | PASS |
| ESLint | PASS (0 errors, 1,128 warnings) |
| Backend + Next native production build | PASS |
| Android contract artifact check | PASS |
| pnpm production dependency audit | **FAIL 2 High** |
| pnpm full dependency audit | **FAIL 2 Critical / 10 High / 11 Moderate / 3 Low** |
| Bot production audit | **FAIL 1 Critical / 5 High** |
| GitHub CI #40283191372 | **FAIL** runtime Test (classify/policy PASS) |
| Build Test Candidate #40283163722 | **FAIL** runtime Test; build/production gate SKIPPED |

Existing Frontend failures: SEO/i18n 3, login touch target 1, calculator registration link 1, admin M2 telemetry 1. They are handled in separate QA Draft #1412; its checks do not attest this candidate. No failure was hidden or reclassified as PASS.

## Real isolated PostgreSQL (not Production)
PostgreSQL 17.11 container `moneyverse-test-db`, database `wdmv_v761_test_acl`, 281 migrations, via isolated local ports 5580/5585. In one transaction 101 synthetic active price rules were inserted for one test member with `9007199254740993+n` WLD thresholds; `SET LOCAL ROLE moneyverse_app`:
- Owner 101; foreign actor 0; bounded query 101 (overflow correctly detectable).
- Max threshold exact `9007199254741094`; no float conversion.
- Direct `SELECT` on member alert rules **denied**; ledger INSERT **denied**.
- ROLLBACK left 0 synthetic rows. No operation on Production-linked port 5433.

## Branch/PR audit and release blockers
Start: 267 remote branches / 263 open PR. After own branch and PR: 268 branches / 264 PR (262 Draft). Remote tip SHA duplicates 0; PR head SHA duplicates 0; 264 locally available non-main tips are unmerged; 3 missing objects retained; conflicts #1107/#1110/#1143; deleted 0. Other agents' unique changes preserved. Main SHA unchanged at start, midpoint and pre-report.

Official Test public version `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production public version `6a989b5ac0c6155587d43426d64f6def6b62c917`, neither equals candidate. Exact-SHA authenticated Test web/Android/login/finance E2E, independently certified backup/restore, comprehensive production financial ACL and GitOps/host release gate are **BLOCKED / NOT VERIFIED**. Root disk 97% (~3.3GiB free), data 86%. No main merge, Test deployment, Production deployment, financial mutation or branch deletion.

**Decision: PARTIAL / BLOCKED — Production RELEASE HOLD.** Rollback: revert the feature branch commits; no DB/schema rollback required. Do not mark ready or merge without full security and exact-SHA evidence.
