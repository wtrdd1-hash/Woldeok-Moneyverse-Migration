# Moneyverse 2026 Competitive, SEO and Product Quality Review — v2026.10.16.746

**Status: FINDINGS / RECOMMENDATIONS / NOT PRODUCT AUTHORITY / NOT IMPLEMENTED**
**Date:** 2026-10-16 KST
**Audited repository main:** `7db7150cd20a684e62a2c1d71c42dc6200929b91`
**Korean pair:** [한국어](WOLDEOK_PRODUCT_TRENDS_BENCHMARK_v2026.10.16.746.ko.md)
**Coordination:** Complement to now-merged [v745 planning-gap audit PR #905](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/905); do not duplicate or modify that branch.

## 1. Decision: compete on trustworthy persistent simulation, not feature count

Moneyverse's existing product authority describes a persistent, fictional, **non-cash-redeemable WLD social economy**, connected by work → accountable wallet → simulated markets/business → community. It is **not** a regulated brokerage, live stock news source, real-money reward system or guaranteed earnings product. The product's defensible position is **a coherent economy players can understand, verify and influence**. Onboarding, simulation accounting, transparently disclosed AI events, and real-life useful learning tools should work together; a longer menu of speculative features will not compensate for misleading receipts or unreliable core actions.

### Evidence tiers
- **Observed now:** Latest main source at the SHA above, miniPC read-only service/process/filesystem diagnostics, existing authoritative planning and linked detailed specs; v745 independently checked public Production/Test version responses.
- **Historical evidence, revalidation required:** v713/v737/v743 role and ledger audits, v530 five-pass UI hold, v660/v675 AI newsroom and CTA findings.
- **Proposal, not test result:** Competitive analogies, feature opportunities, audience hypotheses and target service-level objectives. No real user research, Search Console property review, full Production financial test, authenticated E2E, Android device test or performance field data were executed in this work.

## 2. Code-to-plan differential (selected source-backed examples)

| ID | Current evidence | What must change / verification |
|---|---|---|
| T746-01 — P0 release identity | Read-only host: `production-current` points to v717, whereas legacy `moneyverse-backend` / `moneyverse-frontend` systemd process CWDs are `prod-v600`; Discord bot legacy CWD is root clone. v745 also identified separately active versioned units and public version v717. **Not proof legacy serves ingress**. | Discover Nginx upstream, processes/listening ports, scheduler leases and exact source manifest for each live writer. Alert on conflicting job owners. Do not symlink-swap or restart before migration/rollback acceptance. |
| T746-02 — P0 virtual-money trust | v743 reports aggregate ledger opening/projection discrepancies and finance-role scope; current master preserves v523/v542/v543 no-synthetic-mint and reconciliation gates. | Create independently grounded opening-balance certificates, exact integer ledger/fiscal reconciliation, least-privilege role negatives and idempotent commands on isolated restored Test. Never manufacture correcting entries. |
| T746-03 — P1 reward truth | `frontend/src/app/[locale]/tools/compound-interest-calculator/compound-calculator-client.tsx` renders "Claim 10,000 WLD" and "risk-free" participation copy. An actual server receipt is not established by that text. | Remove guarantee until a source-verified eligibility/ledger receipt exists; label fictional risk distinctly from real cash, provide plain calculator use without enrollment. |
| T746-04 — P1 SEO measurement truth | `backend/src/seo/seo.service.ts` assigns `indexed` counts using a `healthy/warning` crawler health bucket; `frontend/src/app/admin/analytics/analytics-client-view.tsx` labels the count confirmed search indexing. | Replace fake equivalence with independent states: URL published / sitemap submitted / bot visited / GSC URL inspected / GSC impressions and clicks; unknown remains unknown. |
| T746-05 — P1 economic admin | `backend/src/admin/treasury/treasury.repository.ts` contains static `RECONCILED` status assignments (including lines around 506, 879 at audited SHA). | Trace the relevant response to its runtime callers and compute independently sourced balances/variance; suppress definitive reconciliation statuses before real measured evidence. |
| T746-06 — P1 retention/space | Read-only `df -h /srv`: 99 GiB capacity, ~86 GiB used, ~8.9 GiB available (91%). | Identify top retained releases, task worktrees, logs/backups safely; adopt disk/IO thresholds and explicitly tested retention/backups. Do **not** delete backups, WAL or active release artifacts speculatively. |
| T746-07 — P1 mobile contract | App repo main `ee97ddfc5a93...` (2026-10-15 merge, v1.3.5 signing); web repo `7db7150c` and v745 identified separate Test/Production identities. | Verify generated API contract, signed bundle/device login, deep-link/locale settings, 401/403/409 and wallet receipts; never infer compatibility from a Gradle build. |

## 3. Benchmark comparison — what to learn, not copy

| Reference | Observable product pattern | Moneyverse translation | Anti-pattern |
|---|---|---|---|
| [EVE Online Economic Reports](https://www.eveonline.com/ko/news/467) (September 2026 report listed on Oct 14) | Regular public, dated economy reports with explorable production, destruction, money-supply and price-index observations | A signed-by-version **fictional economic transparency report**: issuance/retirement, sinks/faucets, treasury balance, market liquidity, confidence and event history, with downloads and methodology | Displaying fabricated aggregates or confusing virtual WLD data with a real-world asset |
| [Sim Companies](https://www.simcompanies.com/search/) | Learn-by-doing economic/business simulation, production chain and peer learning; visible free-play educational positioning | Guided job → production/enterprise → market sale → accounting receipt, progress by real actions and community mentoring | Overwhelming first session with banking/treasury jargon and unsupported reward promises |
| [Google AI Search](https://developers.google.com/search/docs/appearance/ai-features?hl=ko) | Useful reliable pages remain necessary for AI Overviews/AI Mode; no special "AI SEO" markup is required | Publish independently useful calculators, glossaries and locally accurate analysis with transparent bylines, reproducible assumptions, source dates and original fictional economy data | Mass translated keyword pages or "AI optimization" switches with no evidence |
| [WCAG2Mobile](https://www.w3.org/TR/wcag2mobile-22/) and [web.dev](https://web.dev/articles/defining-core-web-vitals-thresholds?hl=en) | Mobile reachability, accessible targets, predictable reflow; user-measured responsiveness | Admin/member complete flows on touch devices with accessible menus and real field performance | Passing desktop snapshots while authenticated mobile routes remain clipped |

Competitor links are design references, **not direct evidence of Moneyverse market share, conversion or revenue**.

## 4. 2026 trend-response priorities

### 4.1 AI search and trustworthy editorial (P1)
The Google AI features guidance states ordinary technical crawl/index eligibility and helpful content rules still apply, and AI features have no additional SEO markup requirement. The AI-generated-content policy warns about scaled low-value pages. Each article should have a stable URL, real publication/modified times, author/editor source, factual source list, clear **fictional simulation vs real-world explanation** labeling, image rights/alt text, correction history and locale-specific original editorial value. News generation, editorial approval, publication, scheduler completion and simulated market event must have **separate state machines**.

**Acceptance:** audited sample of 20 articles across 4 locales; page-level HTML lang/canonical/reciprocal hreflang; no fabricated freshness, no non-reviewed financial claims, no unjustified NewsArticle markup and no published stock event without durable authorization.

### 4.2 Four-language and four-region design (P1)
Google recommends distinct crawlable URLs for language variants and explicit user-controlled switching, not forced IP redirects. Define the region intent separately from language:
- KR: Korean-first onboarding, Korean educational examples and clearly fictional WLD.
- US/EN: US-relevant assumptions, U.S. English editorial, source/effective-date disclaimers; never reuse Korean tax/regulatory numbers as U.S. advice.
- Japan/JA: Japanese original summaries and financial terms; manual language changes persist.
- China/ZH: Simplified Chinese original text and jurisdiction-specific source reviews; avoid claiming coverage or approvals for unavailable jurisdictions.

**Acceptance:** 1) 200/indexability for selected locale canonical, 2) reciprocal hreflang and x-default intent, 3) no redirect trap, 4) distinct primary content, 5) metadata/OG/Article schema matches on-page words, 6) persist preference and expose always-available language selector. Preserve English as canonical documentation language; Korean companion docs remain required.

