# Development A — Member Inventory Condition Evidence (2026-11-01)

**Status:** P1 code candidate / Draft / RELEASE HOLD. **Version:** A-2026.11.01-0152-v1.

## Start and coordination
- Debian 13.6 miniPC confirmed at 01:52 KST; backend/frontend/nginx/docker active; PostgreSQL dev container healthy.
- Started from `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`, branch `auto/hourly-a-20261101-0152-inventory-condition`, isolated worktree `/srv/moneyverse-data/tasks/mv-a-20261101-0152-inventory-condition`.
- Start: 20 remote refs under `origin/` including `origin/HEAD`, 19 open PRs. No branch deleted or existing worktree changed.
- Read AGENTS, README, English canonical/Korean planning v1516/v1518, prior QA and existing PRs. PR #2229 overlaps inventory error handling/privacy; #2236 touches shop upkeep catalogue but not this condition disclosure. B/C work remains separate.

## Functional change
- Reuse authenticated owner-only Nest `GET /api/v1/shop/holdings` and existing `public.shop_my_items_v2(uuid)` (migration 123). No schema or privilege change.
- Validate source-reported upkeep, arrears, suspension and expiry fields at Nest boundary. Invalid source observations return HTTP 503, not an invented successful condition.
- Add native keyboard-accessible per-item condition disclosure on `/inventory`: independent holding/effect expiry, durable property, weekly upkeep, reported unpaid weeks/arrears/cap, suspension. Missing/null means unknown, not paid/permanent. Canonical signed-bigint-range nonnegative strings are formatted with BigInt, never Number.
- Owner inventory fetch failures show a retry message, not a verified empty inventory; member page metadata is noindex.
- Android app-api holdings validates the source evidence on HTTP 200 and enforces `private, no-store`, `noindex`, `no-referrer` for success/errors. Session cookie is forwarded through the existing gateway.
- No purchase, equip, ledger, balance, migration, runtime configuration or production changes.

## Work sequence and verification
1. RED tests for backend validation, inventory evidence and Android privacy; GREEN after implementation. Later added 100k-digit and bigint-overflow negative cases, observed RED, then GREEN.
2. Targeted Nest shop HTTP E2E + condition tests: 20 PASS. Targeted frontend condition/UI/Android tests: 7 PASS.
3. Full frontend: 2,908 PASS, 0 FAIL. Backend full: 2,952 PASS / 517 SKIP / **2 FAIL**, both in pre-existing `profile-private-response.http.test.ts` (expected 200, actual 401). The same two failures were reproduced on unmodified local main; excluding that one test file: 2,946 PASS / 517 SKIP / 0 FAIL. Full suite remains FAIL; no bypass for release.
4. DB package: 62 PASS / 4 SKIP. API contract: 184 endpoints PASS. Typecheck PASS, lint 0 errors / 1,022 warnings, full build PASS.
5. Real dev PostgreSQL 17.11 read-only transaction: `shop_my_items_v2` exists, app role can EXECUTE, unknown owner returns 0 rows. `SET LOCAL ROLE moneyverse_app` read succeeded, ROLLBACK. Dev `moneyverse_app` retains direct SELECT and DELETE on `user_items`, violating intended least privilege (P0 #993). 316 schema migrations observed. No isolated exact-SHA authenticated Test or backup restore.

## Release decision
- **HOLD:** Full backend test FAIL, dev DB ACL P0 FAIL, official Test exact-SHA authenticated E2E and independent restore not evidenced. Do not merge or deploy. Existing unmerged changes and all branches retained; no DB writes, service restarts or rollback.
- Follow-up: resolve baseline profile 401 test separately, restore least privilege via coordinated forward migration, rebase/resolve overlapping #2229 before integration, run exact candidate SHA full CI/real PostgreSQL/official Test and GitOps gates. Production promotion only after all pass.
