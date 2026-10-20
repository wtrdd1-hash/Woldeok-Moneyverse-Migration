# AI Blog Editorial Publication Engine Implementation Plan — v2026.10.20.975

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox tracking.
> **This plan is not approval to change runtime; obtain architectural-spec and implementation-plan approval first.**

**Goal:** Build a source-verified, human-approved financial article pipeline, preserving old 503 hold until the new publication channel is fully tested and permitted.

**Architecture:** NestJS role-scoped editorial API + forward-only PostgreSQL lifecycle, source evidence, revision/approval receipt and idempotent published projection; Next.js private BFF and existing /admin/blog; internal AI can create draft only; locale-safe public blog and calculator linkage.

**Tech Stack:** TypeScript, NestJS, Next.js 16 App Router, PostgreSQL 17, Vitest, existing contract workspace/route-map, systemd/Nginx immutable release pipeline. Avoid new third-party packages unless measured need is approved.

**Spec:** docs/planning/AI_BLOG_EDITORIAL_PUBLICATION_ENGINE_SPEC_v2026.10.20.975.md and .ko.md. **v931 on separate plan branch remains a draft**; coordinate branch integration and avoid overwriting it.

## Global constraints

- Start every task at freshly fetched origin/main in an isolated feature worktree. Never modify an active agent/Gemini worktree, production release directory or shared read-only JSON file.
- Existing /api/blog/generate keeps unauthorized 403 and editorial-review-required 503 until a separately reviewed release gate; source-only feature flags cannot bypass finance/platform release requirements.
- All new SQL is forward-only; choose the next free number (do not assume migration 278 stays free). Preserve SECURITY DEFINER, revoke PUBLIC and all broad app-role DML. Do not change finance ledger permissions or any money balance.
- Every public article requires immutable revision hash, current source verification, human approval and publication receipt; AI never approves its own drafts.
- EN canonical specs and tests; KO is first secondary locale for documentation and public copy. JA/ZH only when jurisdiction-reviewed.
- Every changed program feature: TDD RED→GREEN, matching contract, unit/security/DB integration, isolated Test exact-SHA health/auth/session/restart, real mobile/full v530 QA, CI PR and zero-downtime promotion; never claim a skip as pass.
- Production writer stays DISABLED by default; staging Test must have no outbound article publication or SEO submission unless explicitly sandboxed.

## Review focus (failure risks)

1. Legacy generated article inadvertently leaks to sitemap after model switch: explicit public listing denial regression and direct URL noindex.
2. Revision edited after approval, or editor self-approves: authorization and hash binding tests.
3. Scheduler crashes between DB commit and acknowledgment: idempotent receipt and second invocation returns same publication.
4. External citation with local/metadata URL, redirect or prompt injection: no egress to private IPs or privileged tool calls.
5. Country translation accidentally reuses Korean rates as US/Japan/China law: localization review gate and per-locale canonical tests.

## Proposed file responsibility map (paths to create at implementation time)

- packages/database/migrations/NEXT-blog-editorial-lifecycle.sql — scoped tables, indexes, check constraints, app execute-only and PUBLIC revocations. Allocate number after reading latest main.
- backend/src/blog-editorial/blog-editorial.module.ts — module/wiring, exports; adjust backend/src/app.module.ts.
- backend/src/blog-editorial/blog-editorial.repository.ts — actor-scoped SECURITY DEFINER function calls only.
- backend/src/blog-editorial/blog-editorial.service.ts — state machine, revision approvals, public projection, authorization.
- backend/src/blog-editorial/blog-editorial.controller.ts — role-guarded admin operations.
- backend/src/blog-editorial/blog-evidence.service.ts — fixed source allowlist, fetch receipts, freshness and licensing metadata.
- backend/src/blog-editorial/blog-ai-drafter.service.ts — existing internal approved model transport, typed drafts, no publishing power.
- backend/src/blog-editorial/blog-claim-checker.ts — deterministic cited numeric/legal claim validation and source TTL.
- backend/src/blog-editorial/blog-duplicate-review.ts — dedup signals, calibrated corpus.
- backend/src/blog-editorial/blog-publisher.service.ts — lease, idempotent atomic publication/outbox, retries and withdrawal.
- backend/src/blog-editorial/blog-scheduler.service.ts — one approved publish leader only, disabled in Test/shadow.
- frontend/src/app/admin/blog/admin-blog-client.tsx — existing admin shell plus status tabs; create child components in frontend/src/components/blog-editorial/.
- frontend/src/app/admin/blog/editorial/page.tsx — role-gated server page if nested queue warranted, never a separate parallel navigation tree.
- frontend/src/app/app-api/v1/[...path]/route.ts — validate existing generic BFF path/CSRF contract; add scoped route map only if necessary, do not weaken pass-through gate.
- frontend/src/app/blog/blog-data.ts — adapt to backend published projection after compatibility plan; do not mutate legacy file.
- frontend/src/app/blog/blog-seo.ts, blog-page-server.tsx, frontend/src/app/sitemap-blog.xml/route.ts — approved status and locale metadata.
- frontend/src/components/blog/blog-inline-calculator.tsx — only after explicit merger/reconciliation of v931 calculator registry.
- packages/contract/src/route-map.ts and shared API type module (path chosen after inspecting actual contract exports) — stable response types and error codes.

