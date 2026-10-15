# F675-02 — Trustworthy Fictional-Market AI News: Freshness, Recovery and Editorial Safety

> **v2026.10.15.679** · **PLANNING / AUTHORITY_DRIFT / Production BLOCKED** · 2026-10-15 KST
>
> Canonical English | [한국어](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.ko.md)
> Parents: [PROJECT_PLAN](PROJECT_PLAN.md) → [Integrated Master](INTEGRATED_PLANNING_MASTER.md) → [v675 product portfolio](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md) → [v325 AI Scenario Newspaper](AI_SCENARIO_USER_NEWSPAPER_SPEC.md) → [v677 feature truth](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md).
> Started from `origin/main=b70cedbce34ad43bffe593ffbd1ac8374edb5ffa`, mid/final main checks in [v679 worklog](../worklog/2026-10-15-f67502-ai-news-user-trust-v679.md).
>
> **No change in business authority:** fictional WLD stocks, not securities or real investment advice. Existing v261/v325 bounded AI news, v523/542/543 money/market conservation, v530 full-UI blocked gate and v487 ad-only revenue still govern. A code branch or running process is not end-to-end verified publication.

## 1. Product thesis and boundaries

**User promise:** “I can identify that a story is about the fictional Moneyverse market, when it was actually published, whether its stated event is active or expired, what evidence supports the effect, and whether it was AI-produced, edited, corrected or withdrawn. When generation fails, the site does not pretend old stories are new.”

Separate **content generation**, **human/policy review**, **publication**, and **deterministic price-impact event execution**. AI generates a *candidate narrative*, not privileged stock prices, official real-world financial reporting, automatic currency issuance, or trade signals.

In scope: reliability/freshness truth, article archive and event linkage, public mobile reading, admin operational diagnostics, safe retries and correction/retraction, bounded editorial and release acceptance, SEO quality. Out of scope: real company news scraping or trading advice, publication of arbitrary outside stories, unlimited mass SEO article generation, paid AI/news subscriptions, WLD issuance, blanket SSRF exception, silently activating Production news generation, and replacing the full F675-09 editorial management queue.

## 2. Exact-source baseline and scoped prior runtime evidence

| ID / severity | Evidence and source identity | User-risk hypothesis and required remediation |
|---|---|---|
| **N679-01 P0** | v660 read-only Production audit (at ~11:00 KST Oct 15, **not** newly rerun here): hourly `stock.ai_scenario_auto` had 131 failed scheduler statuses; last observed batch/event Oct 11 17:26 KST; configured local Ollama responded at `/v1/models`, while `safeFetch` SSRF guard rejected loopback model completions | News production could stop while site remains online; separately authorize trusted internal model transport, then prove actual end-to-end generation in isolated Test |
| **N679-02 P0** | Current `origin/main` `backend/src/admin/ai-news.service.ts` imports generic `safeFetch`; scheduler checks `AI_NEWS_AUTO_ENABLED`/actor before calling `autoGenerateAndPublish` | Model transport must not weaken global SSRF guard, and `skipped`/transport failure cannot be counted as published |
| **N679-03 P1** | Current `backend/src/stock/newspaper.controller.ts` `GET pulse` returns fixed `sentimentScore=68`, `activeEventsCount=4`, canned lead text, but `updatedAt=new Date()` | Fabricated live freshness; replace with measured/provenanced result or explicitly labeled sample; empty source => `UNKNOWN`, never live |
| **N679-04 P1** | `GET weekly-brief` mixes DB-derived numbers with fallback floors/hardcoded volume, change %, rankings and narrative; `Number` conversion occurs on WLD-like totals | Separate verified aggregates, simulated illustration and unavailable fields; bigint/string precision, no unsupported weekly leaderboard assertions |
| **N679-05 P1** | `GET poll` uses mutable in-memory voting counts, defaults and process-local state | Do not describe as cross-instance durable public polling; either clearly mark demo/noindex or design real actor-scoped/antispam persistent vote function after data privacy and limits review |
| **N679-06 P1** | `frontend/src/app/newspaper/page.tsx` reads current `/stocks/market-events` and stocks; headline/metadata call it “real-time”; active-event feed alone does not provide historical news archive | Article archive and active event are distinct lists; legitimate expired news stays readable with ended label |
| **N679-07 P1** | Previous v325 spec already mandates game-only/AI disclosures, public archive, versioned provenance, human review for powerful shocks, correction/retraction, restricted automatic publishing | Implement *the existing spec* before adding features; new feature is truthful freshness and recovery, not a second incompatible newsroom |
| **N679-08 P0** | Separate `fix/stock-ai-news-local-transport-v2026.10.15.661` worktree exists but is not merged into reviewed origin/main | Treat its changes as concurrent candidate; inspect and incorporate safely in a future implementation PR, never overwrite or label it deployed |

