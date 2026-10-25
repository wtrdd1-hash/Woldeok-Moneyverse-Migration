# QA — A1854 Owner-Scoped Recent Wallet Ledger Receipt

**Date:** 2026-10-25 KST. **Verdict:** PARTIAL / BLOCKED; **Production RELEASE HOLD**.

## Source and provenance
- Base `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (start, midpoint and before final reporting).
- Isolated branch: `auto/hourly-a-wallet-recent-receipt-20261025-1854`; code/test head before QA documents: `97d3ba5eb654a283a3401f6f887cb7cafaf3eb84`.
- Draft PR: #1315. No main merge, Test/Production deployment, DB mutation, service restart or branch deletion.
- MiniPC: Debian 13.6; backend/frontend/Nginx/Docker active. Root 98% full (2.8GiB free), data disk 59% full (~78GiB free). Development and build used isolated data-disk worktree.
- Read `AGENTS.md`, `README.md`, canonical EN and secondary KO `docs/planning/PROJECT_PLAN*.md`, integrated planning master, `docs/RELEASING.md`, prior QA/PR/CI. Latest main did not advance during this cycle. Previous QA #1306 and A #1311 remain Draft/HOLD; no overlapping changes made.

## P1 behavior and threat model
- Existing wallet history exposes at most 50 owner-filtered ledger entries. New `GET /api/v1/wallet/transactions/:id/receipt` returns one from the same bounded read, not a global ID lookup. Session/consent guards, UUID validation and 404 for foreign/out-of-window transactions prevent an ID oracle.
- Backend requires actual signed cash/bank delta provenance; missing or inconsistent pockets are not a confirmed receipt. WLD remains canonical integer string, never IEEE-754 float. No new ledger writes, grants, applied-migration edits or database migration.
- Web `/wallet/activity/[id]` is `force-dynamic`, `noindex,nofollow`, behind `requireMember`, and refuses to show a receipt on invalid/malformed/upstream failure. Accessible receipt links are added to `/wallet/activity`. Copy states the 50-entry limit and disclaims counterparty or entire-ledger proof.
- Android app-api gateway forwards the new owner-only GET, with private no-store response header and 180 documented API endpoints. No app credential exposed to the browser.

## Executed verification
| Gate | Observed result |
| --- | --- |
| TDD RED | Backend missing method 3 expected failures; frontend missing validator expected failure; incomplete pocket RED 1 failure |
| Focused Backend / mounted guard routes | 27 PASS |
| Focused Frontend wallet | 13 PASS |
| Frontend private-page SEO/accessibility/fail-closed | 3 PASS |
| Android app-api gateway | 11 PASS |
| Backend complete | 1,319 PASS; 398 SKIPPED (DB-dependent) |
| Frontend complete (before final page test added) | 1,401 PASS; 6 FAIL |
| Database package | 15 PASS; 3 SKIPPED |
| Shared contract | 38 PASS |
| Typecheck / ESLint | PASS / 0 errors, 1,128 warnings |
| Backend / Next frontend build | PASS / PASS (dynamic receipt route built) |
| Android API contract generation/check | PASS / 180 endpoints |
| Bot | 8 PASS after isolated `npm ci --offline`; initial run failed only due missing `youtube-dl-exec` installation |
| `pnpm audit --prod --audit-level high` | FAIL: 2 High |
| `pnpm audit --audit-level high` | FAIL: 2 Critical / 10 High (26 total vulnerabilities) |
| Bot dependency audit | FAIL: 1 Critical / 5 High |

Six full frontend failures are SEO/i18n (3), login touch-target accessibility (1), calculator registration CTA (1), and admin M2 telemetry (1). They are outside this receipt diff, but remain mandatory gates; no exception is granted.

## Real PostgreSQL / isolation
- Executed SQL on Docker PostgreSQL 17.11, isolated `wdmv_v761_test_acl`, 281 migrations, using `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app; ...; ROLLBACK`.
- `moneyverse_app` can SELECT `ledger_transactions` and cannot INSERT `ledger_postings`. Owner-scoped cash/bank/net aggregation was executed without mutation; isolated DB has no relevant ledger postings (`owner_recent_receipts=0`). Unknown user read returned zero rows.
- Therefore the **positive authenticated finance E2E with a real posted receipt is BLOCKED**, not PASS. No production-connected port 5433 fixtures, migration or writes.

## Exact-SHA Test / CI / Production
- Read-only privileged Test identity preflight for `97d3ba5eb654a283a3401f6f887cb7cafaf3eb84` failed: public version `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, manifest/backend/frontend/build `9f39f041c336b59f41e9a8c43ea14dc1d29a2586`. All differ from candidate. Official Test authenticated flow, preserved session and release smoke **BLOCKED**.
- GitHub CI and Test Candidate started for PR #1315; no full PASS evidence at initial reporting. Test Candidate build-only success cannot authorize merge.
- Production is unchanged. Rollback requires no schema/data undo; abandon the draft or revert feature commit after reviewed integration. Existing Production image, session and DB remain untouched. No GitOps action authorized.

## Branch safety
- Initial remote heads 175 (174 non-main), initial open PRs 171. Midpoint 177 heads (176 non-main), 173 open PRs. Every checked non-main branch had commits ahead of main and no duplicate final Git tree; conflicting PRs #1143/#1110/#1107 remain protected. Deleted 0. Other agents' worktrees and unmerged commits untouched.
- Release remains **HOLD** until all full suites, dependency security, isolated posted-transaction E2E, exact-head official Test identity and authenticated web/Android flow are independently PASS.
