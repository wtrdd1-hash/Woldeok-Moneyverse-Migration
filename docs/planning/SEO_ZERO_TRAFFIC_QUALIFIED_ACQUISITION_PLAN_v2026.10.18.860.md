# Moneyverse SEO Zero-Traffic Diagnosis and Qualified Acquisition Recovery — v2026.10.18.860

**English canonical** | [한국어](SEO_ZERO_TRAFFIC_QUALIFIED_ACQUISITION_PLAN_v2026.10.18.860.ko.md)  
**Status:** PROPOSED / PLANNING ONLY / not adopted into authoritative master / no Test or Production release  
**Date:** 2026-10-18 KST · **main baseline:** `a945fb2ffd2f027cb8393701874a6d8209b7558f` · **worklog:** [EN](../worklog/2026-10-18-seo-zero-traffic-growth-v860.md) / [KO](../worklog/2026-10-18-seo-zero-traffic-growth-v860.ko.md)

## 1. Decision and evidence boundary

**Problem statement.** The owner reports no customers despite over two weeks of SEO. The actual count of qualified organic search impressions, clicks, visits, successful registrations and first verified economy actions is **UNKNOWN**, not independently measured as zero. Two weeks alone does not diagnose an SEO defect: Google says crawling can take days to weeks and indexing is not guaranteed [R01]. Our highest-confidence priorities are source/runtime parity, indexability and localized metadata, honest measurement, and first value before account creation.

**Authority:** `docs/DOCUMENTATION_POLICY.md` → `docs/planning/PROJECT_PLAN.md` → `docs/planning/INTEGRATED_PLANNING_MASTER.md` → explicitly adopted v527 SEO demand, v507 search operations, v675 portfolio, v688 Search Evidence, v681 calculator-to-learning and v686 first-session truth. This proposal does **not** override v530 authenticated five-pass UI, v523/v542/v543 ledger/DB, v487 advertising-only cash monetization, legal/consent, or immutable exact-SHA release gates. No product/Production authority is claimed.

**Observed source/history, with confidence:**

| ID | Evidence | Truth and boundary |
| --- | --- | --- |
| E860-01 | v602 read-only public audit: 1,012 sitemap `loc` and 1,026 malformed double locale prefixes, partial Korean EN/JA/ZH metadata | Historical 2026-10-14 runtime snapshot; **not** current Google indexed count |
| E860-02 | Current main `frontend/src/app/sitemap.ts` detects localized routes and avoids adding double-prefixed alternate links; `frontend/src/app/api/admin/seo-audit/route.ts` reports `not_measured`, not fabricated 99% | Some earlier defects corrected in **source**, not proof the same version runs on public Production |
| E860-03 | Current main `frontend/src/app/api/admin/seo/indexing-submit/route.ts` labels IndexNow notification separately from indexing; `gsc-sitemap-submit/route.ts` checks backend receipt | Preserve new truthful delivery contracts; do not reintroduce old `google.com/ping` assumptions |
| E860-04 | v855 (2026-10-18) reports 166 route inventory / 1,276 frontend tests / 1,836 backend tests on disposable current DB, but 34 backend skips and no full authenticated/browser acceptance | Broad healthy HTTP != actual successful bank or game action |
| E860-05 | v855 read-only Production finance gate: 19 uncertified balance/ledger projections +4,779,188 WLD and remaining unsafe direct application role DML | P0 user trust and release gate; no fabricated reconciliation or Production monetary mutation |
| E860-06 | v806 bank enrollment audit found old simulated savings button only affected browser storage; a candidate now labels simulation and links true deposit | Do not count client-side simulation as successful transaction or assume candidate is deployed |
| E860-07 | Official device status: minipc, debian13, weoldog offline for this session | No host analytics, real Google property access, or live deployment identity independently verified by this work |

**Risk note:** Current main may differ from public runtime, which v855 reported as earlier artifact; all candidate changes require comparing live exact SHA before any user-facing claim. `easy-scraping.com` is the configured SEO base in source while the product brand is Moneyverse. Audit brand/domain comprehension and legitimacy in five neutral interviews; do not redirect or migrate domains speculatively.

## 2. Diagnose the first broken link, not a single 'SEO score'

Use one administrator-owned `/admin/seo` evidence center (existing v688), joined to a privacy-safe conversion view, without a competing indexer or shadow analytics service.