Evidence taxonomy: `SOURCE_OBSERVED` for inspected main code; `HISTORICAL_RUNTIME_OBSERVED` for v660; `CANDIDATE_ONLY` for v661; `HYPOTHESIS` for prospective user needs; `TEST_VERIFIED` and `PRODUCTION_VERIFIED` require independent exact-SHA evidence. Do not extrapolate past failure counts to current Production.

## 3. User research and jobs-to-be-done (proposed, **not** conducted)

| User / realistic task | What matters from their perspective | Failure experience to prevent | Prototype evaluation |
|---|---|---|---|
| Guest arriving via search/share | “Is this a real investment headline or a game story?” | Real-looking news card, missing game-only disclaimer | Identify fictional stock, AI byline and original publication date without scrolling |
| New mobile player | “What happened, which fictional stock is affected, and for how long?” | Jargon, tiny chips, scrolling, implied guaranteed change | Open card, understand magnitude/direction and expiration, return to ticker |
| Returning active market player | “Is this event still affecting price or was it yesterday?” | Archived article presented as active; misleading live badge | Compare article timestamp with market event `startsAt/endsAt`, inspect verified current quote |
| Reader after four days of no new content | “Why has nothing new appeared? Is this site abandoned?” | Placeholder with `updatedAt=now` gives false freshness | See `last published` date and non-alarming stale notice, browse archive |
| User with limited bandwidth or screen reader | “Read text and recover if article list cannot load.” | Infinite spinner, reliance on colored arrows, inaccessible auto updates | Keyboard/screen reader semantics, skip decorative animations, retry safely |
| Moderator/admin | “Why did auto news fail; can I restore it without creating market shocks?” | ‘success’ meaning skip; insecure localhost exception; duplicate re-publication | Locate stage, categorized failure, dry-run & idempotency evidence |
| Returning user reading a corrected story | “Was the previous headline wrong? Can I find what changed?” | Silent rewrite, orphaned shared links, misinformation | See visible correction banner, time, diff/summary and preserved original record |

Recruit opt-in, diverse Korean/mobile and English readers for moderated task testing; proposed exploratory sample 3–5 people per materially different task type when practical, not a statistically representative outcome. Screen-reader and slow-network review are required. **No actual interviews, surveys, cohort conversion numbers, or trust uplift are claimed.** Test information scent and comprehension, not clickbait or trading volume.

## 4. Public information architecture

Keep existing canonical **`/newspaper`**; don't add a redundant `/news` navigation destination just for SEO. Proposed mobile-first hierarchy:

1. Clear masthead: **“머니버스 가상시장 뉴스 · AI 생성 및 운영 검수”** / “Moneyverse Fictional-Market News · AI-assisted, reviewed”. Visible above first story, not buried in disclaimer.
2. Compact trust strip: `lastPublishedAt`, `lastSuccessfulGenerationAt` (admin may see; public need not imply generation=publishing), story-feed freshness state, and short “game-only” statement.
3. Lead story (only if actually published): specific fictional issuer, short summary, `publishedAt`, `generatedByAI`, review status and `effectState=ACTIVE/ENDED/NO_MARKET_EFFECT` badge. Never infer the article is new from page render timestamp.
4. **Active events** (only real deterministic events currently in effect), sorted by effective time; **Recent articles** (includes expired events); **Archive** with pagination. Distinguish no active market events from no articles.
5. Article detail: accessible headline; visible exact publication/updated times in requested locale; creator attribution `AI-assisted simulation`, operator editorial attribution where appropriate, original stock/symbol, **source context/logic explained as simulation**, attached event effect, duration, correction/retraction chain, related fictional assets; “not financial advice” near event impact as well as footnote.
6. Contextual safe navigation: “See current fictional quote”, “Learn event mechanics”, “Read related archived stories”; **no urgency manipulations, buy/sell recommendations, real-market price promises or compulsory signup**.
7. Empty/degraded/error: useful archive even if current generator is down; no invented market momentum numbers; retries only for safe reads; no fabricated last-success.
8. User-facing freshness states: `CURRENT` (genuinely within measured cadence), `QUIET_MARKET` (generation healthy but zero eligible publications), `STALE` (past expected cadence), `UNAVAILABLE` (incident confirmed), `UNKNOWN` (source/identity/clock unknown). “No articles today” is not necessarily a service outage.

