# AI Blog Editorial, Verified Publication & Search-Growth Engine — v2026.10.20.975

## Authority addendum — v2026.10.22.1107 (superseding publication mode for GREEN only)
- The newer [country-original/instant-publication design](AI_BLOG_COUNTRY_AUTO_PUBLISH_SPEC_v2026.10.22.1107.md) / [한국어](AI_BLOG_COUNTRY_AUTO_PUBLISH_SPEC_v2026.10.22.1107.ko.md) is explicitly adopted by the authoritative living Project Plan and Integrated Master. For **deterministically source-verified low-risk GREEN original educational articles only**, replace the v975 blanket *human prepublication approval* requirement with a safe atomic **immediate auto-publish → human review within 24h → automatic withdrawal when overdue** workflow. AMBER finance/tax/pension/current-rate/eligibility claims still need human prepublication approval; RED is blocked. v975's source receipts, role-separated publisher/DB ACL, idempotency, legacy route 403/503, correction and full platform/Test gate still apply. This is a planning clarification, not a release or blanket publisher unlock.


**Canonical language:** English. [한국어 상세 명세](AI_BLOG_EDITORIAL_PUBLICATION_ENGINE_SPEC_v2026.10.20.975.ko.md)
**Status:** PROPOSED / ARCHITECTURAL DESIGN / PLANNING ONLY. **No publication permission, AI auto-posting, Test promotion or Production release is granted by this document.**
**Audited source:** updated origin/main 33ba30dde5aaf18dbcf11130a0b51f1c235f1b5b (2026-10-20 KST). PR #963 was merged to that SHA. Production release was independently observed as prod-v2026.10.19.920-01c34e4b; do not equate main with Production.
**Authority order:** AGENTS.md → docs/planning/INTEGRATED_PLANNING_MASTER.md and its Korean peer → docs/planning/PROJECT_PLAN.md and Korean peer → domain-specific specs → actual running source/data acceptance. Earlier planning branch v931 is **unmerged draft**, not completed implementation. Existing finance and full authenticated UI promotion gates are still binding.

## 0. Decision, scope and alternatives

**Goal:** Publish genuinely useful, dated, source-supported financial education articles regularly, with an internal local-model drafting assistant, evidence-backed human editorial decisions, multilingual/local-law verification, calculator-linked interactive utility, honest freshness and observable SEO outcomes. Restore trustworthy posting **without** restoring the broken legacy unsourced generation route.

Alternative A — remove the 503 from the old generator: **rejected**. This reactivates duplicate titles, fabricated market numbers, made-up views and uncontrolled concurrent processes.

Alternative B — extend the legacy JSON file as the live writer: **rejected**. Read-only 0444 emergency containment, unversioned cross-worker file changes and no atomic audit chain make publishing unsafe.

**Selected C — dedicated editorial service and read-only public projection**, using existing NestJS/PostgreSQL privilege discipline plus Next BFF and UI, approved article revisions, durable queue/outbox, separate scheduler. Internal AI can draft and suggest verification questions; it cannot produce publication authority. Existing /api/blog/generate returns 503 during migration, and remains a hard hold until the new, separately gated publish path passes all gates.

This is architectural work, not a one-file restoration. Delivery is split into small reviewable PRs; human approval of the design and staged implementation plan precedes implementation.

## 1. Evidence and current gaps (recheck on each actual implementation SHA)