| Stage | Evidence/metric | If absent or weak | Required next action |
| --- | --- | --- | --- |
| Discovery | Valid canonical public URL, clean sitemap, robots/noindex, server HTML, internal links | Broken URLs, missing text or mismatched locale | Fix route/source; validate explicit KO/EN/JA/ZH (plus actual country variants only when real) |
| Indexing | GSC Page indexing/URL Inspection by exact property and URL; Naver collection/index separately | Crawled-not-indexed or unknown provider state | Fix substantial content/canonical duplication; do not infer 'indexed' from bot hit |
| Search visibility | Finalized GSC impressions by query, page, country, device, date | 0 verified impressions or provider unavailable | First resolve property permissions, data freshness, query relevance and competition |
| Search click | GSC clicks, CTR, position (with aggregation scopes) | Impressions but few clicks | Rewrite truly helpful titles/snippets and intent-to-tool matches; compare with real SERP |
| Landing utility | Server event `search_landing_view`, guest tool `calculator_complete`, `sample_scenario_complete` | Clicks but no meaningful second action | Remove forced login, unclear claim, page bugs; show useful full tool result before CTA |
| Signup | `sign_up` + server-confirmed account created; errors grouped by step | Value but signup dropoff | Return to exact originating intent after OAuth; simplify prompts and recovery |
| Activation | Verified first `work_complete` / bank deposit / virtual stock order receipt; idempotent backend | Signups without first action | Three contextual available actions, honest pending/failure states, no fake WLD |
| Retention | D1/D7/D30 verified meaningful returning action and cohort source | Activation with low return | User-chosen next task, scheduled world brief, opt-in return—not aggressive streak pressure |

Implement `ZERO_OBSERVED / NO_ROWS / NOT_CONFIGURED / STALE / ERROR / INCOMPLETE` as distinct UI states. GSC search metrics must use its Pacific Time day semantics, query sampling and dimension/aggregation constraints. Google sitemap submission, IndexNow receipt, crawl observation, Google index inspection and search click are **five different events**. Source owner, property, reporting period, data freshness, exact release SHA, and null/unknown states are mandatory.

## 3. Incremental product roadmap (no duplication of existing specs)

| ID / priority | User value and implementation owner | Scope and what NOT to rebuild | Minimum release acceptance |
| --- | --- | --- | --- |
| **G860-01 P0** | Honest acquisition-to-activation truth, admin SEO/analytics teams | Extend v688 `/admin/seo` GSC + existing search events, GA4 recommended `sign_up`, `tutorial_begin/complete`, `share`; first-party redacted funnel with bot/internal/test exclusion; no fake live percentages | Matched source/date/locale device cohort counts, verified server signup/receipts, private dashboard, sampled audit |
| **G860-02 P0** | Canonical/locale and source-vs-runtime gate, frontend SEO owner | Re-evaluate sitemap locale branching: nonlocalized URLs must advertise **only genuine** translated equivalents; localized URLs need reciprocal hreflang without double prefix, locale-owned canonical/HTML title/H1/body. Remove low-value duplicate presets by evidence, not bulk deletion | Public URL matrix incl robots, noindex, canonical, hreflang reciprocity, redirect, lastmod, 4 locale HTML, mobile, GSC Inspect; no false `200 = indexed` |
| **G860-03 P0** | One-sentence home positioning + first-use promise, growth/UI owner | Clarify 'fictional persistent economy, not real deposits/investments'; three entry intents ('Try a calculator', 'Preview a fictional company', 'Explore a simulated job') using existing calculator, virtual stocks, work endpoints; no full redesign | Five observed user-task sessions can identify purpose, finish reversible example, explain signup value; no unbacked 10k WLD guarantee |
| **G860-04 P1** | Guest value without signup, feature UX owner | Implement v681/v686 pre-signup *read-only preview* and intent-preserving continuation; reuse calculator/glossary, no real bank/game write or guest WLD grant | Complete output before CTA; authenticated save only when server-confirmed; keyboard/mobile/guest 401 tests; measured completion |
| **G860-05 P1** | Shareable 'My first fictional economy choice' summary, social owner | A privacy-safe, opt-in, deterministic scenario/share card linking back to genuine useful tool; reuse v58 viral/artifact plans, not shadow referral payouts | No account/balance leaks, abuse controls, correct meta/OG, source attribution, opt-out and no fabricated performance claim |
| **G860-06 P1** | Editorial-grade search entrypoints and 7-day challenge, content owner | Pick 3-5 **demand-validated** clusters (compound interest, salary/take-home, budgeting, virtual stock game, economy simulation); add original formulas, country/year/source/caveats, peer-reviewed examples and a linked scenario; reuse v527 inventory | 3–5 measured quality pages, not 10,473 keyword URLs; unique intent, source/date/locale, no deceptive ratings/FAQ or mass AI posts |
| **G860-07 P2** | Weekly fictional macro pulse / collaborative company event, game owner | Add read-only simulation timeline, explainable AI commentary with explicit fiction + provenance; financial or competition rewards only after independent ledger gate | No unjournaled WLD mint, editorial signoff, bounded worker, fresh vs stale labeling, isolated E2E |
| **G860-08 P2** | Customer feedback and first-week learning | In-product one-question drop-off feedback plus voluntary 1:1 pilot; server-side privacy retention/redaction and accessibility; avoid forced survey overlay | 10+ consenting qualitative task sessions (research target, not observed), bug ownership and resolved root causes |

