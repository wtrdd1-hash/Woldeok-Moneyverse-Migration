# Integrated Product and Feature Portfolio Re-review — v2026.10.15.675

## F675-03 deep-dive — v2026.10.15.680

- [WLD activity explanation & private receipts specification](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.md) / [Korean](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.ko.md) is now the **adopted detailed planning contract** for F675-03. Builds on existing authenticated wallet/activity, does not authorize any new WLD movement. Exact cash/bank net-zero explanation, real ledger reference, bounded privacy-safe reads, 13 references and D0–D7 release gates. Not Production-verified.


## Detailed F675-02 review — v2026.10.15.679

- [F675-02 Trustworthy Fictional-Market AI News Spec](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.md) / [한국어](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.ko.md) is the adopted detailed follow-up. It reuses v325 newsroom, distinguishes AI model run vs published article vs authorized market event, and specifies actual last-published age, archive/corrections, seven user hypotheses, 13 research references and D0–D7 gates. No current Production incident closure or new implemented feature is claimed.


## Detailed F675-01 follow-up — v2026.10.15.677

- [Feature Reality, User Trust and Recovery Spec](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md) / [Korean](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.ko.md) is now the **adopted detailed planning contract for F675-01**. It is a design and research-hypothesis record, not runtime acceptance. Remaining F675-02..09 require their own one-by-one detailed review.
- Source-observed findings T677-01..06 include fake measured-health defaults and stale UI updates; remediation is subject to real-DB safety, current v530 full-route gates and exact-SHA Test. No code deployment from this adoption.


> Status: **PLANNING / AUTHORITY_DRIFT / release BLOCKED** (documentation decision and feature candidates, not implementation)
> Date: 2026-10-15 KST
> Parents: [Project Plan](PROJECT_PLAN.md) · [Integrated Planning Master](INTEGRATED_PLANNING_MASTER.md) · [Documentation Policy](../DOCUMENTATION_POLICY.md)
> Korean: [통합 기획 재검토](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md)
> Starting main: `f2bf939e53482721ee8bbf1074bd7ebf1922b13e`; mid-work and final SHA in worklog.
> **No override:** v530 UI BLOCKED gate, v523/542/543 economy safety authority, advertising-only v487, legal gates and current release policy remain in force.

## 1. Decision and evidence boundary

Moneyverse is a **persistent, non-cash-redeemable fictional social economy**, not a brokerage, real-world financial-news publisher or an ad-click game. Preserve the jobs → wallet → fictional markets → collections/businesses → community loop. Public educational tools and editorial content bring qualified visitors into voluntary, clearly disclosed game participation. Cash revenue remains eligible reviewed advertising only; speculative pricing, guaranteed-return wording and real-money game-value sales remain prohibited under current authority.

**Verified at review:** GitHub `origin/main` fetched; canonical governance, project/master, detailed design/security/SEO/AI/advertising documents reviewed; source shows tools, stock pages, blog/newspaper, admin SEO and API routes. Read-only miniPC status shows key daemons active and development DB connected. **Not verified:** every user-visible feature, authenticated admin E2E, exact-SHA isolated Test, financial role/ledger safety, currently deployed source identity, traffic/revenue outcome or Production promotion. This document is not a release approval.

Relevant recent observed evidence, not newly reproduced acceptance: [v638 functional audit](../worklog/2026-10-15-runtime-system-function-verification-v638.md) (145 anonymous GET probes, six 404, development DB privilege findings); [v651 web stability audit](../worklog/2026-10-15-web-full-code-stability-v651.md); [v652 release gate](../worklog/2026-10-15-production-promotion-gates-v652.md) (Test/backend SHA mismatch; HOLD); [v660 stock AI news audit](../worklog/2026-10-15-stock-ai-news-runtime-audit-v660.md) (model API/SSRF conflict, failed scheduled AI generation); and [v625 precision risk](../findings/MONEYVERSE_WLD_OVERFLOW_HARDENING_v2026.10.14.625.md). Status claims are scoped to those checks.