| Finding ID | Direct evidence and currently visible behavior | Consequence / planned control |
|---|---|---|
| B975-01 | Live public GET /api/blog on 2026-10-20 contains **6** visible educational posts, all dated 2026-10-15. HTTP 200 is not publication freshness or Google index evidence. | Display last public editorial post date, backlog reason and separate job health. |
| B975-02 | 2026-10-16 v719 audit identified **171 legacy AI-marked entries**, 6 distinct titles, repeated 80/51/37; fabricated-current exchange-rate/backtest claims. Historic snapshot, not current public count. | Preserve originals, noindex direct URL, quarantine and dedicated per-item editorial disposition. |
| B975-03 | Frontend BlogPost model lacks approval receipts, source retrieval/as-of times, fact-check state, revisions, localization approval, scheduling/idempotency IDs. | New durable editorial schema/projection; never treat isAiGenerated=false as a future approval receipt. |
| B975-04 | Next POST /api/blog/generate gives 403 without authority, 503 EDITORIAL_REVIEW_REQUIRED when authorized; addBlogPost disallows writes outside tests. | Preserve both holds; add versioned review/publish services that cannot be reached through legacy route. |
| B975-05 | Administrator /admin/blog is a read-only list, showing disabled generation action. | Queue, draft viewer, source evidence, side-by-side comparison, review, publish/withdraw and audit panels. |
| B975-06 | Blog uses JSON file, with shared legacy blog-posts.json mode 0444, last changed 2026-10-16 16:16 KST. Old writer processes had unpredictable restart history. | Never chmod/replace legacy file as a shortcut; new append-only service isolated from old process paths. |
| B975-07 | Existing country guides have KO/EN/JA/ZH routes, localized canonical/hreflang, sitemap and six × four public editorial pages. v969 added safe Markdown and stale-public-post banner. | Reuse routes and v969 renderer; do not make duplicate country pipelines or unlocalized hreflang targets. |
| B975-08 | v931 calculator/search-demand design exists in separate planning branch, with registry/widget candidates. Current inline widget is compound-focused. | Reuse v931 architecture when approved and merged; meanwhile define generic immutable widget contract, no duplicate calculator math. |
| B975-09 | SEO daily digest is for analytics/alerts; it explicitly does not call unsourced blog publish. IndexNow/submit/crawl/index/click are distinct. | Scheduler ownership and publication receipts separate from SEO notifications. |
| B975-10 | Integrated Master documents unresolved finance app-role DML, mismatched legacy opening balances and v530 signed-in full UI gates. | No platform-wide Production promotion without independent safety acceptance, even if article tests pass. |

Evidence limit: no live GSC impression or keyword-volume measurement and no direct database migration/production content modifications were performed as part of this v975 planning. Six visible posts are not independently individually audited for regulatory accuracy.

## 2. Users, tasks and success definitions

**Reader (guest / logged in):** discover a relevant article, see date/source and locale, answer a specific finance question, run the related calculator without mandatory sign-up, read methodology, detect fictional WLD cases, understand corrections and voluntarily continue.

**Editor (role: blog_editor):** review article outlines/claims/citations, reject with reasons, request model revision, preview translations/mobile cards, approve a specific immutable content hash, schedule and withdraw. No editor may approve an artifact they generated via a service-machine identity.

**Publisher (role: blog_publisher):** final dual-control public action for regulated/factual finance claims, verifies review receipt, may pause queue and cancel unstarted jobs, cannot alter approval proof or bypass requirements.

**Operations/admin:** monitor eligibility, source freshness, job attempts, publish latency, missing posts, index-status evidence and alert health. Do not show scheduled/drafted/submitted as PUBLISHED or indexed.

**Success gates:** 0 unsourced numerical claims in published posts; 0 unapproved public AI posts; 0 idempotency duplicates; 0 invalid locale/canonical relationships; no runtime crash/retry that overwrites legacy storage; articles link to a useful accurate calculator where relevant. Aspirational cadence begins as 2 source-verified useful posts/week, adjustable based on editor capacity, NOT a daily auto-post guarantee.

## 3. Architecture and trust boundaries