**Microcopy examples (subject to usability test)**

| Status | Korean | English |
|---|---|---|
| Story identity | AI가 생성하고 검수한 머니버스 가상시장 소식입니다. 실제 기업이나 투자 뉴스가 아닙니다. | AI-assisted news about Moneyverse's fictional market, not real companies or investment news. |
| Active event | 이 가상시장 이벤트는 표시된 종료 시각까지 적용될 수 있습니다. 실제 시세는 종목 화면에서 확인하세요. | This fictional event may apply until the shown end time. Check the current in-game quote on its stock page. |
| Expired event | 이 이벤트는 종료되었습니다. 기사는 기록으로 남아 있습니다. | This event has ended; the article is kept as history. |
| Generation outage | 최근 자동 생성이 지연되고 있습니다. 마지막 실제 발행 시각을 확인하고 이전 기사를 읽을 수 있습니다. | Automatic updates are delayed. See the last actual publication date or browse earlier stories. |
| Quiet but healthy | 현재 발행된 새 기사는 없습니다. 이는 시장 거래 정상 여부를 뜻하지 않습니다. | No new story has been published. This does not confirm trading health. |
| Corrected | 이 기사는 수정되었습니다. 변경 이유와 시각을 확인하세요. | This story was corrected. See what changed and when. |
| Retracted | 이 기사는 철회되었습니다. 공유 링크는 정정 안내로 연결됩니다. | This story was retracted. The shared link now explains why. |
| Unknown status | 현재 새 소식의 발행 상태를 확인할 수 없습니다. | We can't confirm the latest publication status right now. |

## 5. Temporal and state authority model

Record **five distinct clocks**: `contextObservedAt` (market input snapshot), `generatedAt` (model completion), `reviewedAt` (editor/policy approval), `publishedAt` (public durable commit), `eventStartsAt/eventEndsAt` (deterministic market impact). `lastSuccessfulModelCallAt` and `lastPublishedAt` are different. Article `dateModified` only changes for substantial public editorial updates, not caching, page rendering or routine health polls. All persisted as UTC instants and rendered local timezone with absolute timestamp accessible; derive age from server-confirmed data and handle clock skew.

**Generation attempt:** `SCHEDULED → CLAIMED → MODEL_REQUESTED → GENERATED → VALIDATING → ELIGIBLE | REJECTED | FAILED | SKIPPED`; retryable failures `RETRY_WAIT`, manual review `REVIEW_REQUIRED`. A scheduler `succeeded` record may mean a skip; **it is not a published article**.

**Editorial publication:** `DRAFT → POLICY_REVIEWED → APPROVED → PUBLISHED → CORRECTED | RETRACTED`, with `REJECTED` terminal for ineligible items. Corrected articles keep immutable revision and reason; retraction does not erase public explanation or immutable audit.

**Price/event state:** `NO_EVENT | SCHEDULED | ACTIVE | ENDED | CANCELLED | FAILED`; event is owned by existing deterministic market functions, not by an article's prose. Article publication **must not automatically imply** an applied market impact if the settlement/event registration fails.

**Freshness rule candidate:** compare age of *last confirmed publication* and confirmed attempted generation against configured cadence + bounded grace window; a healthy generation may legitimately publish zero articles. Do **not** hardcode a universal “every 60 minutes a new article” promise: v325 eligibility, cooldown, stock limits and safety may reject all candidates. If sampling or runtime SHA absent show `UNKNOWN`, not `CURRENT`. On stale archive keep true published times, no fake live headline.

## 6. Architecture and durable data contract

Existing `AiNewsRepository` batches/scenarios, market events, scheduler job runs and admin UI remain sources; add a versioned **publication projection** under the v325 design only if actually missing from source. Reuse existing IDs and DB reconciliation, no second price authority.

