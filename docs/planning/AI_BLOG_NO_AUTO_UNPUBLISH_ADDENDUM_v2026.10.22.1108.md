# No automatic unpublication — country-native AI blog release policy v2026.10.22.1108

**English canonical** | [한국어](AI_BLOG_NO_AUTO_UNPUBLISH_ADDENDUM_v2026.10.22.1108.ko.md)
**State:** ADOPTED PRODUCT POLICY; IMPLEMENTATION IN PROGRESS, NOT PRODUCTION VERIFIED.

## Owner's overriding instruction

After publishing, an article **must NOT be automatically hidden, unpublished, noindexed, removed or deleted merely because human review has not occurred by 24 hours (or any later deadline).** No cron job, background worker, TTL, lease expiry, scheduled task or dashboard timer may transition `PUBLISHED_UNREVIEWED` to `WITHDRAWN` or alter `public_visibility` based solely on reviewer delay.

- Country-original articles for KR/ko-KR, US/en-US, JP/ja-JP, CN/zh-CN remain mandatory; translated clones do not qualify.
- **Publishing:** GREEN low-risk education may publish immediately once independent prepublication verification succeeds and the new atomic DB publisher certifies the source/revision/risk receipt. AMBER country-specific laws, tax, pension, eligibility, investment, current rates need signed human preapproval. RED unsupported, copied or deceptive material is never published. This retains **prepublication hard safety gates**; it removes only *time-triggered postpublication takedown*.
- **Review:** `PUBLISHED_UNREVIEWED → PUBLISHED_REVIEW_OVERDUE` after 24 hours only as **monitoring metadata**, with `is_public=true`. Send an idempotent operator alert and show overdue counts/age in `/admin/blog`; reviewers may mark reviewed, request correction, or voluntarily withdraw.
- **Withdrawal:** changing a published article to nonpublic requires a real authorized moderator's explicit manual decision and audited receipt, or independently authorized legal/emergency security process. A missed review deadline alone is not authorization. Withdrawal needs distinct privileges and cannot be inferred from generated model text or arbitrary cron token. Already withdrawn articles remain withdrawn on retries; overdue must never resurrect or remove them.
- **SEO:** overdue review does not change canonical, robots directives, `BlogPosting`, related links, sitemap, RSS or URL response. A separately authorized withdrawal updates these consistently. Search-engine deindexing cannot be promised synchronously.
- **Ops:** alert on 24-hour breach and again according to bounded, deduplicated escalation policy without automatically changing content visibility. Persist alert receipts/last-notified for restarts; support country-specific queue view and manual cancel/kill-switch of **future publishing** (not retrospective unpublish).

## Engineering milestone delivered in this version

- `backend/src/blog-editorial/blog-country-publish-policy.ts`: typed four-country **advisory** risk-candidate classifier against existing source/number and duplicate screens; sensitive country topics require human review; the result always states `publicationAuthorized:false` until a new vetted DB publication receipt implementation exists.
- `inspectPostPublicationReview()` is a pure overdue/pending/reviewed/withdrawn status calculator. At 24 hours, 48 hours and 30 days overdue it returns `OVERDUE, isPublic:true, action:ALERT_REVIEWER`, **never** a removal action. Malformed timestamps trigger alert, not hidden content. Tests are documented in v1108 worklog.
- Legacy `/api/blog/generate` 403/503 untouched. No model can call a new publisher through this classifier. No publication queue/outbox, admin takedown API or live publisher is claimed implemented by this version.

## Acceptance gates for subsequent publishing integration

1. GREEN safe original article publishes once immediately only after actual persisted verified source and independent risk/claim/originality checks; AMBER/RED never bypass gate; finance ACL no broadened direct DML; exact country/currency/year fidelity.
2. 24h/48h/30d overdue and worker crash/restart keep `is_public=true`, unchanged sitemap/canonical/robots/HTTP page, with bounded admin alert. Include negative tests for all accidental timeout transitions and expiry SQL/background jobs.
3. Human authorized withdraw/rectify creates append-only receipt and updates public read model/410 or correction page, sitemap and caches; an unauthorized reviewer/AI/cron cannot invoke it; exact rev/retry idempotent.
4. Test review queue cross-country mobile/admin auth/CSRF and no fabricated indexed/traffic data; dedicated DB privileges and Production rollback; preserve v1106 Production crawling and v975 source validation.

**Version status:** stage v1108 policy + pure domain evaluator; new DB publisher, official Test acceptance, full platform CI/Production release of publish-first workflow remain **PENDING** under issue #983. Policy does **not** permit reactivation of the old JSON writer or current API 503 hold.