1. **Demand & topics (read-only):** reuse existing GSC service, national portal data and anonymous on-site calculator events. Track source/dataState and sampling period; refuse to invent monthly keyword volumes. Manual editorial topics remain possible when search data is unavailable.
2. **Evidence intake:** source allowlist per jurisdiction (BOK ECOS, KRX, KOSIS/Statistics Korea, FRED, official tax/pension/regulator pages, verified provider references). Fetch using fixed egress proxy, HTTPS, DNS/IP checks, redirect constraints, size and timeout limits, robots/licensing and stored source snapshots/canonical URLs. Untrusted pages are *data*, not model/tool commands.
3. **AI research & outline:** local model receives short normalized evidence excerpts, produces typed draft with claim-to-source IDs, topic/locale, uncertainty and a draft_hash. No secrets, database execute credentials or general network-capable tool access. Timeout or model degradation creates DRAFT_FAILED, never a published article.
4. **Deterministic QA:** typed claim extraction, as-of bounds, formula fixtures, policy year/jurisdiction, citation URLs and retrieval receipts, title and semantic duplication checks, forbidden promises/simulated returns/fictional prices, unsafe HTML/link/image checks. AI fact checker may *recommend* but cannot sign final approval. Missing critical evidence is BLOCKED_REVIEW.
5. **Editorial authority:** authenticated editor review + optional step-up for final publish, immutable revision and evidence digest, actor/event audit. Approval is bound to exact revision SHA, required locale/source state and expiry. A subsequent edit invalidates old approval.
6. **Durable publisher:** authorized leader obtains a database lease and unique article/locale/revision publication key, transactionally creates immutable publication record and outbox event, then projects published article into public read model. Queue is at-least-once but writes exactly-once *effect* by unique DB key; external SEO submission is asynchronous, nonblocking and does not assert indexing.
7. **Public frontend:** existing /blog, /en/blog, /ja/blog, /zh/blog, /api/blog, /blog/[slug], sitemap expose only eligible PUBLIC revisions or the explicitly grandfathered six guides. Legacy unsafe AI stays in archive with noindex, warning and no BlogPosting JSON-LD.
8. **Monitoring:** per-state counts and oldest wait age, new publications with actual timestamps, citation expiry, deferred errors, GSC measured clicks/impressions and status provenance, Discord admin critical alerts without confidential evidence/credentials.

Trust boundary: user/third-party/model text cannot call an admin database function, generate signed approval, choose public URL unsafely or change publication policy. Back-office calls remain server-side; no direct browser→Nest privileged endpoint exposure.

## 4. Durable state machine (server authoritative)

**States:** TOPIC_PROPOSED → SOURCE_GATHERING → SOURCE_READY → DRAFTING → DRAFT_READY → QA_PENDING → QA_FAILED / EDITOR_REVIEW → CHANGES_REQUESTED → APPROVED → SCHEDULED → PUBLISHING → PUBLISHED → REVISION_PENDING / CORRECTION_REQUIRED / WITHDRAWN. Terminal failure with retry support: SOURCE_UNAVAILABLE, DRAFT_FAILED, PUBLISH_FAILED, CANCELLED.

**Allowed transitions:** only a provenance-qualified actor can transition. A worker can create/change draft and evidence states; editor can request changes, reject or grant approved hash; publisher authorizes scheduled/published transition. A scheduler can execute only a *previously authorized* approved job. No state auto-transitions from QA_FAILED or REVIEW_REQUIRED to PUBLISHED.

**Visibility:** TOPIC through SCHEDULED never appear publicly. PUBLISHING isn't success. PUBLISHED has published_at, content SHA, approval receipt and a public read proof. WITHDRAWN gives clear removal/tombstone policy (410 vs 200 noindex by case, avoid automatic 301 to unrelated content). CORRECTION_REQUIRED retains dated notice and can temporarily noindex high-severity inaccurate information.

**Invariant:** public.read_model.content_hash = approval.approved_content_hash = publication_event.content_hash; publication eligible iff editor review + source validation current + no policy hold + locale-ready + idempotency key unused.

## 5. Data model, migration and privacy

Proposed forward-only migration **allocate NEXT free SQL migration number at implementation time, never edit 277 or prior**:

| Table | Key fields (representative) | Constraints |
|---|---|---|
| content_topics | uuid, cluster_id?, country, locale, intent, priority, evidence_state | country distinct from UI language; real search metrics nullable |
| content_sources | uuid, canonical_url, host, publisher, country, source_type, license, retrieved_at, as_of_at, content_sha256, expires_at | source snapshots with bounded retention, disallow raw credentials |
| content_drafts | uuid, topic_id, revision int, locale, title, excerpt, body_md, model_id, model_version, prompt_template_version, content_sha256, created_at | append-only revisions, size and safe text limits |
| content_claims | uuid, draft_id, claim_kind, exact_span, source_ids, verified_at, check_result, rule_version | numerical claim needs source reference and vintage/as-of |
| content_editorial_reviews | uuid, draft_id, draft_sha256, reviewer_actor, outcome, reason, approved_at, expires_at, evidence_hash | immutable decision and audit; reviewer distinct from machine identity |
| content_publications | uuid, slug, locale, revision_id, approval_id, published_at, updated_at, content_hash, visibility, original_version | unique(locale,slug), unique(revision,locale); updates are new immutable versions |
| content_jobs | uuid, kind, status, schedule_at, idempotency_key, attempts, max_attempts, lease_owner, lease_until, last_error_code | unique idempotency_key, bounded attempts with backoff + jitter |
| content_outbox | id, aggregate_id, event_type, payload_version, created_at, delivered_at | enqueue in same transaction as durable publication |
| content_editorial_audit | event_id, actor, operation, article, revision, before_state, after_state, ts, correlation_id | append-only redacted audit, no sensitive prompt/credentials |
| content_localizations | article_group_id, locale, draft_id, local_editor_id, status, law_version | reciprocal hreflang only for independently publishable editions |

Existing six guide URLs may remain on a compatibility read model until intentionally and verifiably migrated; **no mass import with manufactured approvals**. Preserve original legacy JSON SHA, backups and access mode; migration copies only selected vetted content to new tables with provenance = IMPORTED_LEGACY_UNVERIFIED until reviewed.

Functions and permissions: all admin reads/writes go through actor-scoped SECURITY DEFINER SQL functions, validated roles and EXECUTE allowlists. Enforce PUBLIC REVOKE; no broad app-role SELECT/INSERT/UPDATE to content or existing financial tables. Create a dedicated least-privilege reader for public published projection, distinct from finance data; never expose unpublished drafts to public routes. Design audit tests as authenticated and denied-principal DB integration tests.

## 6. API contracts (versioned, server-only BFF)

External browser uses same-origin Next BFF under /app-api/v1/admin/blog/editorial; Nest exposes only internal /api/v1/admin/blog/... guarded functions through the existing server-side API client. No unauthenticated mutation; require CSRF, same-origin, scoped role and actor-bound audit. JSON RFC 9457 errors with code/correlation_id; resource version for concurrency.

| HTTP / resource | Auth and request | Response / failure |
|---|---|---|
| GET /admin/blog/editorial/queue | editor, filters by status/locale, cursor | paginated counts/age, source verification, no false publication |
| POST /admin/blog/editorial/topics | editor, idea+country+locale, Idempotency-Key | 201 topic or existing ID; 409 duplicate |
| POST /admin/blog/editorial/topics/:id/research | editor, expected_version | 202 async evidence job; 422 unsupported provider; no public publish |
| POST /admin/blog/editorial/topics/:id/draft | editor, research_version | 202 AI generation job; 503 model unavailable, draft remains safe |
| GET /admin/blog/editorial/drafts/:id | editor | versioned body, citations, claim flags, no public access |
| PATCH /admin/blog/editorial/drafts/:id | editor, If-Match, changed content | new revision, invalidates previous approval; 412 stale version |
| POST /admin/blog/editorial/drafts/:id/validate | editor, draft_hash | 202 deterministic QA, machine suggestions only |
| POST /admin/blog/editorial/drafts/:id/review | human editor, decision, reason, If-Match | immutable review event; 409 insufficient citations/self-approval |
| POST /admin/blog/editorial/drafts/:id/schedule | publisher, review_id, publish_at, Idempotency-Key | 202 queued, never 200 published; 409 expired review |
| POST /admin/blog/editorial/publications/:id/withdraw | publisher with reason/step-up policy | immutable withdrawal; public route applies approved disposition |
| GET /admin/blog/editorial/jobs/:id | authorized operator | attempt/run timestamps and exact current state |
| GET /blog, GET /api/blog | guest | published eligible projection only; no queued/rejected drafts |

