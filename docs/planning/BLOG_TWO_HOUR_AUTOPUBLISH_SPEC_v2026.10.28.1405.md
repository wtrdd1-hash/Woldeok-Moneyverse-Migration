# v2026.10.28.1405 — Two-hour multilingual economy/coding/computer blog rotation and unattended publication

> v1412 implementation update: New code candidate provides original-country author, guarded source retrieval, idempotent DB publication and owner moderation, with frontend read/SEO. The source is not yet Test/Production deployed and future claims still require independent verified evidence; see v1412 worklog.

**Status: OWNER POLICY ADOPTED; schedule and pure evidence checks are source-code candidates only. Country-native AI writing, atomic publishing and Production activation are NOT implemented.**

## 1. Owner-approved policy history and latest authority

- **Oct 22, v1107:** owner requested writing original articles by country and immediate publication, with the ability to delete later. Editors introduced GREEN verified automatic publishing, AMBER prior human approval, RED exclusion and a 24-hour post-publication review. [v1107](AI_BLOG_COUNTRY_AUTO_PUBLISH_SPEC_v2026.10.22.1107.md).
- **Oct 22, v1108:** owner explicitly banned automatic unpublish/noindex/delete based on a delayed review (24 hours, 48 hours, 30 days, or more). Only authorized human moderator actions affect already published articles. [v1108](AI_BLOG_NO_AUTO_UNPUBLISH_ADDENDUM_v2026.10.22.1108.md).
- **Oct 27, commit 7827122c:** old JSON-file publisher path was closed with authenticated 503 EDITORIAL_REVIEW_REQUIRED because it bypassed verified sources and publication receipts. This was a technical containment, not a withdrawal of the intended new automatic publishing product.
- **Oct 28, v1405 most recent owner instruction:** remove mandatory human review both before and after publishing; independently verified articles may be auto-published immediately; the owner optionally edits/hides/deletes later and no scheduled review delay can unpublish an article. Write on **two-hour** cycles, rotating **KR/ko-KR, US/en-US, JP/ja-JP, CN/zh-CN** and **ECONOMY, CODING, COMPUTER**; advertising revenue is a business goal.

This explicitly supersedes v975's universal prior human review, v1107's AMBER human preapproval and the mandatory post-review target of v1107/v1108 *for the new unattended low-risk publication lane*. It does not waive independent source/numeric/originality/rights/locale verification, fraud/financial safety, or exact release identity gates. High-risk, unverifiable, duplicated or contradictory content is **ineligible to publish**, rather than waiting for a required human review. Legal/security emergency action has its own authorization.

## 2. Scheduling and content intent

The Asia/Seoul editorial day starts at **04:00 KST**, with 12 two-hour slots: 04, 06, 08, 10, 12, 14, 16, 18, 20, 22, 00 and 02. A slot is a potential draft opportunity, **not a guaranteed publicly posted article**. A scheduler process must never claim 12 published posts if evidence prevented publication.

Each editorial day combines all 12 unique pairs of four independent native-country writing targets and three topic families: ECONOMY = evergreen economics/monetary literacy (no made-up live rates); CODING = runnable software examples; COMPUTER = network/OS/database/server/computer architecture and reproducible experiments. Offset country and topic selection by editorial day to avoid static time bias; country-language pairing is fixed and not a translated Korean clone.

Implemented pure source helper: `backend/src/blog-editorial/blog-two-hour-rotation.ts`, `selectTwoHourBlogSlot(now)` produces Seoul-based period key, editorial day, slot 0–11, country, locale, topic and intent. The `blog.rotation_2h` backend scheduler registers an hourly DB-claimed window; it skips odd hours. The old `blog.daily_publish` route invoking an unverified file writer is removed in this branch, **not live**. Actual publication requires a single authorized leader, source proof, canonical revision hash, idempotency key (slot/locale/intent/version), DB receipt and atomic outbox. Remove the old host's separate 04:00 cron and its embedded credential during a coordinated release, not before. Do not create two publisher leaders.