## Task 0 — Reconcile authority and frozen inputs (v975.1)

**Files:** document findings under docs/findings/AI_BLOG_EDITORIAL_BASELINE_vNEXT.md, worklog and original JSON checksum/mtime records only; no data mutation.

- [ ] Read current AGENTS, two integrated masters, PROJECT_PLAN peers, v931 branch draft, v719/v735, and actual code.
- [ ] Fetch origin/main, re-read latest changed master and record exact SHA, active Test and Production artifacts, old writer unit ownership; check other agent branch changes.
- [ ] Read-only sample live /api/blog, all locale hubs, one legacy AI URL (noindex) and sitemap; compare expected data/provenance.
- [ ] Establish 171-entry historic duplicate reference corpus without writing back to production original. Redact secrets.
- [ ] Sign off clear source-of-truth matrix, open blockers and a rollback owner; do not proceed if a second legacy writer may bypass authorization.

## Task 1 — Schema / least-privilege lifecycle (v975.2)

**Files:** new forward migration; backend/src/blog-editorial/blog-editorial.repository.ts; backend/src/blog-editorial/blog-editorial.db.test.ts; contract types.

**Interfaces:** content_topic_create(actor,...) → topic_id; content_draft_append(actor, previous_version, ...) → revision_id; content_review_record(actor, hash, decision) → review_id; content_publication_commit(actor, approval_id, idempotency_key) → publication_receipt; public_blog_list(locale,cursor) → immutable projection (names are design signatures, finalize when implementing actual SQL).

- [ ] Write failing disposable PostgreSQL tests: app raw table INSERT/UPDATE/DELETE denied, read only self/role data, PUBLIC EXECUTE denied, duplicate approval/hash and slug collision rejected, revision audit immutable.
- [ ] Run RED and capture test output; independently review impact on currently applied migration checksum floor.
- [ ] Implement minimal forward-only tables/indexes/scoped SQL functions. No finance-table changes.
- [ ] Run migration from zero and immutable Production-schema restored scratch copy where permitted, twice for idempotence policy; record applied count and no breaking privileges.
- [ ] GREEN + review and commit. Never execute migration in Production under this task.

## Task 2 — Source fetch and numerical provenance (v975.3)

**Files:** blog-evidence.service.ts and blog-claim-checker.ts plus .test.ts each.

**Interfaces:** getEvidence(topic, jurisdiction) → SourceReceipt[]; validateClaims(draft, SourceReceipt[]) → ClaimValidation with explicit BLOCKED/VERIFIED and numeric citations.

- [ ] Write RED tests for blocked metadata IP, private DNS/redirect, no-license image, 404/500, timeouts, extremely long HTML, malformed encoding, prompt injection, source/reported-as-of mismatch.
- [ ] Verify a past “latest exchange rate 1,385.5” without source-at-date is BLOCKED, and future tax-year claim with expired official source is BLOCKED.
- [ ] Implement allowlist, bounded fetch, canonical/provenance, normalized quotations (respect copyright) and deterministic claim rule validators.
- [ ] GREEN tests plus recorded exception messages with secret-safe logs; add independent source catalog review and audit.

## Task 3 — AI draft only + duplicate candidate detection (v975.4)

**Files:** blog-ai-drafter.service.ts, blog-duplicate-review.ts plus tests; versioned schema in contract.

**Interfaces:** draftFromEvidence(topic_id, source_ids) → DraftRevision (never a public article); candidateDuplicates(hash,title,locale,content) → scored references/review flags.

- [ ] RED model unavailable/invalid JSON/unsupported source ID/HTML injection/known duplicate 80× title cases.
- [ ] Implement typed output parser with strict size limit, no tool authority and a human-readable error on source conflict.
- [ ] Calibrate proposed cosine 0.85 review / >=0.92 strong-match thresholds against 171 historic articles and distinct legitimate country posts. Store actual confusion results; do not claim calibration if dataset inaccessible.
- [ ] GREEN and ensure only DRAFT_READY state, no public route or sitemap additions; code review.

## Task 4 — Admin editorial queue and approval (v975.5)

**Files:** admin page/client, source and diff child components, blog-editorial.controller/service, role/CSRF tests, Playwright/E2E route smoke according to actual repository setup.

**Interfaces:** createTopic, requestDraft, editRevision(If-Match), requestValidation, reviewRevision(actor, hash, decision), reject/changesRequested, publisherSchedule.

