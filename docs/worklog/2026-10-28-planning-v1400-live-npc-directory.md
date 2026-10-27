# Planning v1400 — F675-156 verified active NPC directory (Feature Addition / DRAFT / RELEASE HOLD)

**Date:** 2026-10-28 KST. **Cycle:** Previous Feature Improvement v1398 → Current Feature Addition v1400 → Next Feature Improvement v1402 (provisional). **Main:** `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c` (start/mid rechecked). **Issue:** #1650.

## Checklist and evidence
- [x] Read installed Superpowers `using-superpowers`, `brainstorming`, `writing-plans`, `using-git-worktrees`, `verification-before-completion` via miniPC. `skills__list` returned no URIs; connector `skills__read` blocked, not silently marked successful.
- [x] miniPC Debian 13.6, active services and connected dev PostgreSQL; checked current main and canonical AGENTS.md, README.md, PROJECT_PLAN.md and Korean counterpart. Read-only inspection of real Next.js quests, NestJS engagement, migrations 081/082, Android/API boundary, GitHub PRs and QA #1646.
- [x] Start and midpoint main/plan rechecks, isolated worktree, owner handoff issue #1650. No runtime code, DB, WLD, ledger, flags, Test or Production changes.
- [x] Prepare English canonical/Korean-equivalent master, review, project-plan, logs and worklog. Documentation-only verification required before final commit.
- [ ] Independent reference evidence gate: **new approved 0; cumulative verified deduplicated UNKNOWN / 10,000; BLOCKED / IN PROGRESS**. Do not claim success.
- [ ] P0 production release gates: broken Test and Production release pointers, historical migration/ACL/security findings, independent backup restore, official exact-SHA Test. **HOLD**.

## Evidence and scoped design
`frontend/src/app/quests/quests.ts` hardcodes `market_keeper` and `courier`, and `/quests` renders order buttons regardless of `npc_profiles.active`; the controller explicitly documents the absent NPC directory. Migration 081 revokes NPC table access, while 082's `engagement_record_npc_order` checks active status on each write. This is a verified code/design mismatch, **not a proven incident**.

**Goal and audience:** authenticated, consented quest members should see only currently active NPC order opportunities, with honest stale/empty/error states. **Entry:** `/quests` NPC section; CTA **Take order**, **Retry**, **Load more**, **Back to quests**. No WLD/ledger, order-write, admin activation, affinity, relationship, or new public data.

**API contract:** `GET /api/v1/engagement/npcs?after=<code>&limit=<1..50>` (default 20), Android `GET /app-api/v1/engagement/npcs` same response. `200 {items:[{code:string,name:string,role:string}],nextCursor:string|null,observedAt:string,nonbinding:true}`; cursor is last code and only matches `^[a-z0-9_]{3,64}$`, maximum 64 bytes. Server session owns authentication and consent; no client-supplied user UUID. `400` invalid cursor/limit, `401` unauthenticated, `403` consent/authorization, `429` rate limit, `503` source unavailable. Unknown/expired session and failed reads must never display cached active NPCs. GET is safe/idempotent and requires no CSRF; existing order POST still requires CSRF and idempotency key. All response classes private/no-store; no caching of member directory in Next/browser/proxy/Android.

**DB contract:** forward-only migration adds a narrowly scoped `SECURITY DEFINER` reader with fixed `SET search_path = pg_catalog, pg_temp`; whitelist only `code,name,card->>'role'`, validate JSON string type/length, sort by `code`, `WHERE active`, keyset pagination with `limit+1`, no user/relationship/affinity columns. Revoke EXECUTE from PUBLIC, grant only to `moneyverse_app`; do **not** grant direct SELECT/UPDATE on `npc_profiles`. Existing UNIQUE(code) is keyset candidate; benchmark `EXPLAIN (ANALYZE, BUFFERS)` against 10,001 synthetic NPCs and add a partial active/code index only if evidence warrants. Read transaction has no table/ledger/outbox/receipt writes. The existing order command is the write authority but migration 082 checks `active` before progress without locking the NPC row: deactivation can race after that SELECT. B must add a forward-only row-lock/atomic active recheck so deactivation committed before order authorization yields 409 and zero progress; serialize concurrent order/deactivation with a documented lock order. Do not silently retry with a different NPC.