Suggested types: DraftRevision has draftId, revision, locale, title, markdown, contentHash, sourceIds and qualitySummary. EditorialDecision has draftId, expectedHash, decision APPROVE|REJECT|CHANGES_REQUESTED, reason and reviewScope. PublishJob has approvalId, expectedHash, scheduleAt, country, locale and idempotencyKey. No client chooses authority fields such as approved_by, published_at or status.

**Compatibility rule:** existing POST /api/blog/generate stays 403/503 during all staged rollout. A separate endpoint must not accept old fallback hardcoded internal secrets or a blanket admin boolean as automatic QA approval.

## 7. Article QA rubric (hard blocks beat score)

Quality score (0–100) is internal prioritization, never displayed as “AI trust %” unless measured and calibrated. Suggested weights: user-intent completeness 20, originality 15, primary-source coverage 20, dated numerical verifiability 20, calculator/methodological accuracy 15, locale and UX quality 10. **Score >=85 alone cannot publish.** All mandatory gates below must pass:

- Facts: each regulated rate/tax claim has jurisdiction, effective year/date, formula or cited primary source; each timestamped quote has instrument/unit/source observation timestamp and max allowable data age defined by source type. No default “today/latest/real-time” label without verified fresh fetch.
- Numbers: no guaranteed returns, arbitrary ROI, fabricated market statistics, backtests or readership/view counts. Same numeric corpus reused for tables, charts and prose to prevent divergence.
- Sources: 100% material numeric/legal claims mapped to evidence receipts; links resolve, license permits use; missing/contradictory source results hold for human review.
- Duplicate: exact same title normalized hash, canonical/slug, SimHash/MinHash candidate match, sentence/paragraph similarity and semantic similarity in review queue. Set proposed manual review candidate thresholds (cosine >=0.85, near-duplicate >=0.92), calibrate on 171 legacy entries before enforcement; no invented field measurements.
- Content structure: one H1, descriptive H2/H3, controlled article length based on topic (not a forced SEO word count), genuine FAQ, conclusion, source block, correction policy and optional calculator CTA. No template-swapped thin pages.
- Renderer: trusted Markdown subset only; safe links, local licensed/owned image + alt and responsive table scroll (reuse v969). Never copy arbitrary source HTML or external data URLs.
- Images: mandatory provenance/attribution/license before publishing (not mandatory to publish with image); AI-generated image labeled as illustration, never a chart of invented observed data.
- Accessibility: WCAG 2.2 AA relevant criteria, focusable overflow tables, keyboard editing and confirmation, screenreader alerts, 320/375/768/1024/1440 layouts. No clipped approval/reject controls.

Freshness SLA defaults proposed for editorial policies, not factual market feed latency promises: education/formulas review every 90 days; dynamic rates only when explicit provider observation exists and revalidate at render or remove number; tax/pension/benefit law at each jurisdiction-effective change and at least monthly review; current market reports date-stamped and blocked when source expired; immediate withdrawal path for serious factual errors.

## 8. Localization and financial context

Language URL contract: Korean /blog/[slug], English /en/blog/[slug], Japanese /ja/blog/[slug], Chinese /zh/blog/[slug]. Default UI language from existing product settings remains unchanged. A translation is NOT a verified local legal guide. Store editorialJurisdiction independently from locale.

KO: Korean official data; EN: explicit US rules/IRS/Fed only when factually supported; JA: FSA/BOJ/NTA/Japan pension sources; ZH: clearly identify target country/regional applicability and official regulations. For international reader of Korean-only regulations, label “Korea-specific reference” rather than relabeling law or numbers. Unreviewed translations remain NOT_PUBLISHED and out of hreflang/sitemap.

