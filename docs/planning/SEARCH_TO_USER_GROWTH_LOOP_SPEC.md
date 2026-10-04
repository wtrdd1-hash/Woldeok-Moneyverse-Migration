# Woldeok Moneyverse — Search-to-User Growth Loop Specification

> Version: v2026.10.04.525
> Status: Living detailed planning authority
> Date: 2026-10-04
> Parent authority: `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, `PRODUCT_GROWTH_PLAN.md`
> Korean counterpart: [SEARCH_TO_USER_GROWTH_LOOP_SPEC.ko.md](SEARCH_TO_USER_GROWTH_LOOP_SPEC.ko.md)
> Change type: planning/documentation only. No runtime, database, API, Test or Production implementation is claimed.

## 1. Purpose and the remaining gap

Moneyverse already has strong separate plans for technical SEO, pre-signup value, intent-to-play activation, signup-friction recovery, retention, referral/viral growth and acquisition allocation. The remaining problem is operational composition: **the product still needs one authoritative loop that states which search intent earns an indexable landing, which first action proves value, when signup is justified, how that intent survives authentication, and whether the acquired visitor becomes a retained user.**

The canonical loop is:

`qualified search impression -> intent-matched public value -> one contextual preview/action -> authored intent -> contextual signup only when persistence is needed -> exact-intent continuation -> meaningful activation -> explicit return promise -> D1 recognition -> D7 retained continuation -> D30 durable history -> optional public-safe sharing/search rediscovery`

Search traffic is not the product objective. The objective is incremental qualified users who receive real value, activate, return voluntarily and can be served safely and profitably.

## 2. North-star and non-goals

Primary growth outcome:

**incremental fraud-adjusted D30 retained users and retained contribution generated from qualified discovery, with search/privacy/safety quality gates held constant.**

Diagnostic metrics include indexed URLs, impressions, clicks, CTR, average position, preview completion, signup completion and activation. None is sufficient alone.

This specification does **not** authorize:
- a page-count target;
- mass AI-generated keyword pages;
- doorway pages, cloaking or deceptive redirects;
- hiding the useful answer behind authentication;
- signup or ad-click rewards in WLD/WDX;
- indexing private account/economy/security state;
- claiming actual search demand from generated or fallback numbers;
- treating Google/Naver ranking as guaranteed;
- broad finance, investment, deposit, loan or gambling acquisition claims that misrepresent Moneyverse as a real financial product.

## 3. Route-family indexability authority

The previous broad shorthand that can be read as “all KR web routes are noindex” is superseded at the **planning-authority level** by route-family classification. This is not a claim that runtime robots behavior has already changed.

| Route family | Default search state | Admission conditions | Examples |
|---|---|---|---|
| Public brand/about/start | INDEX_CANDIDATE | unique useful content, correct locale/canonical, no private state | home, about, start guide |
| Public guides/glossary | INDEX_CANDIDATE | answers intent independently, maintained, non-duplicative | virtual-economy concepts, game-only terminology |
| Public tools/simulations | INDEX_CANDIDATE | useful without signup, deterministic/maintained, no spendable reward | calculators, bounded educational simulators |
| Public world/news/season archives | INDEX_CANDIDATE | substantive context, truthful freshness, reviewed publication state | world brief, season archive, fictional-company event explanation |
| Curated public community/discussion | CONDITIONAL | moderation/trust threshold, independent value, public-safe author identity, anti-spam | selected threads, curated Q&A/discussion |
| Opt-in public profile/artifact | CONDITIONAL | explicit public scope, independent value, no sensitive economy data | creator/profile showcase, collection/project artifact |
| Personalized/member home | NOINDEX/AUTH | never an acquisition landing | dashboard, recommendations |
| Wallet/balance/portfolio/orders | NOINDEX/AUTH | never public | balances, holdings, transaction history |
| Banking/credit/debt/eligibility | NOINDEX/AUTH | private; public education is a separate route family | account-specific loan/bank state |
| Casino/chance/regulatory-risk action surfaces | NOINDEX/AUTH/BLOCK-AS-REQUIRED | jurisdiction/compliance fail-closed | wagering/chance action routes |
| Account/security/recovery | NOINDEX/AUTH | never public | login security, recovery, sessions |
| Admin/moderation/private social state | NOINDEX/AUTH | never public | admin, reports, sanctions, private club graph |
| Test/staging/internal | NOINDEX/BLOCK CRAWL AS APPROPRIATE | never enter production sitemap | Test hosts and diagnostics |

Every `INDEX_CANDIDATE` still passes the v510 `SeoDocument` and route-registry gates: Production host, HTTP 200, self-consistent canonical, published locale, quality approval, non-private state, truthful `lastmod`, and valid sitemap/hreflang membership.

### 3.1 KR public-search rule

Korean remains the product/public fallback locale. Korean public-safe informational, tool, archive and reviewed community routes **may be indexed after their route-family gates pass**. Sensitive, personalized, transactional, security, moderation and jurisdictionally restricted routes remain noindex/authenticated. Locale and legal jurisdiction remain separate dimensions.

## 4. Search visibility portfolio

### 4.1 High-value evergreen guides and glossaries
Build a small number of authoritative pages around distinct user questions: virtual economy concepts, Moneyverse game systems, fictional market mechanics, collections, professions, seasons and safe game-only terminology. Each page must satisfy the query without requiring an account and then expose one relevant product action.

### 4.2 Interactive tools and playable previews
Prefer public-safe calculators, simulations, comparison explorers, collection previews and bounded scenario replays where interaction materially improves understanding. These tools must not mint spendable WLD/WDX, place orders, grant credit, expose private state or simulate guaranteed returns.

### 4.3 World, season and event archives
Create stable explainers for meaningful fictional-world changes and season outcomes. Freshness must come from source content timestamps and material changes, not release timestamps or routine date rewrites. Archive pages should connect old context to one current thread when a real continuation exists.

### 4.4 Curated community search surfaces
Selected public discussions may become index candidates only after moderation and trust thresholds. The page must remain useful even if the visitor never signs up. Low-trust/new/spam-heavy UGC remains noindex or unlisted. Search visibility is not a reward for posting volume.

### 4.5 Public profiles and durable artifacts
Opt-in profiles, curated collections, project results, educational replays and season artifacts may be public/searchable when they have independent value and expose only allowlisted fields. Raw balance, private holdings, debt, casino history, private memberships, moderation state, security state and recovery data are prohibited.

### 4.6 Images, video and rich search appearance
For pages where visuals genuinely help, maintain crawlable high-quality images, descriptive alt/context and stable landing URLs. High-value explainers may use dedicated video/watch content with accurate `VideoObject`-compatible metadata where eligible. Structured data must match visible content and current search-engine eligibility; markup is never added solely to manufacture a rich result.

### 4.7 Multilingual discovery
Korean unprefixed canonical URLs remain the product fallback authority. Published EN/JA and later locales use self-canonical URLs and reciprocal hreflang only when equivalent content is actually published and quality-approved. Machine-translated draft/mixed-language pages remain noindex and outside sitemaps.

### 4.8 Internal hubs and entity clusters
Use crawlable internal links, breadcrumbs and topic hubs to connect guides, tools, world entities, seasons, professions and collections around real user journeys. Orphan pages and mechanically generated cross-links are defects. A hub should explain the topic and help navigation rather than exist only to pass PageRank.

### 4.9 Earned external discovery
Create assets worth citing: public calculators, transparent virtual-economy reports, explainers, curated archives and community/project outcomes. Creator/community partnerships may link to them when materially relevant and disclosed. Paid links, link exchanges, spam outreach, fake reviews/followers and domain-authority rental are prohibited.

### 4.10 Naver and regional search operations
Maintain Naver Search Advisor verification, sitemap/RSS or other currently supported submission surfaces, title/description quality, crawl/index diagnostics and IndexNow where applicable. Do not depend on retired rich-result formats as a growth target.

### 4.11 Brand/social/creator demand creation
Creator, social, community and public artifact distribution can create later branded/direct/search demand. Measure that separately from demand capture so branded search is not falsely credited entirely to SEO.

### 4.12 Search result promise discipline
Every landing family owns a clear title, primary heading and concise description/snippet candidate that accurately reflects visible value. No clickbait, fake scarcity, fabricated social proof or finance-like return claim. Search-result copy and first viewport must make the same promise.

## 5. Intent-to-user conversion architecture

### 5.1 Intent registry
Each search landing family declares:
- `intent_cluster`;
- audience question/problem;
- independent public value;
- one primary preview/action;
- allowed contextual CTA;
- required authentication point;
- post-auth continuation destination;
- meaningful-activation event;
- D1/D7 continuation thread;
- privacy/jurisdiction/indexability class.

Initial intent clusters:
1. beginner learning / virtual-economy concepts;
2. Moneyverse product/system understanding;
3. fictional company/world/entity exploration;
4. profession/mastery progression;
5. collection/identity/curation;
6. season/event/archive catch-up;
7. public-safe calculator/simulation/tool;
8. community/project discovery.

### 5.2 Answer first
The page must satisfy the visitor's immediate search intent before asking for signup. The first 30 seconds should communicate: the answer, why Moneyverse has relevant context, the game-only boundary when finance-adjacent, and one optional action.

### 5.3 One preview, not a feature wall
Offer one intent-matched low-risk interaction. Do not dump wallet, bank, stock, shop, quest, casino, clubs and every feature into the first organic session.

Examples:
- concept guide -> 30–90 second trade-off simulation;
- fictional company explainer -> follow one world thread;
- profession page -> choose one path and preview the first task;
- collection page -> choose a starter theme;
- season archive -> choose one current continuation;
- public tool -> save a non-sensitive result or next question.

### 5.4 Authored intent before account pressure
A visitor should be able to make one reversible preference/choice before authentication when safe. Signup is requested only when persistence, participation or protected personalization is necessary.

### 5.5 Contextual signup
CTA language describes the state being preserved, for example:
- “Save this path and continue”;
- “Follow this world thread”;
- “Start this collection chapter”;
- “Keep this simulation result and next step.”

Generic “Sign up now” is secondary unless the entry intent itself is account access.

### 5.6 Exact intent continuation after authentication
OAuth/email/passkey/verification/recovery must preserve an opaque, server-validated continuation token that resolves to an allowlisted product destination and the visitor's non-sensitive authored intent. On successful auth, return to that exact continuation. Do not reset an acquired user to a generic dashboard unless the original continuation is invalid or unsafe.

Open redirects, secrets in URLs, OAuth codes in analytics and client-trusted arbitrary return URLs are prohibited.

### 5.7 Meaningful activation
Authentication success is not activation. A search-acquired user activates when they complete the intended first product outcome, such as saving a world thread, establishing a profession path, starting a collection, completing a learning replay, or creating another durable non-sensitive state defined by the intent registry.

### 5.8 Return promise
After first value, ask the user to choose at most one continuation thread. D1 prioritizes recognition of that thread; D7 proves progress, completion, renewal or an honest unchanged state. Notifications are permissioned and only introduced after value, not as a prerequisite to activation.

## 6. Friction and trust rules

- no forced account before useful public content;
- no password/OAuth/recovery-code requests inside growth content;
- no fake “you will lose this” countdowns;
- no raw signup/referral WLD reward;
- no automatic marketing-consent expansion from transactional authentication;
- no ad placement that visually competes with authentication or primary safety-critical actions;
- no unnecessary demographic or real-financial-data collection for conversion optimization;
- no personalized finance/casino pressure as a comeback mechanism.

## 7. Measurement contract

### 7.1 Required funnel events
Implementation planning should converge on stable semantic events such as:
- `search_landing_view`;
- `answer_engaged`;
- `preview_start`;
- `preview_complete`;
- `intent_authored`;
- `signup_start`;
- `signup_complete`;
- `intent_restored_after_auth`;
- `activation_meaningful`;
- `return_promise_set`;
- `d1_return`;
- `d7_retained`;
- `d30_retained`.

Canonical dimensions: search engine/source family, `intent_cluster`, landing family, locale, country only at a coarse lawful level, device class, experiment variant, new/returning state and content version. Query text is minimized/aggregated; sensitive or rare queries are not copied into user profiles. Search attribution must not expose private balances, holdings, debt, security, moderation or recovery state.

### 7.2 KPI hierarchy

**Search reach/quality**
- eligible/indexed coverage by route family;
- qualified non-brand impressions/clicks/CTR;
- branded vs non-branded demand trend;
- canonical/hreflang/sitemap/indexing defects;
- useful landing engagement without artificial dwell-time targets.

**Visitor-to-user**
- landing -> preview start/completion;
- preview -> authored intent;
- intent -> signup start/completion;
- signup -> exact intent restoration;
- signup -> meaningful activation;
- time-to-first-value.

**Retention**
- activation -> return promise;
- D1 exact-thread recognition/return;
- D7 original-thread continuation/resolution;
- D30 durable history;
- intent-cluster-specific retention.

**Economics**
- content/tool maintenance cost;
- moderation/fraud/support burden;
- retained contribution per qualified organic session and per content family;
- incremental D30 user per marginal content/creator/paid acquisition input.

## 8. Experiment backlog

| Experiment | Hypothesis | Primary metric | Guardrails |
|---|---|---|---|
| Answer-first vs auth-first | public value before auth improves retained conversion | signup->activation + D7 | leakage, abuse, performance |
| Contextual CTA vs generic signup | preserving exact intent reduces auth abandonment | intent restoration + activation | phishing-like copy, confusion |
| Interactive preview vs static article | one useful interaction improves first value | preview->activation + D7 | CWV, accessibility |
| Deep page/tool vs template variants | fewer high-value assets outperform thin scale | organic->D30 + index quality | duplicate/thin/spam signals |
| Truthful title/snippet variants | clearer promise improves qualified CTR, not bounce | qualified CTR + activation | clickbait, promise mismatch |
| Curated community proof | reviewed discussion increases confidence | activation + D7 | UGC abuse/privacy |
| Exact-thread D1 vs generic dashboard | intent recognition increases return quality | D1/D7 continuation | notification pressure |
| Eligible KR public indexing pilot | route-based indexing grows qualified discovery safely | qualified organic activation | privacy, compliance, index defects |

No experiment is declared successful from CTR or signup alone when D7/D30 quality degrades.

## 9. Search/community safety gates

P0 blockers:
- any private/account/security/moderation data indexed or exposed;
- canonical/hreflang points to private, Test, wrong-locale or misleading replacement pages;
- material cloaking or content shown to crawlers but not users;
- scaled thin/duplicate pages admitted to index to hit a volume target;
- fabricated Search Console/Naver/traffic metrics;
- financial-return, deposit, security or gambling claims that misrepresent the service;
- unreviewed low-trust UGC indexed at scale;
- secrets/session/recovery tokens in URLs, metadata, structured data, logs or analytics;
- Test/staging entering Production sitemap.

P1 quality gates:
- title/H1/body/snippet intent mismatch;
- orphan pages;
- stale/fake `lastmod`;
- slow or intrusive first viewport;
- structured data not matching visible content;
- ad layout that obscures main content or causes accidental clicks;
- landing families with sustained weak activation/retention that remain indexed only for vanity traffic.

## 10. Rollout sequence

### Phase 0 — truth and route inventory
Reconcile source routes, current runtime robots/index behavior, Search Console/Naver coverage, existing sitemap/hreflang/canonical state and the KR-wide-noindex ambiguity. Produce a route-family ledger before changing robots behavior.

### Phase 1 — manually reviewed pilot assets
Select a small representative set of distinct intents across guide, tool/simulation, archive and public-safe community/artifact families. Quality is the gate; **URL count is not a KPI**.

### Phase 2 — contextual signup and exact handoff
Implement intent registry, one-preview flow, safe continuation token, exact post-auth restore and meaningful-activation event. Verify authentication/security invariants before rollout.

### Phase 3 — retained-user bridge
Implement return-promise state, D1 exact-thread recognition and D7 continuation reporting. Only then optimize acquisition against retained quality.

### Phase 4 — curated search-surface expansion
Expand Images/video/public discussion/profile/artifact eligibility where their specific quality and privacy gates pass. Add EN/JA equivalents one locale at a time.

### Phase 5 — scale winners, consolidate losers
Expand intent clusters only where independent value, search quality, activation, retention and operating economics justify it. Merge, redirect, noindex or retire weak/duplicate pages with truthful canonical/sitemap cleanup.

## 11. Acceptance and release gates for later runtime work

Before any runtime promotion implementing this specification:
1. exact candidate SHA is recorded;
2. Test remains noindex and analytically isolated;
3. route-family indexability inventory is complete;
4. private/sensitive route exposure sample has zero defects;
5. sampled canonical/hreflang/sitemap targets are expected 200 canonical pages;
6. structured data matches visible content and current eligibility;
7. auth continuation rejects external/open redirects and does not leak secrets;
8. meaningful activation and D1/D7 events are distinct from login/pageview/ad events;
9. analytics fail truthfully when upstream search providers are unavailable;
10. responsive/accessibility/Core Web Vitals regressions are reviewed;
11. backend health and the project's exact-SHA Test gate pass;
12. zero-downtime Production promotion and rollback follow the current release contract.

This v525 planning cycle satisfies none of those runtime gates by documentation alone.

## 12. Authority relationship to earlier growth specifications

This document composes rather than erases earlier authority:
- `SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md`: answer-first intent-to-play behavior;
- `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`: useful pre-account sample;
- `SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md`: authentication intent preservation;
- `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`: return promise and D1/D7 continuity;
- `ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.md`: retained/incremental channel economics;
- `GLOBAL_GROWTH_EXECUTION_SPEC.md`: server-owned SEO read model, locale, sitemap/hreflang and release truth;
- `GLOBAL_GROWTH_SEO_REVENUE_SPEC.md`: multilingual search and advertising-only growth economics.

Where a historical statement conflicts with v525 route-family indexability or end-to-end funnel measurement, v525 governs current planning intent. Runtime truth remains whatever the exact deployed source proves until a separate implementation/release cycle occurs.

## 13. Current primary operational references

- Google Search Central — Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search appearance overview: https://developers.google.com/search/docs/appearance
- Google canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google discussion forum structured data: https://developers.google.com/search/docs/appearance/structured-data/discussion-forum
- Google profile page structured data: https://developers.google.com/search/docs/appearance/structured-data/profile-page
- Google video structured data: https://developers.google.com/search/docs/appearance/structured-data/video
- Google Search Console / Search Analytics API: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- Naver Search Advisor — content basics: https://searchadvisor.naver.com/guide/content-basic
- Naver Search Advisor — markup/content: https://searchadvisor.naver.com/guide/markup-content
- Naver Search Advisor — robots/crawl basics: https://searchadvisor.naver.com/guide/seo-basic-robots
- IndexNow protocol: https://www.indexnow.org/documentation

These sources constrain mechanics and quality; they do not promise ranking, traffic or revenue.