**UI and permissions:** loading skeleton, empty active list, source outage (no fake fallback), paginated active list, stale order rejection, retry and session-expiry actions. `aria-live` for refresh errors, focus retention, visible keyboard CTA, 320/390/768px, 200% zoom, reduced motion, WCAG 2.2 AA, Korean/English parity. Localized labels may be mapped by code for presentation but must never be a source of NPC existence/availability. Generic public SEO metadata only; member data noindex, no sitemap and no private JSON-LD. Admin can see aggregate active-count/failed-order-count only through separately authorized existing dashboard, not edit activation in MVP; suppress small cohorts `k<20`. Analytics: directory-load success, p95, stale-order rejection rate, order CTA rate, source error rate; no member IDs, NPC relationship, balances or raw session data in logs/analytics.

**Acceptance:** isolated PG 17.11 with 10,001 synthetic NPCs, 100 concurrent reads/deactivations, 100 forged/unauthed calls; prove no direct app SELECT, PUBLIC EXECUTE or writes, keyset determinism, no hidden active rows, 200/400/401/403/429/503 cache parity, Android contract, order idempotency/quest progress regression, and admin/SEO/a11y mobile coverage. Tests are **specified, not run in this planning cycle**. Deploy behind default-OFF switch, separate A/B/C branches, CI and official Test exact-SHA, finance/auth/API/DB/Android QA, approved GitOps production promotion. Roll back UI/API switch only; never reverse applied migrations or modify existing member order receipts.

## P0/P1 backlog (owners and acceptance)
| Priority | ID | Owner and gate |
|---|---|---|
| P0 | ENV1400-01 | Ops/QA: fix immutable Test/Production release pointers, backup cron and independent restore evidence |
| P0 | SEC1400-02 | B/QA: app DML 235/241, PUBLIC bank functions 3, five applied checksum mismatches, migration parity and actor spoof #993; no new direct table grants |
| P0 | REL1400-03 | QA: full main lint/test/PG/security, exact-SHA official Test and GitOps release approval before production |
| P0 | NPC1400-04 | A/B: no inactive/fabricated NPC CTA, unauthorized data, stale-session response or stale-order progress grant |
| P1 | NPC1400-05 | B: forward-only bounded SECDEF directory, revokes/grants, EXPLAIN/active index decision |
| P1 | NPC1400-06 | B: keyset snapshot, sanitized card role, 0 writes, deactivation race/409 mapping |
| P1 | NPC1400-07 | A: NestJS/Android GET parity, auth/consent, rate limit and private/no-store errors |
| P1 | NPC1400-08 | A/C: /quests loading/empty/error/CTA, KO/EN, 320/390/768px and WCAG 2.2 AA |
| P1 | NPC1400-09 | C/QA: privacy/SEO noindex, aggregate admin KPI with k<20 suppression |
| P1 | NPC1400-10 | QA: isolated PG 10,001, concurrency 100, forged 100, Android and regression/rollback evidence |

## QA / release truth
QA #1646 v1335: isolated PostgreSQL 17.11 285 migrations and exact candidate SHA CI PASS; backend 2,281 PASS/60 SKIP, frontend 1,686 PASS, DB 38 PASS/3 SKIP, contract 38 PASS, bot 11 PASS and audit 0; main lint/migration parity FAIL. **Candidate CI is not main/official Test/Production approval**. Dev DB app writable tables 235/241, three PUBLIC bank functions, five historical checksums; broken immutable Test pointer, missing production release target, no independent restore. Final status PARTIAL / DRAFT / RELEASE HOLD.
