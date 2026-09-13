# Woldeok Moneyverse — SEO Intent-to-Play Activation Growth Spec

> Version: v2026.09.14.63
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, recent onboarding/content/retention specifications
> Korean counterpart: [SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md](SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or security-code change

## 1. Gap selected

Recent work now covers weekly return content, comeback, social proof, artifact sharing, collection activation, D1/D7 ownership, and D30-D90 reinterpretation. The largest remaining acquisition-to-activation gap is earlier:

**A search or public-content visitor can get information from Moneyverse, but why should that useful answer turn into one meaningful product action instead of a bounce or an immediate generic sign-up wall?**

The selected loop is:

`search/share intent → useful standalone answer → one contextual game preview → one authored low-risk choice → sign up only to save/continue → first meaningful action → D1 continuity → D7 reason to return`

This is an intent-to-play bridge, not a technical SEO project and not a landing-page factory.

## 2. Consumer promise

**“Get the answer you came for first. Then, if it is interesting, try the exact idea inside Moneyverse before deciding whether to join.”**

The page must satisfy the visitor's search intent even if they never register. Conversion is earned by demonstrating relevance, not by withholding the answer.

Do not:
- obscure the answer behind authentication;
- route every organic visitor to a generic home/dashboard;
- present bank, loan, stocks, casino, jobs, shop and community simultaneously;
- manufacture hundreds of thin pages around keyword variants;
- use finance-like promises such as guaranteed profit, safe yield, undervalued winner or loss recovery;
- use fake urgency or “join now or miss value” language;
- count an ad click, login, wallet open or page depth as activation.

## 3. Search-intent clusters

Prioritize a small number of durable clusters with genuine standalone value.

### A. Beginner learning
Examples: virtual economy basics, diversification as a game concept, supply/demand, compounding as a concept, risk/reward, fictional business operations.
Bridge: a 30-90 second sandbox choice or educational replay.

### B. Fictional company / world lore
Examples: why a fictional company changed, sector relationships, a season/world event and its consequences.
Bridge: follow one company/theme, compare two fictional outcomes, or save one world thread.

### C. Collection / identity
Examples: collection themes, season archive, museum/exhibit story, completion or curation ideas.
Bridge: choose a starter theme, favorite piece or display intention.

### D. Jobs / progression
Examples: profession identity, mastery paths, beginner explanations of a role.
Bridge: choose a profession intention or preview one representative task without granting spendable value pre-auth.

### E. Season / event archive
Examples: what changed, why it mattered, what remains after the season.
Bridge: select one thread to follow or one catch-up path.

Avoid building public search acquisition around private account pages, balances, holdings, debt, casino history, security/recovery status, moderation state, referral claims or thin personal recap pages.

## 4. First 30 seconds

A qualified organic visitor should understand:
1. the answer to the search intent;
2. why Moneyverse has firsthand/original context for the topic;
3. that WLD/WDX and related economy features are virtual/game-only;
4. one optional thing they can try next without needing to understand the whole product.

Recommended information order:
`answer → evidence/context → one interactive or narrative preview → contextual CTA`.

Do not lead with a full feature matrix or monetization inventory.

## 5. First 3 minutes

A visitor should be able to complete exactly one low-risk preview aligned with the page they entered from.

Examples:
- learning page → choose between two simulated decisions and see the trade-off explanation;
- fictional-company page → follow one company/thread and view one past cause/effect example;
- collection page → choose a starter theme or favorite exhibit direction;
- profession page → choose a role intention and inspect one representative task;
- season archive → choose one unresolved/current thread to continue.

The preview should create a small authored state but no spendable WLD/WDX, tradable asset, loan, casino entitlement or competitive advantage before authentication.

## 6. Why sign up

The sign-up CTA should preserve continuity from the exact intent that brought the user in.

Preferred pattern:
- “Save this company thread and continue it.”
- “Keep this collection theme and start your first chapter.”
- “Save this profession path.”
- “Continue this learning replay from your choice.”

Avoid a context-destroying generic “Create account to use Moneyverse” wall unless required by safety/legal boundaries.

Authentication success alone is not activation.

## 7. First meaningful action

Qualifying activation examples:
- save one fictional-company/world thread and set a next question;
- select a starter collection theme and first noncompetitive piece/goal;
- select a profession intention and first guided task goal;
- complete an educational replay and record a learning choice;
- choose one season thread and set a next-step goal.

Non-activation examples:
- OAuth success;
- terms acceptance;
- wallet open;
- WLD balance view;
- ad click;
- generic page view;
- referral code submission by itself.

## 8. D1-D30 continuity for organic cohorts

### D1
Show the exact topic or choice that caused activation. Goal: “Moneyverse remembered what I cared about.”

### D3
Offer one adjacent deepening action, not the entire feature catalog.

### D7
Resolve or advance the original topic: a company/world change, collection progress, profession step, season update or learning reflection.

### D14
Connect the original intent to one broader identity or season arc.

### D30
The user should have a durable record: saved thread, collection chapter, profession path, learning journal/replay history or season memory.

Measure organic cohorts by intent cluster because “beginner explanation” traffic and “season archive” traffic should not be expected to behave identically.

## 9. Content-to-product funnel

Primary funnel:

`qualified impression → organic click → intent satisfied → contextual preview → authored choice → contextual signup → meaningful activation → D1 → D7 → D30 → LTV / retention-adjusted contribution`

Required diagnostic splits:
- Google vs Naver vs direct/share;
- query/intent cluster;
- new vs returning visitor;
- mobile vs desktop;
- content type;
- preview used vs not used;
- signup after preview vs auth-first;
- minor/age-sensitive cohorts only where lawful and safely measurable.

Do not optimize impressions or CTR while downstream activation and retention decline.

## 10. KPI additions

### Acquisition quality
- qualified organic landing sessions;
- engaged answer completion / useful-depth proxy;
- organic visit → contextual-preview rate;
- preview → authored-choice rate;
- visitor → contextual-signup rate;
- organic signup → meaningful-activation rate;
- fraud-adjusted CAC where paid amplification is used.

### Activation / retention
- content-assisted time-to-first-value;
- intent-preservation rate through authentication;
- D1 exact-intent recognition;
- D3 adjacent continuation;
- D7 original-thread continuation/resolution;
- D30 durable-record rate;
- organic-cohort D1/D3/D7/D14/D30;
- organic LTV and retention-adjusted contribution.

### SEO quality
- index coverage only for approved public-value pages;
- query/page intent match;
- branded/direct return after organic acquisition;
- thin/duplicate page ratio;
- manual-action/spam warning incidence;
- organic landing → activation → D7/D30, not rankings alone.

### Trust guardrails
- fake signup/bot rate;
- referral fraud rate;
- spam/UGC report rate;
- phishing/ATO signal rate;
- privacy complaint rate;
- public/private leakage;
- finance-like claim complaint rate;
- accidental ad-click rate;
- ad-induced bounce/churn;
- youth/privacy complaints.

## 11. Experiment backlog

### A. Answer-first vs auth-first
Hypothesis: satisfying the search intent before asking for authentication improves activation quality and D7.
Target: qualified new organic visitors.
Control: auth wall before meaningful preview.
Treatment: complete useful answer plus one contextual preview before auth.
Primary: signup → meaningful activation and D7.
Guardrails: abuse, data leakage, page performance, support confusion.
Minimum observation: at least one matured D7 cohort; confirm with D30 where sample permits.
Next: keep answer-first only if downstream quality improves, not merely signup volume.

### B. Contextual CTA vs generic signup CTA
Hypothesis: preserving the entry intent through auth reduces abandonment and time-to-first-value.
Control: generic “Join Moneyverse.”
Treatment: CTA naming the saved thread/theme/path.
Primary: intent-preservation and activation.
Guardrails: deceptive wording, auth confusion, phishing-like presentation.
Observation: D7 cohort.

### C. One preview vs feature grid
Hypothesis: one intent-matched preview outperforms exposing the full economy.
Control: wallet/jobs/stocks/shop/casino/quest feature grid.
Treatment: one relevant preview and one next action.
Primary: first-session completion and meaningful activation.
Guardrails: exploration satisfaction, bounce, hidden-feature complaints.
Observation: first-session plus D7.

### D. Original explanatory page vs scaled template pages
Hypothesis: fewer substantial pages produce higher activation and safer search performance than many template variants.
Control: broader templated publishing set where existing.
Treatment: consolidated substantial intent page with original context and clear next action.
Primary: organic → activation → D30 and branded return.
Guardrails: index loss, duplicate/thin ratio, spam signals.
Observation: several indexing cycles plus D30 cohort; do not infer from rank volatility alone.

### E. Value-before-ad vs early ad
Hypothesis: protecting answer → preview → first authored choice from interruptive monetization increases retention-adjusted contribution.
Control: reviewed ad placement before the preview/answer is complete.
Treatment: monetization after promised value is delivered.
Primary: D7/D30 plus contribution margin.
Guardrails: ad-induced bounce/churn, accidental click, CWV, revenue concentration.
Observation: sufficient ad volume plus matured D30 cohort.

## 12. Google/Naver policy alignment

Google Search Central currently emphasizes helpful, reliable, people-first content and warns against search-engine-first mass production. Its August 28, 2026 site-reputation update continues to address third-party content published to exploit host ranking signals. Google also recommends abuse controls for public UGC, including report paths, spam-account detection and `noindex` for new/untrusted content where appropriate.

Naver Search Advisor currently emphasizes user-helpful content, accurate unique titles/descriptions and warns against bait content, scraping and low-quality mass generation, including templated/automated pages that add little value.

Direct adoption:
- create pages because a real visitor would value them even without search traffic;
- consolidate overlapping intents rather than create keyword-doorway variants;
- use accurate unique title/description per substantial page;
- public UGC indexing only after trust/value thresholds;
- maintain clear public/private index boundaries.

Not adopted:
- page-count targets;
- automated keyword expansion as a growth KPI;
- third-party sponsored/creator pages created primarily to borrow Moneyverse domain authority.

## 13. Product-discovery references

Discord’s August 20, 2026 game-discovery update explicitly connects discovery/ad products to gameplay events that drive retention. Direction adopted: evaluate discovery by downstream meaningful action and retention, not exposure alone. Do not import Discord’s advertising mechanics or reward economics into Moneyverse by default.

Discord Official (March 12, 2026) also reinforces that verified official identity and trusted links matter when discovery leads users from profiles/invites into a game/community. Adopt consistent official-domain/brand signals for Moneyverse public content and shared entry points.

Spotify’s 2026 editorial/discovery examples remain directional evidence that context and curation can improve saves/engagement; Moneyverse should not use Spotify performance numbers as forecasts.

## 14. Monetization

Monetization should follow the promised value:
1. answer the query;
2. deliver the preview;
3. let the user make the first meaningful choice;
4. only then consider reviewed display/native ads, non-P2W cosmetics or later ad-free subscription.

Never make an advertisement resemble a buy/sell/borrow/repay action or the primary gameplay CTA.

For subscriptions, current U.S. enforcement continues to emphasize clear material terms, express informed consent and straightforward cancellation. Archive/history/privacy retention must not be held hostage to a subscription.

## 15. Security, privacy and abuse review

### High — public/private data boundary leakage
User impact: targeted scams, stalking, embarrassment and account attacks.
Scenario: SEO/share page accidentally exposes WLD/WDX balance/holdings, debt, private social relationships, account age, security/recovery or moderation state.
Minimum protection: public-safe allowlist; private-by-default personalized state; no secrets/session/recovery values in URL, metadata, analytics or share payloads; explicit publication consent where applicable.
Separate development/QA: yes before any personalized public landing or public user archive.

### High — SEO/UGC spam and malicious-link abuse
User impact: phishing/malware exposure and degraded search trust.
Scenario: bots create pages/comments/profiles solely for backlinks, spam or malicious redirects.
Minimum protection: no raw signup/post/view WLD/WDX reward; report/removal path; trust threshold before indexing; safe outbound-link policy; noindex/unlisted for low-trust/thin content.
Separate development/trust QA: yes before broad public UGC indexing.

### High — official-content impersonation / phishing / ATO
User impact: credential theft and account takeover.
Scenario: fake guide, season page or “continue your saved thread” message leads to a lookalike login.
Minimum protection: consistent official domain/brand; no credentials/OAuth code collection inside content; no sensitive values in notification copy; avoid urgent asset-loss language.
Separate security QA: yes before external email/push/deep-link campaigns.

### High — referral/fake-signup manipulation
User impact: polluted acquisition metrics and economy abuse.
Scenario: bots/multiple accounts create search/referral conversions to earn benefits or manufacture traction.
Minimum protection: raw visit/click/signup has no meaningful economic reward; fraud-adjusted funnel metrics; milestone rewards only after verified downstream participation if ever introduced.
Separate fraud QA: yes before material referral rewards.

### Medium — tracking/privacy overcollection
Search intent plus product behavior can reveal interests. Do not send sensitive/private economy or account fields to ad/analytics vendors merely to improve attribution. Minors and age-sensitive users require conservative tracking/ad personalization and current Korea/U.S. legal review before expansion.

## 16. Legal / wording cautions

- WLD/WDX remain virtual/simulated/game-only; no real investment, deposit, security, cash-redemption or guaranteed-return implication.
- Beginner finance education must be framed as game/simulation education where linked to Moneyverse mechanics, not personalized real financial advice.
- Sponsored/creator content requires clear disclosure where a material relationship exists.
- Public user artifacts require publication control and removal paths.
- New behavioral advertising, youth-facing discovery, public UGC indexing or material referral rewards require launch-time Korea/U.S. legal/privacy/trust review.
- U.S. subscription/negative-option policy remains active; current FTC enforcement supports clear terms, informed consent and simple cancellation.

## 17. Runtime Product Reality Audit — 2026-09-14

Public runtime was reachable.

Observed:
- home clearly states WLD/rewards are game-only virtual data;
- the home foregrounds wallet, games, exchange, shop and quests, with multiple sponsored-ad placements;
- monthly public news is still in preparation and the lobby can look quiet;
- `/announcements` has no published announcement but already contains an advertisement placement;
- `/guide` is substantial but heavily foregrounds deposits, bonds, loans, stock gains/dividends, businesses, casino and an asset-growth roadmap;
- the guide’s quick start begins with login and wallet state rather than a search-intent-specific pre-auth product preview.

Therefore the proposed `useful answer → one contextual preview → authored choice → contextual signup → meaningful action` path is not currently verified as an implemented runtime experience.

## 18. Research note — 2026-09-14

### Directly adopted
- Google Search Central, Helpful/Reliable/People-First Content, verified 2026-09-14: useful standalone content and search-intent satisfaction.
- Google Search Central, Site Reputation Policy update, 2026-08-28: do not use third-party pages to exploit host ranking signals.
- Google Search Central, Prevent User-Generated Spam, verified 2026-09-14: reporting, spam detection, trust-based indexing/noindex options.
- Naver Search Advisor, SEO Basic Guide and Web Content Spam Examples, verified 2026-09-14: unique accurate titles/descriptions; user-helpful content; no bait or low-value mass generation.
- Discord, New Tools to Power Game Discovery and Social Play, 2026-08-20: discovery should connect to gameplay actions relevant to retention.
- Discord Official, 2026-03-12: trusted official identity/links in discovery flows.
- FTC Shutterstock settlement, 2026-05: clear subscription terms, express informed consent and simple cancellation.

### Directional / reference only
- Spotify, editor-led New Music Friday video, 2026-06-12: explanatory context can deepen discovery engagement; platform-specific performance is not a Moneyverse forecast.
- FTC Negative Option ANPRM, 2026-03: re-review trigger because U.S. negative-option rules remain active.

## 19. Next priority

Prove one narrow acquisition-to-retention loop before expanding page count:

`one substantial intent page → one contextual preview → one authored choice → contextual signup → meaningful activation → D1 exact-intent recognition → D7 continuation`.

Do not prioritize mass SEO page generation, keyword doorway variants, raw-signup referral rewards, public personalized finance/status pages, additional interruptive ad inventory or behavioral-ad targeting from search intent before this loop is validated.