Minimum record:
- `storyId, slug, locale, headline, summary, body`, public game-only + AI disclosures;
- `generationRunId, batchId, scenarioId, eventId?`, deterministic `sourceContextHash`, prompt-policy/model/editorial-policy versions, content checksum, moderation rationale code;
- `contextObservedAt, generatedAt, reviewedAt?, publishedAt?, lastSubstantiveModifiedAt?, eventStartsAt?, eventEndsAt?`;
- `generationState, publicationState, effectState, failureReasonCode?, retryAfter?, correctionOf?, revisionId`, release SHA & owner;
- visibility/version, derived fictional stock symbols (validated allowlist), privacy-safe audit IDs.

**Atomicity:** generator output enters a bounded read-only draft; validation and reviewer policy apply first. A single DB transaction verifies actor/switch/stock/state/cooldown, creates durable publication intent and the authorized event linkage/outbox record, and commits idempotently; only a previously approved event executor may activate price effects. Unique keys on scheduler window+actor+context scenario digest, publication version, event application prevent repeats. For cross-process publication use durable Outbox and consumer dedupe, not an in-memory timer. Any crash/retry yields the same batch/story/event, never double price shock. Ledger/WLD must remain untouched except the existing independently authorized market operation, preserving supply invariant. **No direct balance UPDATEs**.

**Existing v325 automatic constraints retained:** no whole-market automatic shock; no strength 3 auto publish; at most 2 moving stocks per automatic story; max 24-hour automatic event; authenticated designated actor, validated registered ticker, duplication/exposure cooldown, source-context lineage. Human/manual approval for market-wide, strength 3, longer durations, reality-confusable content, sensitive/legal-looking stories, conflict or low confidence. High-risk approvals use existing admin step-up/CSRF/audit, but additional permission alone cannot authorize prohibited economic actions.

**Model transport security:** preserve generic `safeFetch` SSRF protection; approved **separate internal-model client** only to deployment-owned fixed host/port/path, no user-supplied URL, redirects, arbitrary DNS/private IP wildcard or cloud metadata; network isolation, bounded tokens/body, timeouts, TLS/auth secrets policy if applicable. Test negative `127.0.0.2`, metadata address, IPv6, redirect and user-provided baseURL. v661 concurrent code is an implementation *candidate* only until rechecked and merged; this v679 spec does not replace that branch or pronounce it safe.

**Worker availability:** per-job lease/advisory lock, bounded concurrency, backoff with jitter and retry budget, circuit breaker, quarantine of invalid model responses, rate and model-budget caps, manual replay only of a known non-published candidate with audit/confirmation. Distinguish transport failures, timeouts, model refusal/invalid JSON, moderation rejection, cooldown skip, DB error, event-application failure. Never disable SSRF globally or force-success on empty model output.

## 7. API and UX surface contracts (proposals — routes not claimed implemented)

Public read:
- Extend `GET /api/v1/newspaper/weekly-brief` and `/pulse` with `dataKind: MEASURED | SIMULATED_ILLUSTRATION | UNAVAILABLE`, independently sourced `observedAt` and freshness; never use fixed 68/4 as live. Existing clients need backwards-compatible projection with deprecation.
- `GET /api/v1/newspaper/edition?cursor&locale`: public `publicationStatus, lastPublishedAt, feedFreshness, publishedStories[], activeEvents[]`, separately paginated. `sourceVersion` may be an opaque public version, not internal machine topology.
- `GET /api/v1/newspaper/stories/:slug`, `GET /api/v1/newspaper/archive?cursor&symbol`: canonical immutable published revisions; only public-safe fields. Retracted shared URL returns clear notice; avoid HTTP deletion of evidence without policy.
- `GET /api/v1/newspaper/stories/:slug/history`: public-safe corrections and change dates, not raw prompt/admin note.
- Any personalized follow-up/news alerts require separate opt-in/privacy/suppression plan, **not enabled in F675-02**.