## 2. Full-domain crosswalk — coverage is not acceptance

| Domain | Existing planning / source inventory | Open decision, gap or verification | Next gate |
|---|---|---|---|
| Identity, OAuth, session, locale | Auth and multilingual design, web/mobile | restart/rollout session continuity and manual locale fallback; do not force IP-based redirects | cross-browser authenticated continuity, locale/hreflang |
| Navigation, UI, admin | v530 responsive full-route plan, admin route templates | mobile clipping, all-admin states and real CTA→endpoint reachability still blocked | five complete exact-SHA route passes and accessibility matrix |
| WLD, wallet, ledger, transfers | canonical settlement functions, v523/542/543 and v625 | direct mutations, role-grant drift, precision and fiscal conservation P0 | real-DB least privilege, posting balance, idempotency and fault injection |
| Jobs, quests, progression | work loops, rewards, clock/limits | discoverability and correct reward/window wording; no artificial earnings | start→submit→verify→receipt E2E |
| Stocks, league, market events | fictional stocks/portfolio/candles/alerts + AI scenarios | stale AI-news job, ticker/ID error mapping, freshness confusion | deterministic market event and negative auth/404/503 contracts |
| Banking, bonds, pension, treasury | many finance/economic detailed specs | must move *existing* WLD; policy version, reserve semantics, funding | independently reconciled ledger + treasury tests |
| Business, shop, collection, auctions | existing UX/economy plans | inventory/settlement states, discovery, conflicting admin actions | complete purchase/auction ledger receipt and permissions |
| Community, boards, clubs, content | social/content/editorial plans | consent, moderation, generated-content attribution and publication controls | safety, author attribution and moderation E2E |
| News, blog and AI generation | v261/v325 AI newsroom, /newspaper and blog routes | generation failures, static fallback falsely implying fresh news | durable publish state and honest last-successful timestamps |
| Public tools, guides, learning | compound/tax tools, glossary, guides | scattered calculators and a weak result→second-action funnel | calculator correctness, source provenance, measured voluntary continuation |
| Search, localization and acquisition | v507 search ops, v527 keyword pool, GSC routes | indexing ≠ submission; content quality, canonical/hreflang, country switching | URL-level crawl/readiness and first-party GSC validation |
| Advertising and measurement | v487 ad-only, analytics governance | route exclusions, invalid-traffic protections, quality PV denominator | first-party measured Page RPM and consent compliance |
| API, security, data, infrastructure | API parity v397, ASVS, Postgres gates, release policy | privileged DB role drift and Test/Prod SHA uncertainty | ASVS mapped negatives, Test same-SHA + rollback/session evidence |
| Android/other clients | shared contract and mobile API plan | contract parity vs web, permission/deep links, signing | machine contract diff and real-device acceptance |

**Interpretation:** an existing page, controller, feature switch or historical test count is *presence evidence* only. For each requirement use `PLANNING → IMPLEMENTED → TEST_VERIFIED → PRODUCTION_VERIFIED` with exact source SHA, route/API/DB evidence, and owner. No blanket upgrade of status.

## 3. P0 before new growth releases

- **G675-01 ECONOMY/SECURITY P0:** close direct WLD mutation, wide app-role grants and exposed privileged DB function risks; reconcile balances/supply, use actor-scoped SECURITY DEFINER routines and strict DB-negative tests; never patch by broadening SELECT/UPDATE.
- **G675-02 RELEASE/UI P0:** resolve exact-SHA Test vs Production identity, source health, required authenticated all-route five-pass UI test, mobile overflow and session-preserving zero-downtime rollback evidence. Maintain HOLD while blocked.
- **G675-03 AI NEWS P0:** repair safely allowlisted trusted local model access without weakening generic SSRF protections; bounded queues, exponential retry and circuit breaker; disclose last successful generation and show stale/unavailable rather than fabricated live timestamps.
- **G675-04 FEATURE REALITY P0:** register every visible interactive CTA against route → BFF → Nest contract → DB/worker → auth/switch → test and error/empty/locked states; zero broken links and no UI-only success for backend actions.
- **G675-05 CONTENT/SEO P0:** prevent duplicated thin pages and inaccurate date/schema; publish only proof-backed content; no claim of indexing from sitemap/API submission.
- **G675-06 LEGAL/ADS P0:** keep eligibility, review and route ad exclusions; casino and monetization capabilities must not be certified by an enabled switch without separate law/policy evidence.

