# Woldeok Moneyverse — AI Scenario User Newspaper Specification

> Version: v2026.09.21.325
> Status: Living implementation-facing specification
> Baseline date: 2026-09-21
> Parent documents: `PROJECT_PLAN.md`, `AI_ECONOMY_CONTROLLER_SPEC.md`, `WEEKLY_WORLD_BRIEF_GROWTH_SPEC.md`, `WEEKLY_WORLD_BRIEF_PILOT_SPEC.md`
> Korean counterpart: [AI_SCENARIO_USER_NEWSPAPER_SPEC.ko.md](AI_SCENARIO_USER_NEWSPAPER_SPEC.ko.md)

## 1. Purpose and current reality

The existing Moneyverse AI stock newsroom already generates Korean fictional-market scenarios from current market state and recent events. The implementation is anchored in `backend/src/admin/ai-news.service.ts`, structured model output, unattended `AI_NEWS_AUTO_*` runtime configuration, scheduler integration, and the existing deterministic market-event price authority.

The authoritative project plan already contains `v2026.09.19.261 — Automatic AI stock scenarios`, including opt-in hourly generation and bounded automatic publishing.

The missing contract is therefore **not scenario generation itself but a consumer-facing newspaper layer that lets ordinary users read those scenarios safely and coherently**.

## 2. Product promise

Users should be able to read public-safe fictional market events in a newspaper-style surface, understand context, affected stocks, duration and uncertainty, and clearly distinguish the content from real financial news.

All content remains game-only fictional market information.

## 3. Information architecture

Provide a canonical `/news`-style destination or a non-conflicting equivalent in the existing public-news IA. Mobile is single-column first; desktop may use a lead-story plus recent-stories layout.

Required surfaces:
- lead story;
- recent AI scenario stories;
- active events;
- recently ended events and follow-ups;
- fictional market summary;
- archive;
- explainer for how a story maps to the deterministic market-event system.

Cards show headline, short deck, publication time, affected stocks, direction, duration, AI-generated disclosure and game-only disclosure. Strength must not be framed as a buy/sell recommendation.

Detailed articles show body, public rationale/context, linked earlier stories, affected stocks, duration, generated/published timestamps, correction/retraction state, public-safe share URL and related stories.

## 4. Generation and publishing contract

Reuse the current structured fields `headline`, `body`, `rationale`, `effects[]` and `hours`.

Generation rules:
- only registered fictional stocks;
- continuity with active/recent events;
- no real companies, real people or real-world events;
- at least one moving effect;
- invalid output fails closed or is normalized to a safe bounded form;
- model failure never creates a broken public article.

Automatic publishing inherits v2026.09.19.261:
- no market-wide automatic shock;
- no strength-3 automatic publish;
- at most two moving stocks per automatically published story;
- at most 24 hours automatic duration;
- no publish without credentials, audit actor and a safe bounded candidate.

Additional publication gates:
- non-empty headline/body;
- prohibited financial-persuasion checks;
- real-person/real-company detection;
- duplicate suppression;
- per-stock exposure cooldown;
- mandatory AI-generated and game-only disclosures;
- persisted generator version, prompt-policy version, source-context hash, moderation result and publication actor.

Human approval remains mandatory for strength 3, market-wide shocks, durations over 24 hours, reality-confusable material, sensitive/legal-like material, low-confidence output, duplicate content or narrative conflicts.

## 5. Data model

Add a publication projection such as `AiNewsPublication` linked to the existing scenario row. It stores slug, article copy, effects, timestamps, publication status, generation mode, disclosure flags, generator/prompt/moderation versions, context hash, actor and correction lineage.

The publication row never becomes price authority; deterministic market-event logic remains authoritative.

## 6. API

Public:
- `GET /api/news`
- `GET /api/news/:slug`
- `GET /api/news/archive`

Admin:
- preview/edit/approve/reject using existing AI-news flows;
- publish/correct/retract endpoints.

Public APIs never expose raw prompts, API keys, private provider errors, admin notes or private user state.

## 7. UX/editorial

Use Moneyverse-specific branding rather than imitating a real newspaper. Provide clear edition/date hierarchy, accessible mobile typography, non-color-only direction indicators, explicit loading/error/empty states, and archive/pagination in addition to any infinite feed.

## 8. Search/SEO

Do not index every generated item automatically. Only substantial, public, reviewed canonical articles are index candidates. Thin, duplicate or trivial generated variants stay noindex/archive-only. Do not generate combinatorial stock/time/direction landing pages for search traffic.

## 9. Security, trust and compliance

- visibly label AI-generated content;
- visibly retain virtual/simulated/game-only context;
- prohibit real investment advice, guaranteed-return or loss-recovery language;
- isolate prompt authority from untrusted external input;
- preserve RBAC, CSRF protection, rate limits, audit and idempotency;
- never expose raw credentials/provider errors;
- correction/retraction is auditable state, not silent history rewriting;
- public share URLs contain no session, recovery or private portfolio identifiers.

## 10. Telemetry

Track generation, eligibility, publication, rejection reasons, generation failure, duplicate suppression, article opens, continuation, archive return, correction/retraction, finance-confusion complaints, disclosure accessibility and scenario-to-market-event linkage integrity.

## 11. QA acceptance

Validate scheduler generation and fail-closed behavior, bounded automatic publishing, real-entity/financial-persuasion blocking, event linkage, public-field secrecy, responsive/accessibility behavior, duplicate/cooldown policy, correction/retraction/archive, canonical/noindex/sitemap behavior, disclosures, exact-SHA Test regression and final plan re-read before promotion.

## 12. Research references

Research date: 2026-09-21.

- Reuters Institute, Digital News Report 2026: platform/video/AI news consumption growth alongside trust and misinformation concerns. Adopt mobile-first cards, explicit provenance and contextual follow-ups.
  https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026
- Reuters Institute, South Korea 2026: changing Korean news pathways and AI-transparency context. Adopt immediately visible AI-generation disclosure.
  https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/south-korea
- Google Search Central, Generative AI content guidance: AI assistance is compatible with search when content is useful; low-value scaled generation can violate spam policy. Adopt selective canonical indexing.
  https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google Search Central, Spam policies: prohibit scaled low-value content created primarily for ranking manipulation. Adopt no combinatorial thin landing pages.
  https://developers.google.com/search/docs/essentials/spam-policies
- Korean Ministry of Science and ICT, 2026-01-21 AI Framework Act implementation notice: transparency/disclosure for generative AI outputs. Adopt mandatory consumer-facing AI disclosure.
  https://www.korea.kr/news/policyNewsView.do?newsId=148958380
- Korea Personal Information Protection Commission, 2026-03-04 AI transparency guidance context: adopt public-safe inputs, provenance and auditable processing.
  https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&nttId=11856

## 13. Priority

P0: verify current scheduler path end-to-end; publication projection/API; newspaper home/detail; AI/game-only disclosures; bounded auto-publish gate; correction/retraction/audit.

P1: stock filters, archive, related stories, duplicate/cooldown, SEO metadata, KPI dashboard.

P2: edition/weekly digest; personalization only after separate public-safe/consent approval.

## 14. Version history

### v2026.09.21.325 — AI scenario user newspaper
- reconfirmed both planning and actual AI-news implementation for automatic scenario generation;
- added consumer newspaper home/article/archive contract;
- extended bounded automatic publishing with public-content gates;
- defined AI/game-only disclosures, correction/retraction and provenance;
- added SEO anti-scaled-content, responsive and accessibility requirements;
- incorporated 2026 Reuters Institute, Google Search Central and Korean transparency/privacy references.