**Do not ship new bank, financial settlement, token rewards, automation or full-scale localized article creation as 'growth' before financial correctness and truth contracts pass.** Leave full-fledged business, sovereign bonds and casino expansion lower priority than completing the first journey.

## 4. Customer acquisition outside SEO, measured separately

**Target audiences (hypotheses, not measured segmentation):** (A) Korean salary/compound/budget tool seekers; (B) students and online business/game simulation players; (C) small virtual-economy/community groups. One positioning and landing promise per cohort, not a generic feature grid for everyone.

1. **First 7 days, qualitative distribution:** invite a small voluntary cohort via relevant finance-learning and simulation-game communities where promotion is permitted; no unsolicited spam, bought traffic, artificial review or incentivized search-click scheme. Invite feedback before asking for referrals. Track a consent-safe campaign source and actual completed first value. Target *research sample*, not promised growth: 10–20 interviews/testers total, 5 full task observations per primary cohort.
2. **Next 14 days, organic + community partnerships:** publish 3 independently useful original resources with practical examples and transparent methodology; syndicate helpful summaries where welcome and link when allowed. Offer educators/community admins a free **demo sandbox** with clearly fictitious WLD and no member information exposure. One opt-in short explainer video per use case; use captions/accessible screenshots and genuine tool demos.
3. **Only after baseline:** experiment with referral sharing and one-week challenge; measure verified friend activity, not mere links sent. Paid campaigns are a separate budget/legal gate; never infer ROAS or ad revenue from unmeasured visits.

## 5. Experiments, decision thresholds, privacy

- **Test A: landing promise:** generic multi-feature homepage vs one fictional-economy promise and three intent-specific examples. Primary metric: guest first meaningful completion; guardrails: bounce quality, 5xx, page latency, consent refusal.
- **Test B: signup gate:** CTA before results vs full tool result then voluntary save. Primary metric: server-verified registrations **per qualified landing** and 7-day activated users, not just clicks.
- **Test C: localized search relevance:** genuine KO tool + source/date page vs mixed-language page (do not expose knowingly invalid pages to indexing; use isolated Test or controlled safe rollout). Metrics: correct language/locale + search impressions/clicks after sufficient reporting delay.
- **Test D: community onboarding:** independent preview vs guided first verified economy action. Metrics: verified first transaction/work/learning result, D1/D7, abuse and user complaints.

**Planning thresholds only, to revise after baseline:** 100% tracked critical funnel events with source and verified timestamps, 0 fake indexed claims, 0 unproven monetary 'success', 0 admin/PII indexed URLs, zero new critical 5xx/financial discrepancy. Do **not** promise an indexed URL count, ranking improvement, signup conversion %, or day-14 traffic uplift. Minimum sample size and statistical decision criteria must be defined with an analyst from baseline; do not call small-N experiments wins.

GA4 privacy contract: `sign_up`, `tutorial_begin`, `tutorial_complete`, `share` only when actually triggered; align custom `search_landing_view`, `guest_scenario_completed`, `auth_return_complete`, `economy_activation_verified` to first-party server audit IDs. Do not send member balance, IP fingerprint, raw email, health, identity or private portfolio details to analytics or ad tools.

## 6. Execution gates, owner and handoff order