## 4. Proposed *incremental* feature backlog

The following enhance existing specs rather than silently replacing them. IDs are proposals; build work requires approved tickets, an independent branch and tests.

| ID / priority | Incremental capability (not a replacement) | Minimum technical/UX contract | KPI / acceptance |
|---|---|---|---|
| **F675-01 P0** | **Feature Reality Registry**: operator-visible canonical per-route feature status and broken-CTA map | generated route→UI action→BFF→backend→DB/worker→switch provenance, owners, error states; sensitive paths admin-only; diff exact SHA; integrate with v397/v530 | 100% published actions mapped, 0 false success, all failing routes tracked |
| **F675-02 P0** | **AI Market News Health & Corrections**: public trust status and admin reprocess queue | generation/publish/event separate states; source/model version and publish/expiry time; no fresh stamp for stale fallback; human override/audit; safe internal model endpoint isolation | no fictitious fresh status; visible successful-at age; failed jobs observable |
| **F675-03 P1** | **Wallet Activity Explanation**: “why did WLD change?” receipt drill-down | read-only, scoped SECURITY DEFINER queries; canonical integer string/BigInt; ledger trace per reward, order, transfer, correction; redact other users | sample receipts reconcile exactly; unauthorized lookup fails |
| **F675-04 P1** | **Public Calculator → Learning → Optional Game Journey**: unifies *existing* tools and glossary, no duplicate keyword URLs | versioned formula/source/jurisdiction/effective-date/assumptions, deterministic shareable presets, compare scenarios, educational caveat, consent-safe second action; in-game fictional figures visibly separate | tool accuracy fixtures; second-useful-action rate, opt-in account activation |
| **F675-05 P1** | **First-session Next-Action Guide**: actionable “earn→choose→progress” across already planned onboarding | only server-visible available actions; stop after three suggestions; locked/loading/error/finished states; no fabricated WLD or forced streak; A/B gate via experiments spec | verified first value, D1/D7, task completion, no higher 5xx |
| **F675-06 P1** | **Search Evidence & Canonical Action Center**: advances current admin SEO pages | query/page/country/device GSC samples, API quota/caching, canonical/hreflang/sitemap parity, submitted vs crawled vs indexed vs clicked statuses, actionable URL owners | zero test/admin indexed URLs, fewer canonical mismatches, qualified GSC clicks |
| **F675-07 P1** | **Explicit Language/Country Choice + Search-Compatible Locales** | browser preference may suggest locale; always keep manual selector and persistent choice; no IP-only forced redirect; only translated validated URLs in hreflang | all languages discoverable, consistent content/meta, no locale redirect loops |
| **F675-08 P2** | **Economy Transparency Timeline**: readable public policy/event changes with simulated-impact explainer | sourced policy/version, effective window, actual vs proposed vs simulated, no autonomous issuance or prediction claims; read-only aggregation | traceable published policy events, unchanged supply invariant |
| **F675-09 P2** | **Editorial Review Queue for AI Blog/News** | draft→fact/fiction review→publish→correct/retract with source rights and human editor byline, no misleading Google News claims, idempotent scheduler | 0 unapproved auto-published stories, all corrections durable |

### Adoption boundary

- **Adopt now:** prioritization, observable truth-state model, evidence and acceptance contracts in this document.
- **Not yet authorized:** database/schema work, production policy switches, new money movements, automatic publishing, real financial advice, payment channels, location fingerprinting or forced country redirects. Each feature needs a dedicated detailed spec and ownership confirmation before coding.
- All F675 proposals are **PLANNING**; exact dates, staffing and growth uplift are unknown.

