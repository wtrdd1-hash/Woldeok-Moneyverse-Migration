# Moneyverse — Qualified Visitor Activation & Search Recovery Spec v2026.10.19.921

**Status:** PLANNING + S0 IMPLEMENTATION CANDIDATE; **no verified Test or Production promotion**. English canonical; [Korean partner](QUALIFIED_GUEST_ACTIVATION_AND_SEARCH_RECOVERY_v2026.10.19.921.ko.md). This is a v860 additive implementation plan; authority remains `PROJECT_PLAN.md` > `INTEGRATED_PLANNING_MASTER.md` > adopted specs. Latest base `main=a7be34de9fc12b380592dffd4bc29903ac69a502` after verified v920 PR #944 merge. Android repo unaffected.

## 1. Observations versus hypotheses

- **Owner report:** no customers after >2 weeks of SEO. **Unverified:** Google Search Console final impressions, clicks, indexed URL count, Naver Search Advisor indexed/click reports, qualified site visitors, privacy/consent instrumentation health, true server-signed signup count, immutable first-economy-receipt count. Never convert unconfigured GSC or empty reporting window into observed zero.
- **Direct source review (2026-10-19):** public homepage puts a dense financial/transfer cockpit before any helpful beginner entry; its hard-coded `+4.8% 24h`, faux real-time KRW amount and 62/28/10 asset mix look like user data. `100% Lossless Ledger` security guarantee cannot be independently supported while Production ledger reconciliation is open. The public calculator sticky conversion bar promises `신규 10,000 WLD 무료` without a verified payout. A search visitor sees speculative money claims before a useful no-login task.
- **Prior implementation:** v910 truthful crawler evidence, v911 SEO snippet promise cleanup, v920 reciprocal reviewed locale indexability now GitHub main; merging is not evidence these changes reached live Production.
- **Discovery risk:** Google says requesting a crawl can take days/weeks and is not a ranking guarantee [R1]. Naver Search Advisor distinguishes discovery, collection, indexing and ranking; its exposure/click report has significant reporting lag and a 90-day view [R4/R5]. IndexNow HTTP 200 is a submission receipt, not indexed URL evidence [R6].

## 2. The first useful action

For an unauthenticated visitor arriving from search, referral or a community:
1. Hero offers **three self-contained public paths before a signup demand:** (A) a free compound calculator (KO `/tools/compound-calculator`; EN/JA/ZH physical `/{locale}/tools/compound-interest-calculator`), (B) approved translated finance glossary, (C) game feature overview. All links are ordinary accessible anchors, keyboard-operable on 320px to desktop.
2. Each destination delivers independent value without account creation or WLD spending. A small trust statement discloses **WLD is fictional game currency**. The visitor can leave with their answer; optional account creation only if a supported save feature exists and its server response confirms success.
3. The homepage's fixed portfolio distribution **must be explicitly labelled a DEMO** and never imply a live member's account. Server-verified wallet balance remains a distinct component. Remove unverified 100% security protection, faux real-time KRW conversion and 24h performance assertions.
4. The sticky calculator bar states 'check whether account saving is available' rather than guaranteeing forever-save or an unverified 10,000 WLD signup grant.
5. No client-created WLD, bank deposit, login receipt, referral award, email, wallet status, or conversion success is generated in S0. Route mappings are explicit and respect v920 physical locale translations.

**Acceptance S0:** all three paths exist; each language link targets the correct public URL; hero occurs before account/finance tools in HTML; 4-language copy; 320px no obstructed targets; tab focus visible; no missing-provider values rendered as 0; static demonstration plainly tagged; no user-private state or financial API mutation. Automated tests catch misleading source claims, route mistakes and missing public CTA.

## 3. Diagnostic event and privacy architecture — S1 (future branch, not implemented here)

Event taxonomy:
- `landing_view`: server/consent-qualified unique visit, `page_group,entry_path,locale,device_class,referrer_category,utm_campaign,release_sha`; omit IP/email/account/financial amounts from exported event.
- `guest_entry_selected`: `calculator|glossary|features`, public navigation only. Selection is not task completion or signup.
- `calculator_result_rendered` / `glossary_topic_read`: honest read-only result and user task completion; do not count an empty link click as a completed result.
- `sign_up`: GA4 recommended event **only after backend-confirmed account creation**; dedupe with a stable privacy-safe event identifier, not raw user ID.
- `first_economy_action_verified`: only a persisted immutable ledger receipt, not optimistic UI, attendance demo, phantom bonus, or client localStorage value.
- `D1/D7`: server login/session or genuine task activity by consenting cohort; distinguish users lost to login errors, account timeouts, invalid route or disabled features.

State model for each funnel step: `NOT_CONFIGURED / NO_ROWS / OBSERVED_ZERO / OBSERVED_NONZERO / STALE / AUTH_ERROR / PARTIAL`, annotated by `data_source,property,start/end,aggregation,provider_timezone,last_success`. Google Search Analytics is not Search Console URL Inspection; Naver reporting cadence differs. Ad-blocked users/consent-limited telemetry are `UNKNOWN` not 'never visited'. Only retain minimally necessary data, documented deletion/consent, no server-secret or sensitive account transfer to analytics.