Canonical is self-referential per approved locale, reciprocal hreflang only when both versions are truly translated, HTTPS canonical and exact slug; dates use article publication/revision times not build timestamps. BlogPosting JSON-LD includes actual publisher, author/reviewer disclosure, datePublished and material dateModified; exclude failed/archived/unverified content. GSC indexing and ranking only from verifiable Google evidence, not IndexNow or generic ping success.

Google Indexing API is restricted to job posting and supported broadcast live events — **never use it as a general blog URL indexing API**. For articles, maintain sitemap, valid links, Search Console evidence and crawl/index status separately.

## 9. Calculator and internal AI growth loop

Integrate *only after v931 design is adopted or reconciled* with a shared Calculator Registry: page and inline widget must import the same formula core, country/year, input validation, rounding and fixture version. A blog embeds calculator_id, calculator_version, locale/country and an explainer; generic widget remains optional until available. Never generate arbitrary JSX/JS from AI markup, allow registry keys only.

Demand ranking combines measured Search Console impressions/clicks, search intent, current gap, freshness risk, conversion outcomes, privacy-safe on-site events and genuine external relative trends. No demand score if measured provider data is absent; distinguish MEASURED / GSC_IMPRESSION_ONLY / RELATIVE_TREND_ONLY / INFERRED_DEMAND / NO_DATA. Weekly review considers 3–5 qualified topics, not 50 daily copies.

Privacy-safe funnel events: post_view, source_open, related_calculator_open, inline_calculator_completed, related_read, subscribe_opt_in, return_visit. Do not send salary, income, principal, account holdings or user identity in SEO/public analytics payloads. Consent and jurisdiction rules remain independently enforced.

## 10. Scheduler, observability and recovery

**Mode 0:** DISABLED, read-only, hard 503 legacy generation, no outgoing AI fetch/submission.
**Mode 1:** DRAFT_ONLY, topic/evidence/model queue enabled to staging database, never public.
**Mode 2:** APPROVED_MANUAL_PUBLISH, explicitly approved locale+revision and publisher action only.
**Mode 3:** APPROVED_SCHEDULED_PUBLISH, previously approved scheduled jobs may execute; *never automatic approval*. Promotion to this mode is separate review after real reliability measurements.

Scheduler starts only with explicit environment opt-in, designated Production leader and DB advisory lock/lease with heartbeat and fencing token; shadow/Test automatically no external writes or indexing. Host restart cannot create second owner. Per job max 3 attempts, exponential backoff and dead-letter after attempts; source expiry or reviewer approval expiry cancels publish. Crash after commit before response must return the existing publication receipt. Maintenance halt switches stop new work without corrupting approved queue.

Metrics by state and labels (never label generation as publication): draft_job_total, evidence_fetch_fail_total, articles_qa_blocked_total, oldest_review_age_hours, publications_committed_total, public_projection_lag_seconds, source_expiration_total, duplicate_block_count, queue_dead_letter_total, external_index_submission_attempt_total, gsc_observed_impressions/clicks. Correlation IDs across BFF→Nest→SQL job→outbox→public page, secret-redacted log traces; alert no approved public article for seven days but classify “editorial backlog” vs “system failed” based on job state.

Backups: immutable Postgres PITR/snapshot and content tables before migration, consistent projection backup, documented restore of admin/edit logs; no data reset; store key/config rotation. Rollback application generation while retaining forward DB schema and already-published durable IDs; if public projection cannot be safely read, fail closed or serve previously verified snapshot without claiming current.

## 11. Administrator UI layout and user stories