Admin read:
- Existing `/api/v1/admin/ai-news/batches/latest`, settings/models and scheduler monitoring extended with run lifecycle, failed step, last *non-skipped* model success, last *published*, queued/rejected counts, source SHA, effective model transport class, redacted errors, event reconciliation.
- Proposed `GET /api/v1/admin/ai-news/runs?cursor&status`, `GET /api/v1/admin/ai-news/publications/:id`; retries or corrections only if authorized versioned POST with separate reauth/idempotency/audit, never GET mutation.
- All new endpoints require explicit authn/authz, rate limits, stable error bodies, pagination, ownership, data retention, CSRF for cookie-based mutations, no raw prompt/key and no user data in public payloads.

**Example response (illustrative only):**
```json
{
  "feedFreshness": "STALE",
  "lastPublishedAt": "2026-10-11T08:26:00Z",
  "lastConfirmedAttemptAt": "2026-10-15T01:27:00Z",
  "latestRunOutcome": "FAILED",
  "activeEvents": [],
  "stories": [{"slug":"fictional-event-001","publicationState":"PUBLISHED","effectState":"ENDED","publishedAt":"2026-10-11T08:26:00Z","aiGenerated":true,"fictionalMarket":true}],
  "sourceReliability": "HISTORICAL_EXAMPLE"
}
```
Example timestamps are **illustration of prior audit context**, never assert as live API output.

## 8. User research, analytics and trust measurements

Instrument privacy-safe redacted counters: `ai_news_attempt_total{outcome}`, `ai_news_model_error_total{category}`, `ai_news_review_total{decision}`, `ai_news_publish_total`, `ai_news_duplicate_suppressed_total`, `ai_news_event_link_consistency`, age since **real** last published vs confirmed attempt, `ai_news_public_archive_views`, `news_to_fictional_stock_learning_click`, `correction_open_rate`, `fiction_confusion_reports`. Measure success conditional on eligibility; 0 attempts is `UNKNOWN`, not 100%. Avoid user IDs, article slug or prompt text as metric labels. Use trace ID in restricted logs and retention policy. No recorded WLD balances or private holdings in generation prompt.

Hypotheses to validate:
- first-visit readers can identify the market as fictional and AI-assisted within a brief glance;
- lapsed readers prefer an honest historical archive to recycled current headlines;
- visible correction lineage reduces confusion, rather than merely increasing clicks;
- user continuation via “learn mechanism/current fictional stock” is more meaningful than feed impressions alone.

Research plan: task-based moderated pilot and moderated remote/mobile checks with clear comprehension questions, keyboard/screen reader and slow connectivity. Segment returning vs guest, new vs experienced player, Korean vs English. Interview count, trust baseline, D1/D7 retention and search uplift are **UNKNOWN** until observed. Avoid A/B manipulation of misinformation disclaimers: all variants must keep disclosure.

## 9. SEO, localization, publisher compliance and ethical boundaries

- `/newspaper` canonical public hub; archive uses stable legitimate article URLs, pagination; no mass programmatic ticker/hourly fabricated SEO pages. Newly generated thin, unreviewed, duplicate, unpublished, retracted or stale illustration-only items default `noindex`; published substantial page eligibility requires human/policy-approved value and index gates.
- Article structured data `datePublished/dateModified` must agree with visible content/timezone, true author/publisher attribution, fictional game context and correction display. Page SSR hydration/polls must not refresh `dateModified` without meaningful editorial change. Don't claim Google News inclusion or employ misleading `NewsArticle` schema for low-value fictional fiction; use applicable `Article/CreativeWork` only when genuinely appropriate.
- English/Korean editorial master+quality-reviewed translations; machine translation can be draft only, maintain equivalent canonical/hreflang only for genuinely translated pages, locale-specific timestamps. Preserve ability to choose language manually.
- Real brand/person references, manipulated images, external real news sources and unlicensed article copying are not authorized. Fictional-mission setting and reader disclosure are mandatory. Korean AI transparency/ratings/privacy obligations require separate up-to-date legal review; no declaration of legal certification here.
- Ads only in already eligible reviewed public placements; avoid ad density/sponsorship confusion around fictional finance story and ensure consent/invalid traffic controls. No pay-to-unlock, affiliate sales or promoted buy signals.

## 10. Deterministic Test and delivery gates