### 4.3 Feature reality, first-session retention and financial receipts (P0/P1)
Reuse existing F675-01..05, not another dashboard. Make **one user-visible feature contract** per action: route → authorized same-origin BFF → Nest service → actor-checked SQL/worker → immutable receipt/read-back → verified UI state. The ideal first session has a safe three-choice next action after real eligibility checks: learn using a guest calculator, start a verified task, or inspect a fictional market. Each is optional and functional even if signing up is postponed. Show **PENDING / CONFIRMED / DENIED / UNKNOWN_RECONCILING**, not just green success.

**Acceptance:** all published actions inventoried; member and admin cases tested; no wallet/stock state inferred from localStorage; no unsafe retries; measured D1/D7 opt-in cohorts without coercive streak design.

### 4.4 Quantified experience and release quality (P0/P1)
Maintain v530 five-pass authenticated full-route acceptance as gate, and measure field CWV by locale/device: p75 LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 (official recommended 'good' thresholds, **targets not measured here**). Include API 401/403/409/429/503, device reflow/keyboard/contrast/touch targets, private cache safety and session-preserving no-downtime cutover evidence. Audit public and operator-worker identity separately; no automatic release of docs-only changes.

### 4.5 Virtual-economy risk model (P0)
Follow OWASP ASVS 5.0 and API Top 10 2023: mandatory actor/resource authorization, purpose-bound financial commands, strict app SQL roles, narrow SECURITY DEFINER functions, no stored credential leak, concurrency/idempotency/failure-injection and independently reconciled supply. Canary/rollback cannot rewrite users' balances. Feature switches being 'enabled' are **not** legal, security or user-journey acceptance.