| Wave | Work packages and exact candidate files | Acceptance before advancing |
| --- | --- | --- |
| **D0–D2, evidence-first (read-only)** | `/admin/seo`, `backend/src/seo/gsc-client.ts`, `frontend/src/app/sitemap.ts`, current live `/robots.txt`, Search Console & Naver UI evidence export. Independent server identity and permission audit. | Real provider authorization, exact source/runtime SHA, last finalized date, no secrets in notes; mark unavailable as unavailable |
| **D3–D7, technical truth** | Target `frontend/src/app/sitemap.ts`, locale metadata owners, `frontend/src/app/api/admin/seo*`, `frontend/src/app/admin/seo/*`; use original v688 tests, add smoke for correct prefix/reciprocity/canonical and admin receipt. | TDD RED/GREEN, sample and sitemap parity, no Google submission falsification, no non-public indexing, isolated Test release |
| **Week 2, acquisition utility** | Existing homepage, tool/glossary routes, first-session components and associated authenticated BFF actions; reuse v681/686. | Five usability tasks, EN canonical/KO secondary docs, tested KO/EN/JA/ZH *only for genuinely translated routes*, safe user identity and false-reward elimination |
| **Week 3–4, field tests** | Consent-safe GA4 + first-party funnel, handpicked content pages, limited community tests. | Baseline impressions→clicks→landing→signup→verified action→D1/D7 by locale/channel; review hypotheses, stop ineffective cohorts |
| **After stability gates** | Optional event/share loops and P2 economic differentiation. | Production finance/security all green, signed-in 166 routes × five browser passes, 34 admin flows, exact-SHA Test, immutable backup/restore, session/rollback and canary |

**Release discipline:** isolate each implementation slice into a new branch/worktree; verify latest main before, midway and before PR; protect Gemini/concurrent edits; record versioned EN + KO plan/worklog/internal/GitHub notes. CI, isolated Test and actual backend flows precede a zero-downtime Production switch. Planning files need no Test deploy, and this draft PR changes documentation only. Never bypass a blocked financial gate to advertise speed.

**Definition of done for this planning cycle:** evidence-truth matrix + incremental non-duplicative feature roadmap + consent-safe acquisition experiments + responsible owners/tests + source/provenance references + EN/KO documents + draft PR for review. **No GSC access, live traffic lift, production code change or deployment is implied.**

## 7. External reference registry (direct official sources and competitive analogues)

- **R01** Google: [Ask Google to recrawl URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) — days to weeks, no indexing guarantee.
- **R02** Google: [Search Console performance report](https://support.google.com/webmasters/answer/7576553) — dimensions, clicks/impressions, preliminary data and aggregation limits.
- **R03** Google: [Search Console indexing report](https://support.google.com/webmasters/answer/7440203) — diagnose excluded URLs; do not interpret validation as instant index.
- **R04** Google: [Multilingual/locale sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) and [locale-adaptive crawling](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages) — stable language URLs, reciprocal hreflang, not IP-only.
- **R05** Google: [Canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) — same-language canonical, redirect/link/sitemap consistency.
- **R06** Google: [People-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — real original helpful tools, no scaled-thin mass AI publishing.
- **R07** NAVER: [Search Advisor](https://searchadvisor.naver.com/) and [collection/index report](https://searchadvisor.naver.com/guide/report-crawl-refine) — independent collection/index status, not Google metrics.
- **R08** [IndexNow documentation](https://www.indexnow.org/faq) — notification receipt is not verified ranking/index inclusion.
- **R09** Google Analytics: [GA4 recommended events](https://support.google.com/analytics/answer/9267735) — server-verified signup and tutorial/share event names.
- **R10** [Sim Companies](https://www.simcompanies.com/) — slow-paced multiplayer company/trade loop, reference not evidence of local product demand.
- **R11** [Virtonomics](https://virtonomics.com/) — strategy/business sandbox with industry choices; differentiate via simpler 3-minute preview.
- **R12** [Wall Street Survivor](https://www.wallstreetsurvivor.com/) — educational simulator integrated with courses; differentiate by fictional economy (not real-time securities).
- **R13** [Habitica](https://habitica.com/static/front) — tangible short tasks and progression/party design without gambling-led activation.
- **R14** [Duolingo streak help](https://www.duolingo.com/help/what-is-a-streak) — optional continuity cues; avoid punitive retention dark patterns.

Research is design input, **not** measured consumer demand, verified provider property data or proof of legal compliance. All adoption decisions must be tied back to current authority, working code and authorized Test evidence.