- [ ] RED anonymous, ordinary user, revoked editor, expired login, CSRF, If-Match stale, self-approval and edited-hash cases; ensure 403/409/412 as contracted.
- [ ] Implement queue desktop/mobile with no overflow at 320/375px, keyboard access, article preview and paragraph-linked evidence.
- [ ] Add human approval receipt with actor/locale/hash/time, stored immutably; separate publisher capability; keep disabled old generator.
- [ ] GREEN full authenticated admin flow, run screen-reader/keyboard review and document unmet items.

## Task 5 — Exactly-once-effect publish and public projection (v975.6)

**Files:** blog-publisher.service.ts; front blog-data, blog-seo and API compatibility files; corresponding tests.

**Interfaces:** commitApproved(approval_id, idempotency_key) → immutable receipt; readPublished(locale,cursor) → only PUBLISHED approved projections.

- [ ] RED race: same job twice / 2 workers / crash after commit / expired approval / ledger state mismatch / unavailable public storage / slug collision.
- [ ] Implement PostgreSQL transaction that verifies exact approval hash and inserts publication+outbox atomically with unique key; response uncertain until re-read receipt.
- [ ] Read-only migration path: 6 existing guides remain accessible; 171 legacy AI remain noindex direct URLs and excluded from discovery without fabricated approval receipts.
- [ ] GREEN API tests, verify 4 locales, sitemap, BlogPosting JSON-LD and no leaked drafts. Review rollback snapshots.

## Task 6 — Locale approval and public SEO (v975.7)

**Files:** blog-seo.ts, blog-page-server.tsx, sitemap route, country/editorial tests.

**Interfaces:** getLiveLocale(article, locale) returns only verified localized revision; structuredDataForArticle(revision) uses actual timestamps.

- [ ] RED orphan hreflang/incorrect canonical, untranslated market policy, made-up modified date, unverified review source, general-blog Indexing API misuse.
- [ ] Implement jurisdiction-scoped signoffs, reciprocal hreflang, site map published-only and robust URL Inspection reporting in admin (separate status from submission).
- [ ] GREEN with four-locale fixed fixtures and actual sitemap HTTP response tests.

## Task 7 — Scheduler, corrections and ops (v975.8)

**Files:** blog-scheduler.service.ts, blog-publisher.service.ts, operator/admin alert wiring and unit tests; existing SeoDailyDigestService should not be reconnected to old generator.

- [ ] RED two scheduler instances including Test shadow, restart after crash, expired approvals, repeated retries, error not acknowledged, withdrawal.
- [ ] Implement strictly opt-in designated scheduler plus DB lock/lease and bounded retry/dead letter, immutable corrections, cron disabled in Test.
- [ ] GREEN failure-injection tests, audit metrics, Discord admin redaction, documented rollback.

## Task 8 — Calculator bridge (v975.9, contingent on v931)

**Files:** only after reconciliation with plan/ai-calculator-blog-v931 source and current shared registry; widget/fixture tests.

- [ ] Compare v931 remaining unmerged files with main and avoid duplicate registry, calculator math or page routes.
- [ ] TDD calculator country/year formulas, article full-page fixture parity, input error and rounding, safe allowlist for article widget id.
- [ ] Privacy test that financial values do not leave first-party computation as event properties.
- [ ] GREEN and manual user task run: article → real calculation → source → next relevant action.

## Task 9 — Release evidence and staged activation (v975.10)

**Files:** versioned docs/releases, docs/updates EN/KO, immutable manifest/runbooks, CI logs.

- [ ] Each PR: fetch latest main, resolve only own conflicts, run pnpm lint/typecheck/test/build and migration/test DB/security checks. Report skipped DB tests and open P0 gates truthfully.
- [ ] Build exact main SHA immutable Test release (no duplicate prod writer), run backend health/version, DB/app-role denies, session continuity across frontend/backend restart.
- [ ] Browser QA per v530 across all discovered public/authenticated/admin routes, five full passes including mobile/CSRF/MFA and post-specific four locales.
- [ ] Read-only financial authorization and ledger reconciliation must be independently accepted. Do not reset unexplained balances to force pass.
- [ ] Reconcile old writer ownership; backup verified; test scheduler DISABLED→DRAFT_ONLY→MANUAL_APPROVED only after authorized acceptance.
- [ ] Only with every safety gate PASS: schedule zero-downtime exact-SHA Production switch with rollback and post-cutover public/functional SEO checks; otherwise hold and continue remediation.
- [ ] First 30 days: manual 2 quality articles/week **target only**, measure useful article → calculator completion and verified GSC outcomes; never promise ranking or auto-generation.

## Documentation acceptance for THIS planning v975 PR

- [ ] English canonical and Korean full spec are complete and internally consistent.
- [ ] Every implementation task points to an existing or explicitly proposed path and has a negative/fail-closed test.
- [ ] v931 separate branch and v969 merged-main truth correctly identified.
- [ ] No code/SQL changes, runtime writes, Test or Production action occurred.
- [ ] DOCS_INDEX, internal update, GitHub update and start/mid/end logs exist.
- [ ] git diff --check and docs relative reference checks PASS; opened PR on isolated planning branch. Main remains unchanged by this PR until CI and review.