## 5. Delivery roadmap and accountable acceptance

| Sequence | Owner / work package | Testable output | Release constraint |
|---|---|---|---|
| 0 — immediately | Release + finance engineering, v713/v743 owner | Production/Test/legacy process + ingress/worker identity map; backup/recovery and disk safety; real DB role/ledger source snapshot | Read-only until restore and acceptance. HOLD all unsafe money work. |
| 1 — P0 | Finance DB owner | Conservation, opening-balance evidence, raw-write revocation after actor-command migration, migrated forward-only Test schema; no unpassed or skipped financial gates | Independent isolated DB negative and concurrency tests |
| 2 — P0 | QA + accessibility owner | Full route/action/UI/API/DB matrix, five authenticated passes, Android compatibility and mobile reflow, saved sessions | Exact candidate source SHA and continuous rollback evidence |
| 3 — P1 | UX + editorial + search | Truthful reward/receipt, newsroom versioning/editorial queues, canonical/hreflang, four-locale 20-page review and GSC raw evidence | Source vs index vs traffic states distinct |
| 4 — P2 | Product + data | First-session and economy-transparency experiment, D1/D7 and Page RPM cohort dashboard | Privacy/consent, no forced streak or fabricated numbers |

**Status reporting** must keep `PLANNING`, `IMPLEMENTED`, `TEST_VERIFIED`, `PRODUCTION_VERIFIED` and `BLOCKED` separate for each task. This document makes **no** release or implementation claim. Existing v713/F675 detailed specs retain their authority and owners; do not overwrite v744/v745 concurrent work.

## 6. Source register — primary references and concrete analogies

1. Google Search Central, [multilingual and multi-regional site management](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites).
2. Google Search Central, [canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
3. Google Search Central, [AI features and websites](https://developers.google.com/search/docs/appearance/ai-features?hl=ko).
4. Google Search Central, [people-first and E-E-A-T/YMYL](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
5. Google Search Central, [generative AI and scaled content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content?hl=en).
6. Google Search Central, [Article / NewsArticle / BlogPosting markup](https://developers.google.com/search/docs/appearance/structured-data/article).
7. Google Search Central, [sitemaps are hints, not indexing guarantees](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko).
8. Google Search Central, [recrawl and indexing request limits](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).
9. Google Search Central, [discussion/forum markup](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum?hl=en).
10. Google web.dev, [Core Web Vitals field thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds?hl=en).
11. W3C, [WCAG 2.2 mobile application guidance](https://www.w3.org/TR/wcag2mobile-22/).
12. OWASP, [ASVS 5.0](https://github.com/OWASP/ASVS).
13. OWASP, [API Security Top 10 2023](https://api-security.owasp.org/editions/2023/en/0x11-t10/).
14. EVE Online, [Economic Reports / 2026 official listing](https://www.eveonline.com/ko/news/467).
15. EVE Online, [June 2026 economic-report methodology and datasets](https://www.eveonline.com/news/view/monthly-economic-report-june-2026).
16. Sim Companies, [official learning-through-economy overview](https://www.simcompanies.com/search/).
17. GitHub, [current-authority gap audit PR #905](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/905).
18. In-repository authoritative inputs: `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md`, `docs/planning/PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.md` and `docs/DOCUMENTATION_POLICY.md`.