| Slice | Required result | Proof / blocking negative |
|---|---|---|
| **D0** source/current-incident truth | versioned route+schema and v660/v661 divergence/production identity report | verified actual SHA; distinguish historic failure from current; no side effects |
| **D1** separate model transport | restricted internal model client and security tests | only approved exact destination; metadata/private redirects blocked; malformed output fail-closed |
| **D2** scheduler and storage | safe idempotent generation-run state, backoff, lock, Outbox | zero duplicate publish/shock after crash/replay; skip is not publish; bounded retries |
| **D3** publication/event linking | v325 publish, expiry, correction/retract projections | fictional stock whitelist, strength/duration/whole market gates, lifecycle consistency |
| **D4** public UX | /newspaper lead/current/archive/detail, freshness, model attribution | no fake “now”; expired event still archived; accessible mobile and KO/EN |
| **D5** admin operations | existing admin AI-news console with run-stage, last real published, redacted error, authorized actions | ordinary user blocked; CSRF/reauth negative; operator sees actual failure class |
| **D6** analytics/SEO | true data origin, canonical/dateModified, quality and privacy gates | no indexed thin AI spam; no unauthorized publication; no private content |
| **D7** release safety | app unit/integration/security; exact-SHA isolated Test and five-pass all-route; ledger/stock-event consistency, session+rollback | **HOLD** if Test backend identity mismatch, market money/ACL P0, v530 UI failure or unauthorized actual market effect |

Required fixtures: model unreachable, no runtime key but local model, SSRF loopback allowed only for dedicated client, redirect to metadata, invalid JSON, prompt injection, real-company leakage, copyrighted excerpt, duplicate context, huge number, leap/cross-timezone clock, no publication due cooldown, market event ended, late correction, retraction shared URL, DB commit succeeded but response lost, simultaneous cron+manual trigger, Test restart, privileged endpoint as ordinary user, mobile 320/360/390/430 and 200%/400% zoom, keyboard/screen-reader, malformed `lastPublishedAt`, empty/partial data, Googlebot metadata consistency.

**Acceptance targets** are invariants, not invented forecasts: no false live timestamps; no editorially disallowed auto event; no repeated event application; 100% published articles carry game/AI disclosures and immutable reference IDs; 100% retractions/corrections preserve traceable history; no public secrets/real user data; accurate `UNKNOWN` on missing evidence; observed Test generation→approved event→published article→public read path on same source SHA, with negative tests. Percentage business KPIs to be set only after baseline.

No code, model invocation, real-user news publication, DB mutation, Test or Production promotion performed in this v679 **planning** cycle.

## 11. Verified external reference register (read 2026-10-15)

| ID | Primary/recognized source | Design interpretation |
|---|---|---|
| R679-01 | [Reuters Institute 2026 — South Korea](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/south-korea) | Korean readers' news trust/AI labeling context; not a Moneyverse user survey |
| R679-02 | [Reuters Institute 2026 — executive findings](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/dnr-executive-summary) | mobile/social news distribution and verification needs; no clickbait mandate |
| R679-03 | [Google News publisher transparency policy](https://support.google.com/news/publisher-center/answer/6204050) | accurate bylines, publication and publisher identity |
| R679-04 | [Google News article page best practices](https://support.google.com/news/publisher-center/answer/9607104?hl=en) | visible dates; do not artificially freshen |
| R679-05 | [Google generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) | original useful public value vs scaled thin content |
| R679-06 | [Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) | original `datePublished`, substantive `dateModified` and true metadata |
| R679-07 | [AP July 2026 newsroom AI standards](https://www.ap.org/the-definitive-source/announcements/ap-updates-newsroom-standards-for-artificial-intelligence/) | human review/verifiability for editorial output; not a claim that game lore is journalism |
| R679-08 | [NIST Generative AI RMF profile](https://www.nist.gov/itl/ai-risk-management-framework) | assess confabulation, traceability, controls and continuous monitoring |
| R679-09 | [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) | fixed internal-model trust boundary and negative destination tests |
| R679-10 | [OpenTelemetry event conventions](https://opentelemetry.io/docs/specs/semconv/general/events/) | track real transitions not synthetic “success” |
| R679-11 | [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/) | consistent traces/metrics while respecting GenAI content privacy |
| R679-12 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | readable status/live-region, meaningful text and focus |
| R679-13 | [Google Search scaled-content spam](https://developers.google.com/search/docs/essentials/spam-policies) | suppress low-value automated mass article indexing |

References constrain product design; they do **not** establish present Production correctness, Google's approval or legal compliance. Source and document links are rechecked at implementation.