Extend existing **/admin/blog**, do not create competing admin nav:
1. Overview: published six / last public date / queue ages / source failures / index evidence unknown / actual model health, plus non-destructive pause and help.
2. Topic planner: measured keyword and editor-requested topics, gap vs existing calculators, locale/evidence state, dedup warnings.
3. Draft review: content preview in desktop/mobile, paragraph-linked sources, claim and exact numeric evidence sheet, freshness badges and warnings, side-by-side diff, localized edition status.
4. Review controls: reject/request revision/approve with required reason and optimistic concurrency. Show reviewer identity, approval expiry, dual-control publisher action, explicit action-result receipts.
5. Publication calendar: immutable job ids and timestamps, queue paused/retrying/failed, publish-now only when approved and authorized. Detailed page for rollback/withdraw/correct.
6. SEO outcomes: technical health vs Google observed query/page/country/device index evidence. Never make GSC counts up, never show provider submit as index success.
7. Legacy review: 171 historic candidate records with duplicate grouping, source risk, original archive; user can mark discard/noindex or start vetted rewrite without bulk overwrite.

UI copy examples: “Draft generated — not published”; “Evidence unavailable — publication blocked”; “Approval tied to revision 7 and valid until [date]”; “Scheduled for [time] — not yet public”; “Published at [UTC/KST] — preview URL validated”; “Submitted to crawler ≠ indexed”; “No approved new article; previously published education remains available.” Localize EN canonical and KO as next language, with JA/ZH public audience copy.

## 12. Release phases with measurable acceptance

| Phase / version step | Deliverable | Test or gating proof |
|---|---|---|
| v975.1 | Read-only source/infra/old-process inventory and immutable old blog SHA evidence | Source/main/prod/Test identity documented, legacy 0444 unchanged; no old writer left in eligible scheduler path |
| v975.2 | Editorial lifecycle domain model, migration design and role/permission matrix | Disposible PG 17 migration smoke, SECURITY DEFINER/public denial, preserved finance grants, schema checksum parity |
| v975.3 | Evidence intake and fixture-backed finance claim checker | SSRF/prompt injection, stale/missing sources, contradictory numbers, 1,385.5 false latest claim rejected |
| v975.4 | Local AI typed draft and dedup engine | Deterministic fixture, model outage, exact/near-title repetition and 171 legacy corpus quarantine |
| v975.5 | Admin editor queue, revision workflow, dual-control approval | 403 guest/non-editor, CSRF, If-Match, self-approval blocked, content mutation invalidates approval |
| v975.6 | Durable publisher/outbox + public read projection | Crash/retry/restart 0 duplicates, no premature visibility; legacy AI noindex remains |
| v975.7 | Locale-specific editorial reviews and valid SEO projection | 4 locales, canonical/hreflang reciprocal, sitemap only published, valid JSON-LD dates, GSC evidence truthful |
| v975.8 | Approved schedule, admin alerting, source drift/correction/withdrawal | Exactly-one scheduler/lease fencing, expired approval blocks, recovery/alert and append-only audit |
| v975.9 | Existing calculator registry/widget bridge (subject to v931 reconciliation) | Formula parity and country/year numerical fixtures; privacy-safe funnel |
| v975.10 | Full platform release qualification | Full CI; exact-SHA isolated Test frontend/backend/DB/session/mobile/166-pages five rounds/admin; financial P0; rollback; zero-downtime Production proof |

Implementation order: one capability + TDD failing test + isolated code fix + quality review + same-SHA CI per PR. Production READINESS is not inferred from passing only v975-specific article tests. Blog publish switch may be enabled only after the new design's own gates **and** project-wide finance/identity/UI/security gates are fulfilled.

### Test matrix (minimum)

Positive: editor proposes article; verified primary sources; local model returns typed draft; numeric claim checks pass; editor approves exact hash; publisher schedules; unique publication appears once, localized metadata and widget accurate; post corrected via new revision.

Negative: guest/write 403; scheduler token spoofing rejected; CSRF mismatch 403; reviewer changes draft after approval then schedule 409; source expired / missing / offline provider blocked; AI-generated source URL with private IP/metadata IP rejected; duplicate title/corpus rejected; direct SQL content edit denied; no false "published" on timeout; concurrent workers exactly one durable write; SQL/HTML/Markdown XSS safe; fake traffic/views or predated report blocked; EN translation of Korean legal claims not treated as US law; legacy articles excluded until reviewed; slug collision no redirect to unrelated content.

