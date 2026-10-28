# v2026.10.28.1413 — Production blog functional QA (2026-10-28 KST)

Status: READ-ONLY AUDIT. No article was authored, published, withdrawn, deleted, or modified by this audit. No database DML, migration, official Test deployment, or Production promotion was performed.

## Authority and code/release identity

Checked AGENTS.md, docs/planning/INTEGRATED_PLANNING_MASTER.md on latest origin/main a28bed9aa, v1405 (two-hour KR/US/JP/CN and ECONOMY/CODING/COMPUTER rotation, no required human review and no automatic withdrawal), v1412 verified publisher candidate, and v1406 199-legacy-withdrawal report. Production frontend uses /srv/moneyverse-data/releases/production-current (points at prod-v2026.10.22.toss-redesign). Live backend :3000 starts from same release path. Source code on main and running release are not assumed to be identical without an artifact attestation.

## Reproduced defects

| Priority | ID | Observed evidence | Impact / isolation |
| --- | --- | --- | --- |
| P0 | BLOG1413-01 | Public GET /api/blog HTTP 200, count 11; all country KR; title cardinality 4; title frequencies 5/4/1/1; 4 titles include '테스트'. Created 2026-10-28. | Duplicate, test-like, single-country material publicly reachable despite 4-country/3-topic publishing contract. Preserve v1406 audit; determine who created 11 new articles. |
| P0 | BLOG1413-02 | All 11 public content bodies contain zero http(s) URL strings; the text presents dated financial quotes as current measured values. Current main legacy template hardcodes spot financial numbers. | Missing article-level verifiable provenance; factual/reader-risk, especially current prices/rates. |
| P0 | BLOG1413-03 | Current main frontend/src/app/api/blog/generate/route.ts POST path with admin/secret authorization generates templated content and writes JSON directly; does not call official-source verified publisher, uses random slug and random UUID verificationReceipt, sets isAiGenerated:false and status:PUBLISHED. Public GET of generate responds 403 (unauthenticated), NOT proof that authenticated POST is disabled. | Independent active legacy bypass of source, duplicate, article authenticity, and audited DB publication invariants. Do not call write route during audit. |
| P0 | BLOG1413-04 | GET http://127.0.0.1:3000/api/v1/blog/verified HTTP 500; backend controller route registered; GET nonexistent verified slug returns success:false/post:null. New backend tables/migrations 288-290 exist in main; actual production DB migration state unverified. | Verified publication catalog not working. Investigate SQL error/production migration parity without assuming one root cause. |
| P1 | BLOG1413-05 | Current live sitemap.xml HTTP 200 but 0/11 current slugs appear. Direct article URL HTTP 200 and canonical present, not noindex. | Indexability and sitemap discovery disagree; index status in GSC NOT checked. |
| P1 | BLOG1413-06 | Backend hourly log shows blog.rotation_2h 'done' at 10:00, 11:00, 12:00, 13:00 KST; running backend BLOG_TWO_HOUR_PUBLISHER_ENABLED unset. | Done describes scheduler bookkeeping, not validated publication; enabled legacy flag BLOG_AUTO_PUBLISH_ENABLED=true adds confusion. |
| P1 | BLOG1413-07 | Admin UI and legacy country options include VN rather than latest required CN in inspected code, and existing posts are all KR. | Configuration drift: KR/US/JP/CN contract not fully realized in published content or legacy control surface. |

## Browser checks

Public /blog navigated headless Chromium at 320, 375, 768, 1024px. documentElement.scrollWidth equals clientWidth at all widths, exactly one H1, no uncaught pageerror. Article table/code, keyboard/a11y, logged-in admin edit/delete/CSRF and authenticated finance E2E were NOT exercised. A passing list-level smoke test is not product-wide QA.

## Findings from code and runtime are distinct

- Existing 199 legacy articles were documented withdrawn under v1406, with zero active immediately after that operation; live public now has 11 2026-10-28 posts. No conclusion about the actor/process is supported yet.
- Frontend live data likely uses shared JSON, whereas new verified DB endpoint fails; UUID in legacy record is not evidence of a successful official-source quality verification.
- v1412 main contains author/source/repository/controller and migrations. Test pass counts in release documents are not evidence of production functionality. Current backend publisher flag unset, and independent official Test/DB/finance deployment attestation missing.
- Public robots and article canonical are present. No GSC indexing/traffic or Google ad-eligibility measurements were obtained.

## Remediation order (not executed)

1. P0: close the authenticated legacy JSON publisher bypass in a new isolated code branch, without taking unrelated already-published pages down automatically. Preserve evidence and implement explicit fail-closed response for legacy generation. Keep correct manual publisher and admin rights.
2. P0: investigate the 11 publication receipts, writer logs, and raw source of public posts; use only authorized manual withdrawal/correction for content action. Ensure test fixtures cannot write Production shared JSON.
3. P0: reconcile migrations 288-290 with actual Production database after exact-SHA Test acceptance; restore new verified list with real API/DB negative tests.
4. P0: publish only evidence-validated, independently written native-language GREEN posts; prove no unverified current numeric claims, hardcoded rates, repeated templates, or fake AI declaration.
5. P1: reconcile COUNTRY options with KR/US/JP/CN, repair public sitemap/SEO visibility and recheck canonical, 410 and cache after authorized withdraw.
6. P1: instrument scheduler output with PUBLISH/SKIP and reason receipts; verify hourly/2h edges, retries, single leader, and disabled flag. Finish article/mobile/admin/auth/AdSense test matrix.
7. Final gate: exact-main branch and conflict review, CI, isolated Test backend/DB/finance and authenticated E2E, rollback/backup, zero-downtime Production promotion, and post-promotion observations. NONE completed in this read-only audit.

Related references: v1405 spec; v1412 updates; v1406 withdraw; v1413 worklog. All findings are point-in-time.
