# Moneyverse AI Blog Editorial Full Re-audit — v2026.10.20.1001

**English canonical** | [한국어](MONEYVERSE_AI_BLOG_REAUDIT_v2026.10.20.1001.ko.md)
**Status:** Source remediation verified on isolated local resources; OFFICIAL TEST AND PRODUCTION NOT DEPLOYED. **Date:** 2026-10-20 KST. **Main at audit:** a13972c87cc6a62c1877856e504667837e2681ef (v976 PR #966).
**Authority:** AGENTS.md, Integrated Planning Master EN/KO, Project Plan EN/KO, approved v975 architecture and implementation plan, v976 foundation worklog, legacy blog hold runbook.

## 1. Verified environment and public behavior

| Probe | Actual observed result | Meaning |
|---|---|---|
| Main | v976 foundational draft-only database migration 278 and pure QA helpers merged | Implementation is incomplete, not Production |
| Production | prod-v2026.10.19.920-01c34e4b | Distinct from main |
| Formal Test | test-v2026.10.18.805-e54e6843df27 | Exact v976/v1001 SHA untested |
| Country hubs | /blog, /en/blog, /ja/blog, /zh/blog all HTTP 200 | Anonymous GET smoke, not full browser QA |
| Public API | 6 listed educational posts; latest publishedAt 2026-10-15T14:00:00Z | No new approved public article |
| Blog XML sitemap | 28 unique URLs = four hubs plus 24 localized guide URLs; seven per locale, alternate links point to published sitemap URLs; all lastmod 2026-10-15; zero older AI entries | Current discovery integrity for visible guides, not Google indexing proof |
| Legacy AI article sample | /blog/2026-10-14-compound-mv83xp86 returns 200 with robots noindex; table and strong HTML present | Representative archive rendered, not all 171 checked |
| Legacy disk store | blog-posts.json mode 0444; original 2026-10-16 16:16:41 KST mtime; SHA256 f146cd031e63054f72dc3289f6b7d270fcff29f81e2a20d4260e471d8b8dddd3 | Source/store unchanged; must not chmod or mutate |
| Services | frontend/backend/nginx/MCP active, one frontend systemd service in the filtered inventory | Not proof every old worker is permanently disabled |
| Independent platform QA | v997 host report: FAILED; financial P0 and formal Test SHA mismatch | No Production qualification |

Do NOT call the old potentially writable generator just to test it. Source still returns unauthorized 403 and authorized 503 EDITORIAL_REVIEW_REQUIRED. Safe, intentional.

## 2. Reconciled development stage vs approved v975 specification

- **v975.1:** Read-only base audit refreshed; complete owner attribution of historic legacy writers remains open.
- **v975.2:** Source migration 278 has topic/source/draft/reject-change-review/append-only audit records with owner-only operators and app/PUBLIC access denied. No approve/publish DB path. This is a draft-only base.
- **v975.3:** Existing helper validates typed claims against caller-supplied VERIFIED receipts; this v1001 revision reinforces source chronology and URL/time validation. **No verified external fetching, trusted URL allowlist, redirect/DNS rebinding defense, cryptographically-backed source receipt or official-law truth yet**.
- **v975.4:** Candidate duplicate screen is trigram/title/slug only, synthetic 80-repeated-title check. Provisional similarity 0.82 not calibrated against actual 171 legacy posts. No local AI draft producer.
- **v975.5–v975.6:** No real admin approval, reviewer/publication privileges, Outbox or public AI publication projection.
- **v975.7:** Preexisting 4-language guide SEO, but no legally verified newly published AI country editions.
- **v975.8–v975.9:** No approved scheduling or correction lifecycle, no merged v931 calculator registry (v931 still parallel planning).
- **v975.10:** Existing financial DB privilege and unexplained balance drift, five-round authenticated full UI/manager QA and exact-SHA Test/rollback remain release blockers. CI cannot substitute for these.

## 3. Four reproduced source defects, fixed on v1001 isolated branch

**R1001-01 — Expected revision was excluded from idempotency payload:** Existing draft created with expected_revision=0 could be replayed with expected_revision=7 and return the same draft ID. PostgreSQL RED test failed with REDAUDIT_EXPECTED_REVISION_REPLAY_NOT_REJECTED. New forward-only migration 279 requires stored revision=expected_revision+1 on matching replay; mismatch raises 23505.

**R1001-02 — Historic persisted receipts disappeared on expiry:** v278 checked evidence expiration before looking up an already completed draft ID. Once source expiry was reached, a perfectly valid retry returned source unavailable or expired. Source-record retry also had freshness-before-replay ordering. Separate PostgreSQL RED test reproduced the failure. New migration 279 first returns an exact actor/key/content/metadata-matching historical receipt, but continues to reject any new source or new draft with expired evidence. No TTL extension and no new public privileges.

**R1001-03 — Impossible source timestamp sequence accepted:** A retrievedAt 01:03, validUntil 01:02 source could be accepted at 01:00 despite expiration preceding collection. Local claim-checker now validates validUntil > retrievedAt. Test failed before patch and passed after.

**R1001-04 — Ambiguous timestamps/private source hosts accepted by metadata verifier:** Zone-less observedAt, numeric IP HTTPS and *.internal URLs passed previous format checks. New helper requires ISO 8601 explicit zone, rejects literal IP hosts and localhost/local/internal/test/invalid hostnames. Test RED then GREEN. This is defense-in-depth only and NOT network-level SSRF protection or official publisher verification.

**Migration rule:** migration 278 was not edited. New 279 only CREATE OR REPLACE for source_record and draft_append, reasserts REVOKE EXECUTE from moneyverse_app and PUBLIC; no finance table, schema table or actual Production DB writes.

**Additional compatibility boundary (R1001-05):** The first strict timezone-aware ISO parser accepted only one to three fractional digits; PostgreSQL and official sources can legitimately include six-digit microseconds. A new positive fixture with +09:00 and .123456Z **failed RED**, then passed after allowing one to nine fractional digits while retaining explicit timezone requirements. This guards against accidentally blocking genuine verified source timestamps, not a broad date parser rewrite.

## 4. Tests actually run in this turn

| Test | Result |
|---|---|
| New v279 PostgreSQL replay/expiry/privilege E2E after deliberate two RED failures | PASS, isolated Docker PostgreSQL 17, network none |
| Blog claim + dedup targeted tests | 14/14 PASS, including 2 observed RED→GREEN claim regressions |
| Database Vitest full | 15 PASS, 3 DB integration tests SKIPPED |
| Backend Vitest full | 1,271 PASS, 397 DB-dependent tests SKIPPED |
| Frontend Vitest full | 1,321 PASS |
| Backend TS/database TS/contract build/backend Nest build | PASS |
| Changed-file ESLint and git diff --check | PASS |
| Formal Test same-SHA authenticated admin+backend/DB, Production financial/whole-UI acceptance | NOT RUN / BLOCKED |

QA run: /srv/moneyverse-tasks/blog-v1001-qa (2026-10-20 16:00:24–16:02:21 KST), exit=0. SMTP unavailable ERROR lines in mocked backend tests were emitted while test suite passed, and are not evidence of production SMTP delivery.

## 5. Deployment and next requirements

The old 171 unsafe AI entries remain noindex archives. The six educational guides are public, but have not each been independently recertified as finance-law accurate. New publication is intentionally disabled; no instant Google indexing or measured keyword volume claim. User-approved staged development may continue in separate branches: official evidence ingestion with DNS/redirect/allowlist/primary source facts; local AI typed draft and 171-post dedup calibration; CSRF+RBAC+actor-verified human revision approval; publication receipt/Outbox/exactly-one effect; country editions; scheduler only for previously approved revisions. Finance reconciliation and full official Test/Production gates may not be waived.

Standards: Google Search people-first, scaled content, Article dates, localized hreflang and noindex; restricted Google Indexing API for non-blog resources; OWASP LLM Prompt Injection; PostgreSQL least privilege/advisory lock; RFC 9457; WCAG 2.2. See the v975 detailed specification for stable source links.