**Acceptance S1:** integrated Test with deliberately absent/403/429/late provider states; no count inflation from bot traffic, redirects, internal staff or duplicated retries; admin-access permission and event provenance; signup state from backend receipt; 50 synthetic end-to-end scenarios covering auth, error, localizations and referrer preservation.

## 4. SEO technical and content strategy — S2

- Source-to-Production release SHA parity and Search Console/Naver verification precede ranking claims.
- v920 corrected bogus hreflang in sitemap; audit remaining page-level metadata, global locale routing, `lastmod` and translations. Translate whole useful page, not only header/title. Keep real English/Japanese/Chinese glossary/compound routes, do not auto-index pages whose main content remains Korean.
- Prioritize **3–5 original high-intent tools**, not hundreds of keyword-generated near-duplicates: compound interest with real scenarios, shareable stock average-price simulation, career gamification explainers, fictional stock simulator, and a jurisdiction-specific tax tool **only once formulas, date and region are verified**. Each page must contain an actually working calculator/example, method, assumptions, scope/date and internal links. No speculative financial promise, invented AggregateRating, generic FAQ rich-result outcome or copied text. Google no longer displays FAQ rich results since 2026-05-07 [R8].
- Google and Naver differ in reporting: create snapshots of priority URL's `source_200,robots,indexable,canonical,html_lang,H1,content_language,sitemap,hreflang,provider_indexed_version,impressions,clicks`. Label unknown when provider inaccessible, avoid submitting 1000 URLs to 'fix SEO' without quality evidence.
- Distribute only with community consent, useful demonstrations, referral pages that accurately describe rewards, honest Discord bot affordance, and opt-in testers. No spam, fake community endorsements, bought clicks or auto-promoted thin content.

## 5. Growth experiments and suggested target gates (not actual performance)

| Phase | Test / hypothesis | Suggested decision gate |
|---|---|---|
| D0–D3 | Confirm Production SHA, GSC/Naver actual property data, crawl/index, GA4 consent events, signup contract and server receipts | Valid provider provenance and source/runtime identity; no '0 customers' inferred from empty API |
| D3–D7 | Four-language no-login quickstart S0, no fabricated finance guarantees, mobile navigation | Correct paths and source/CI, authenticated read-only Test, accessibility keyboard/mobile |
| D7–D14 | A/B first-intent link priority, page benefit clarity, signup timing | Predesignate sample threshold and activation metric; stop if auth success rate degrades |
| D14–D21 | Three original SEO calculator examples and controlled community preview | Quality review, formulas/country effective date, task success, no spam |
| D21–D30 | Discord/community referral cohort, first game receipt and D1/D7 rescue | Server-certified first task and retention; release rollbacks and privacy review |

**Research/proposed targets rather than actual findings:** 10–20 consenting tester interviews, at least five representative first-use tasks, >=90% *test task completion* as design acceptance after real tests, 0 exposed Production credentials/PII, 0 misleading WLD payout promises. Do not infer CTR, conversion uplift, signups or ranking improvement in the absence of measured baseline/sample.

## 6. Release and data integrity

- Isolated branches and EN+KO plans/worklog/internal/GitHub versioned notes, PR checks before merge. Recheck moving main and other-agent ownership at start, midpoint, final.
- Exact candidate SHA immutable release in **real, isolated Test**, working backend and frontend, noindex Test hostname. Negative tests for session continuity, localization, 404/308 routes, money/account role and migration checksums; v530 authenticated full member/admin browser 5-pass evidence; backup **restoration test**, rollback/canary and zero-downtime Production cutover. Full CI alone is NOT a Test or Production sign-off.
- A Production read-only finance verifier previously found **19 unexplained account projections (+4,779,188 WLD)** and broad direct DML on three protected tables. Current revalidation is UNKNOWN because PC unreachable. User permits reset of **disposable fixture/caches** after target+verified backup. Do not erase actual member identity, money balances, immutable journal, consents or audit logs to conceal financial drift. Preserve forensic provenance and reconcile with controlled, reviewed migrations.
- On any Test/Production blocker, fix its cause and rerun, not bypass. If PC and credentials remain unavailable, record **NOT DEPLOYED** and leave Production untouched. No arbitrary switch to the live backend via GitHub/CI.

## 7. Reference registry — primary and comparative

- [R1 Google crawling/index latency and guarantees](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [R2 Google localized version and reciprocal hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [R3 Google people-first original calculators and content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [R4 Naver crawling and index diagnostics](https://searchadvisor.naver.com/guide/report-crawl-refine)
- [R5 Naver impressions/clicks reporting scope and delay](https://searchadvisor.naver.com/guide/report-expose-ctr)
- [R6 Bing IndexNow is discovery, not indexing guarantee](https://www2.bing.com/indexnow/getstarted)
- [R7 GA4 recommended events `sign_up`, `tutorial_complete`, virtual currency](https://support.google.com/analytics/answer/9267735)
- [R8 Google Search Console 2026 reporting anomalies including FAQ rich-results](https://support.google.com/webmasters/answer/6211453)
- [R9 Sim Companies](https://www.simcompanies.com/signin/) — comparative clear value proposition and 'free start'; **not evidence** of identical user demand.
- [R10 Existing product v860 SEO recovery spec](SEO_ZERO_TRAFFIC_QUALIFIED_ACQUISITION_PLAN_v2026.10.18.860.md) and `F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.md`; no duplicate analytics backend without owner acceptance.