## 3. No mandatory human review, still independently verified

`country-appropriate research → original native-language draft → deterministic primary claim/source/number, dedup, rights, technical reproducibility and locale gates → verified low-impact eligible → atomic DB publication + durable receipt/outbox → public`.

No mandatory human before or after; no review deadline leading to a visibility transition. Admin can optionally issue explicit authenticated, authorized, CSRF-safe, audited correction/hide/delete receipts, with SEO/sitemap/cache reconciliation and evidence retention. The automatic writer and cron have **no withdrawal permission**. A kill switch stops future drafts only. If validation cannot prove freshness, claims, reproducibility or originality, skip and report the slot as unsuccessful, never fill a quota with fabricated statistics or mirrored text. Existing AI-originated advisory risk classification is not an independent publisher grant; non-eligible material is skipped without requiring the owner to clear a backlog.

## 4. Ad revenue constraint

[Google Publisher Policies](https://support.google.com/publisherpolicies/answer/11112688?hl=en) prohibit Google-served ads on automatically generated content without manual review or curation. Therefore **automatic publication** and **Google AdSense ad eligibility** are separate: by default, do not render Google ads on uncurated automatically generated articles. An optional later real human curation may permit ads if all other inventory policies are met; this does **not** delay publication or create a mandatory article review. A pure v1405 helper models the policy; current site ad placement has not been certified by this change.

[Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) classify bulk unoriginal pages created primarily to manipulate search rankings as scaled-content abuse. [People-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) requires useful, original, evidence-backed articles and transparent automation. Projected revenue requires *measured* GSC traffic, accepted AdSense inventory and observed RPM, not an invented 12-post-per-day revenue guarantee.

## 5. Status and follow-up implementation

| ID | Work | Status |
| --- | --- | --- |
| BLOGROT-01 | Deterministic 12×2h KST rotation, 4 locales × 3 subjects, midnight boundary | SOURCE CANDIDATE TESTED |
| BLOGROT-02 | Hourly-claim even-hour backend scheduling, remove daily file-writer callback | SOURCE CANDIDATE TESTED; no verified publisher |
| BLOGROT-03 | No mandatory reviewer, no timed unpublish and automated source-quality contract | PURE POLICY TESTED; no DB authority |
| BLOGROT-04 | Independent AdSense curation eligibility gate | PURE POLICY TESTED; not connected to live ad renderer |
| BLOGROT-05 | Four original native-language AI writing/source-ingestion engines | NOT IMPLEMENTED |
| BLOGROT-06 | Independent source and numeric verifier, auditable idempotent DB publisher/outbox | NOT IMPLEMENTED, old API 403/503 |
| BLOGROT-07 | Admin-only audited edit/private/delete and sitemap/cache/410 updates | NOT IMPLEMENTED |
| BLOGROT-08 | End-to-end Test identity, login, backend/API/DB, full CI, finance boundary, zero-downtime release | NOT VERIFIED |

Even `BLOG_TWO_HOUR_PUBLISHER_ENABLED=true` cannot trick the current new handler into claiming success: it returns `VERIFIED_PUBLISHER_NOT_IMPLEMENTED` and never calls the legacy endpoint. Migration 283 duplicate [#1605](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1605), official Test identity and Production financial app-role DML safety gates remain blockers. Separate v1403 engineering-topic UI PR #1602 must not be overwritten. **No new article has been auto-published as a result of this v1405 source change.**

Required regression: 12 unique combinations per editorial day; Seoul 00/02→04 transition; single receipt under races/retries; backend/LLM/source outage; numerical hallucination and nonnative country article rejected; owner-only withdrawal; never unpublish at 24h/48h/30d; no Google ads on uncurated generated pages; authentic mobile/SEO and signed-in Test E2E. Merge/promotion only with exact SHA GitHub CI and official Test, finance permissions, backups, rollback and zero-downtime acceptance.