## 5. Implementation slices and stop rules

**Release 0 / stabilization:** fix P0 ledger privilege/supply defects, API/UI status truth and runtime provenance, AI news pipeline, exact-SHA Test and all-admin QA first. Fail closed on incomplete proofs; do not launch dependent revenue/growth experiments.

**Release 1 / first utility:** F675-01 visibility layer and F675-02 freshness, then F675-03 ledger explanations and F675-04 calculators. Use per-feature golden-path, negative auth, stale-source, mobile/keyboard, and deterministic-test fixtures.

**Release 2 / acquisition and retention:** F675-05 onboarding, F675-06 Search Console truth center and F675-07 locale UX after actual route indexing/quality validation. Review traffic only with real GSC and consent-safe analytics.

**Release 3 / optional differentiation:** F675-08/F675-09 after core economic/legal and content-publishing gates pass.

Metrics by route + locale + device + cohort: clean 200 responses, real action completion, first-value, D1/D7/D30, search impressions→clicks→second action, measured ad Page RPM, indexable valid URLs, Core Web Vitals p75, ledger conservation and unauthorized action blocks. Baseline each metric **unknown until measured**; never invent improvement percentages. Block rollouts on P0 incidents, broken session continuity or supply drift; use precise feature rollback and immutable audit.

## 6. Primary references (read/rechecked 2026-10-15)

| Ref | Authoritative reference | Implication |
|---|---|---|
| R675-01 | [Google Search: people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | original demonstrable value, no scaled thin-content keyword factory |
| R675-02 | [Google Search: international/multilingual](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) | separate crawlable URLs, hreflang and manual language choice; not IP-only routing |
| R675-03 | [Google Search: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) | discovery aid, not guaranteed indexing |
| R675-04 | [Google structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) | markup must reflect visible, current content; rich results not guaranteed |
| R675-05 | [Search Console API limits](https://developers.google.com/webmaster-tools/limits) | quota/caching/rate guards and no invented submission success |
| R675-06 | [Google web.dev Core Web Vitals](https://web.dev/articles/vitals) | field p75 mobile LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 |
| R675-07 | [W3C WCAG 2.2 changes](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) | keyboard focus visibility and minimum touch targets |
| R675-08 | [OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/master/5.0/en) | verifiable authz, security and boundary controls |
| R675-09 | [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) | session and reauthentication design based on assurance level |
| R675-10 | [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) | AI provenance, governance, risk and human review |
| R675-11 | [Google News transparency](https://support.google.com/news/publisher-center/answer/6204050) | dates, bylines, publication identity and corrected attribution |
| R675-12 | [PostgreSQL explicit/advisory locks](https://www.postgresql.org/docs/17/explicit-locking.html) | transaction vs session locking semantics; separate from monetary invariant |
| R675-13 | [Google Search Console data limits](https://support.google.com/webmasters/answer/12919192) | incomplete API extracts are not total-indexing truth |

References are product/security design inputs, **not** evidence of deployment, search ranking, AdSense approval, external-data rights, or Korean legal compliance. Recheck at feature implementation time.

## 7. Handoff and documentation QA

For each accepted F675 item: (1) existing-feature duplicate check; (2) one owner and canonical spec; (3) route/API/DB read/write matrix; (4) permissions and failure UX; (5) exact BigInt/fiscal invariants where relevant; (6) EN/KO + public locale readiness; (7) deterministic tests and isolated Test E2E; (8) security/privacy/SEO/ads review; (9) source SHA, no-downtime deployment, session sampling, rollback; (10) evidence-linked status update.

Documentation-only change; **no source code, Test or Production promotion performed by v675**. See [worklog](../worklog/2026-10-15-integrated-planning-review-v675.md) and the internal/GitHub update notes.