Nonfunctional: baseline accessibility and performance budget measured before implementation, then ensure no regression; 320px viewport no horizontal page overflow (table may scroll internally), 5 repeated full-route authenticated E2E rounds required by v530; offline mock AI Test has no outbound secret; 100% idempotency fixture coverage, 0 incorrectly approved stale claims on adversarial source corpus.

## 13. First 30 days after verified release (NOT a guarantee)

D0–D7: only manual verified publishing; publish 2 high-value articles tied to existing calculators, establish SEO/source baselines, measure review hours, rollback/read incidents, index is UNKNOWN until GSC evidence.

D8–D14: country-specific reviewed source refresh and link fixes; collect GSC query/page impressions and click data if connected, compare user actions (article→calculator execution) and false-positive duplicate flags.

D15–D21: 2 more approved articles or fewer if evidence is insufficient; test edits, revalidation and correction/withdrawal; publisher scheduler stays manually approved.

D22–D30: evaluate duplicate frequency, citation freshness, content utility, first-party measured engagement, qualified recurring audience and editor backlog. Only then consider approved-scheduled mode; do not enable independent AI autopublish or promise traffic.

## 14. References and how they constrain implementation

Primary external standards (reviewed 2026-10-20):
1. Google Search Central, [Helpful reliable people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): real reader utility, no scaled search-first automation.
2. Google Search Central, [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies): duplicate/scaled content concerns.
3. Google Search Central, [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article): accurate publish/update dates, author, headline.
4. Google Search Central, [Localized versions / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions): explicit reciprocal localized URLs.
5. Google Search Central, [Multilingual and multiregional websites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites): avoid locale cookie-only discovery.
6. Google Search Central, [Indexing API scope](https://developers.google.com/search/apis/indexing-api/v3/using-api): job postings and BroadcastEvent Live, not general articles.
7. Google Search Central, [robots noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing): allow crawler to see noindex in legacy pages.
8. OWASP, [LLM Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html): isolate evidence from instructions and model tools.
9. OWASP GenAI, [LLM01 Prompt Injection 2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/): privilege and independent action approval.
10. IETF, [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html): structured error codes and action recovery.
11. W3C, [WCAG 2.2](https://www.w3.org/TR/WCAG22/): keyboard/contrast/focus/mobile.
12. PostgreSQL, [Advisory Locks](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS): bounded leader and coordination, not authorization substitute.
13. OpenTelemetry, [Tracing](https://opentelemetry.io/docs/concepts/signals/traces/): cross-service publisher proof and no secret logging.
14. Existing project standards: Integrated Planning Master, Project Plan, v719 findings, v735 runbook, v969 HTML correction; v931 is cross-branch **proposal** and requires reconciliation before merged implementation.

## 15. Hard decisions to preserve

- **No new articles yet:** this specification creates no approved source receipt. Missing articles after 2026-10-15 are documented, not silently generated.
- **No unconditional auto-approval for financial/YMYL claims.** “Automated” means scheduling/research/drafting eligible approved work, not bypassing source review.
- **No reset or chmod of legacy blog-posts.json; no retroactive forged approval for six educational or 171 old AI articles.**
- **No fabricated market quotes, provider response times, backtests, keyword volume, view counts or index status.**
- **No general Indexing API for regular blog posts.**
- **No Production or financial/DB authority changes under a planning-only PR.**

## v2026.10.22.1108 — Latest override for retrospective review (owner correction)
- [Current policy](AI_BLOG_NO_AUTO_UNPUBLISH_ADDENDUM_v2026.10.22.1108.md) / [한국어](AI_BLOG_NO_AUTO_UNPUBLISH_ADDENDUM_v2026.10.22.1108.ko.md) explicitly **prohibits** the v1107 retrospective 24h auto-withdraw rule. Once independently source-verified GREEN is published, late human review is **notification-only** and never changes visibility, robots, sitemap or response status. Human manual moderation/withdrawal and independent legal/security emergency controls remain separately authorized. Old 403/503 and original publication permission safeguards remain.
