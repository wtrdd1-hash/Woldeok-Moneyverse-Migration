# 2026-09-14 — Product planning worklog v2026.09.14.63

## Scope
Documentation-only consumer growth planning. No runtime, database, API, authentication, infrastructure, migration, scheduler or security-code changes.

## Starting state
- Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- Start-of-pass `main`: `b33a7843c05964eebff11b11c9236f404e1885ae`
- Mid-work `main` recheck: unchanged at `b33a7843c05964eebff11b11c9236f404e1885ae`
- Direct-main documentation policy used; no documentation PR.

## Inputs reviewed
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/COLLECTION_ARCHIVE_TO_SEASON_REINTERPRETATION_GROWTH_SPEC.md`
- recent growth-planning commits through v2026.09.14.62
- public runtime home, `/guide`, `/announcements`
- current Google Search Central, Naver Search Advisor, Discord discovery/trust, Spotify editorial discovery and FTC subscription references.

## Largest growth gap selected
Recent work deeply specifies collection/share/retention loops through D90. The relatively under-specified gap is the earlier handoff from useful public discovery to product activation:

`Why does a Google/Naver/share visitor who gets an answer from Moneyverse continue into one meaningful product action rather than bounce or hit a generic auth wall?`

Selected answer:
`intent satisfaction → one contextual preview → one authored choice → contextual signup → meaningful activation → D1 exact-intent recognition → D7 continuation`.

## Runtime Product Reality Audit
Public runtime reachable on 2026-09-14.

Observed:
- home clearly labels WLD/rewards as game-only virtual data;
- home foregrounds wallet, games, exchange, shop, quests and several sponsored-advertisement placements;
- monthly public news remains in preparation and lobby can appear quiet;
- `/announcements` has no published announcement but contains an ad placement;
- `/guide` is substantial but foregrounds deposits, bonds, loans, stock gains/dividends, business and casino;
- guide quick-start begins with login and wallet state rather than a search-intent-specific pre-auth preview.

No implemented `useful answer → contextual preview → authored choice → contextual signup → meaningful activation` path was verified.

## Research performed
Research date: 2026-09-14.

### Directly adopted
1. Google Search Central — Helpful, Reliable, People-First Content, verified 2026-09-14.
   - Implication: content should satisfy visitors and provide original/substantial value rather than exist primarily for search traffic.
   - Adopted: answer-first pages and fewer substantial intent pages.
2. Google Search Central — Site Reputation Policy update, 2026-08-28.
   - Adopted: do not create third-party/sponsored SEO inventory that borrows Moneyverse ranking signals.
3. Google Search Central — Prevent User-Generated Spam, verified 2026-09-14.
   - Adopted: abuse policy/reporting, spam-account detection and trust/noindex boundaries for public UGC.
4. Naver Search Advisor — SEO Basic Guide and Web Content Spam Examples, verified 2026-09-14.
   - Adopted: accurate unique titles/descriptions, user-helpful content, no bait/scraping/low-value mass templates.
5. Discord — New Tools to Power Game Discovery and Social Play, 2026-08-20.
   - Adopted: evaluate discovery by downstream meaningful gameplay/retention, not exposure alone.
6. Discord Official, 2026-03-12.
   - Adopted: trusted official-domain/profile signals for discovery and shared entry points.
7. FTC Shutterstock settlement, 2026-05.
   - Adopted: clear subscription terms, express informed consent, simple cancellation.

### Directional/reference only
1. Spotify — New Music Friday editor-led video, 2026-06-12.
   - Reference: explanatory/editorial context can deepen discovery engagement; platform-specific performance is not a Moneyverse forecast.
2. FTC Negative Option ANPRM, 2026-03.
   - Reference: U.S. negative-option policy remains active and should be rechecked at launch.

## Planning decisions
- Defined five initial intent clusters: beginner learning, fictional company/world, collection/identity, profession/progression and season/event archive.
- Required answer-first value before auth.
- Required one contextual pre-auth preview rather than the whole product grid.
- Preserved entry intent through signup and D1/D7 continuation.
- Explicitly excluded login, wallet view and ad click from activation.
- Added organic-intent cohort KPI from click through D30/LTV.
- Kept private/economy/security pages out of search acquisition.
- Added page-quality policy against scaled templates/doorways.
- Put monetization after answer/preview/first authored choice.

## Security / privacy / abuse findings
### High — public/private data leakage
Minimum condition: public-safe allowlist, personalized state private by default, no secret/session/recovery values in URL/metadata/analytics/share payloads.
Separate QA required before personalized public landing pages.

### High — SEO/UGC spam and malicious links
Minimum condition: no raw-post/signup/view economic rewards, report/remove flow, indexing trust threshold, safe outbound-link policy, low-trust/thin content noindex/unlisted.
Separate trust/security QA required before broad public UGC indexing.

### High — official-content impersonation/phishing/ATO
Minimum condition: official-domain consistency, no credential/OAuth-code requests inside content, no sensitive account data in notification copy, no asset-loss urgency.
Separate QA required before external push/email/deep links.

### High — fake signup/referral manipulation
Minimum condition: no meaningful WLD/WDX reward for raw visit/click/signup; fraud-adjusted metrics; downstream milestone eligibility if referral value is later introduced.
Separate fraud QA required before material referral rewards.

### Medium — tracking/privacy overcollection
Do not export sensitive/private economy/account fields to analytics/ad vendors to improve attribution. Youth-facing personalization/tracking requires current Korea/U.S. review.

## Experiment backlog added
- answer-first vs auth-first;
- contextual signup CTA vs generic signup;
- one preview vs feature grid;
- substantial original page vs scaled templates;
- value-before-ad vs early ad.

Each experiment includes hypothesis, cohort, entry point, control/treatment, primary metric, guardrails, minimum observation and follow-up action in the canonical spec.

## KPI additions
- qualified organic sessions;
- organic → contextual preview → authored choice;
- contextual signup and signup → meaningful activation;
- content-assisted time-to-first-value;
- intent preservation through auth;
- D1 exact-intent recognition;
- D3 adjacent continuation;
- D7 original-thread continuation/resolution;
- D30 durable-record rate;
- intent-cluster retention and LTV;
- thin/duplicate page ratio, spam signals and trust guardrails.

## Files added
- `docs/planning/SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md`
- `docs/planning/SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-seo-intent-to-play-activation-v2026.09.14.63.md`
- `docs/changelog/2026-09-14-seo-intent-to-play-activation-v2026.09.14.63.ko.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.63.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.63.ko.md`

## Validation / deployment
- Documentation-only: no Test/Production application deployment required for this change itself.
- Runtime verification was available and performed non-destructively.
- No security code was changed.
- Git history remains rollback mechanism.

## Next priority
Prove one narrow search-to-retention loop before scaling content inventory:

`one substantial intent page → one contextual preview → one authored choice → contextual signup → meaningful activation → D1 exact-intent recognition → D7 continuation`.

Do not prioritize mass SEO pages, doorway keyword variants, raw-signup referral rewards, public personalized finance/status pages, search-intent behavioral ads or additional interruptive ad inventory before this loop is validated.