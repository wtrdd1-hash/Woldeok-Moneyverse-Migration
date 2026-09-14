# Woldeok Moneyverse — World Pulse & Freshness Retention Growth Spec

> Version: v2026.09.14.69
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `SEASON_SYSTEM_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md`, `PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`
> Korean counterpart: [WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.ko.md](WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, infrastructure, scheduler or security-code change.

## 1. Gap selected for this iteration

Moneyverse now has plans for brand promise, contextual acquisition, explicit priorities, notifications, seasons, collection history and retention-safe monetization. The largest remaining consumer gap is **credible liveness**: a visitor or returning member can know what they chose, but may still fail to perceive that the world itself changed in a meaningful way.

If announcements are empty, community activity feels quiet, and the home surface emphasizes static feature shortcuts, even a technically rich service can feel abandoned or finished after one session.

This version defines a consumer-facing freshness loop:

`credible world change → concise World Pulse → relevance to my chosen priority → one safe next action → visible consequence/history → D1/D3 return → weekly recap → season anticipation → durable archive`

Consumer promise:

**“When something genuinely changes in Moneyverse, I can understand it quickly, see why it matters to me, and decide whether to act.”**

This is not a feed-ranking engine, notification scheduler, event schema or backend implementation specification.

## 2. What counts as a real World Pulse item

A pulse item must be based on an actual user-visible change, not invented urgency. Eligible categories include:
- a new or meaningfully changed season/theme;
- a new fictional company/world event with clear game-only framing;
- a new collection, profession, business or space chapter;
- a community/club/city project milestone that is safe to expose;
- a substantial guide, replay, retrospective or educational story;
- a real service change that alters what members can do;
- a completed event result or archive that creates historical continuity.

Do not create pulse entries solely because a timer elapsed. Do not manufacture “breaking” language, fake scarcity, fake activity counts or fake social proof.

## 3. First 30 seconds and first 3 minutes

### First 30 seconds
A first-time visitor should be able to answer:
1. What is Moneyverse?
2. What is happening now that makes the world feel current?
3. What can I safely preview without signing up?
4. What single action could I take next?

Show at most one dominant current-world proof plus one evergreen fallback. Do not lead with wallet balance, loan, casino, WDX profit/loss, an empty announcement state, or a dense feature grid.

### First 3 minutes
Use one `pulse → preview → authored choice` path. Examples:
- season pulse → preview one theme/story → choose one season thread to follow;
- fictional-company pulse → read one event explanation → save/follow that company thread;
- collection pulse → preview one set/lore change → choose a starter or related collection goal;
- community-project pulse → understand the goal and current milestone → opt into a bounded participation path.

The user should receive the promised context before authentication. Signup is for continuity, not access to the withheld answer.

## 4. Lifecycle freshness contract

### D0
Prove that the world is active through one real, understandable change. Avoid a constantly moving feed that obscures first value.

### D1
Return to the member's chosen priority first. If a relevant world change occurred, attach it to that thread: **“what changed since you were here”**. If nothing relevant changed, do not invent one.

### D3
Offer one adjacent development or consequence. The objective is depth, not novelty volume.

### D7
Provide a weekly world recap structured as:
`what changed → what affected my priorities → what I did → what remains interesting next`.
A quiet week may contain fewer items. Completeness and trust beat filler.

### D14
Connect a mature priority to a broader season/world story, collection curation or community project if the user chooses.

### D30
Create a durable personal/world record: a chapter, reflection, season memory, project contribution, replay or archive. The product should show that time in Moneyverse produced history, not only transactions.

### Lapsed/comeback
Use `while you were away` only for material changes. Show a short catch-up and a safe restart action; never imply the user lost value simply because they were absent.

## 5. World Pulse surface hierarchy

A consumer-facing pulse should prioritize:
1. **My chosen thread changed** — strongest relevance.
2. **A major world/season change** — broadly relevant and real.
3. **A community milestone** — only when enough context exists and privacy is safe.
4. **Evergreen discovery** — fallback when no true fresh change exists.

Empty state is acceptable. Preferred copy direction: “No major changes in your saved threads yet. Continue your current goal or explore one new story.”

Do not fill emptiness with fabricated urgency, random casino outcomes, financial-loss nudges or paid placements disguised as world events.

## 6. Session design

### 1–3 minute quick check
- see one meaningful change or a truthful quiet state;
- understand its relevance;
- take or defer one action;
- leave without penalty.

### 5–15 minute meaningful session
- follow one change into a collection, season, profession, company/world, learning or community thread;
- produce a visible progress/history consequence.

### 30+ minute deep session
- investigate multiple connected events, curate an archive, participate in a project, build/collect, or review history;
- do not scale ad load merely because the member stayed longer.

## 7. Acquisition and public content

Freshness can improve acquisition only when the public page is independently valuable.

Index candidates:
- substantial season/event previews and post-event archives;
- original fictional-company/world reports;
- meaningful collection/profession guides tied to current updates;
- editorial community-project retrospectives with safe public data;
- educational explainers that connect a game event to a broader concept without implying real investment advice.

Default noindex/unlisted:
- thin auto-generated event stubs;
- private/member-specific pulse pages;
- referral/coupon-only pages;
- raw activity streams;
- low-trust UGC with little independent value;
- private balances, WDX positions, debt, casino, security, recovery, moderation or report state.

Google's February 5, 2026 Discover core update explicitly emphasized more original, timely, in-depth content and less sensational/clickbait material. The World Pulse should therefore create fewer, stronger public stories rather than high-volume freshness pages.

## 8. Social, viral and community loops

Share **outcomes and stories**, not raw private activity.

Good share candidates:
- “this season changed my collection chapter like this”;
- a before/after space or project result;
- a curated world/fictional-company event explanation;
- a club/city milestone after safe aggregation and participant consent;
- a weekly reflection chosen by the member.

Do not expose private holdings, debt, casino results, hidden social graph, exact security state or private participation without explicit choice.

Raw views, reposts, opens or shares should not earn meaningful WLD/WDX. That would invite bots, multi-accounting and referral fraud.

## 9. LiveOps and season anticipation

World Pulse is the consumer narrative layer for LiveOps, not another reward calendar.

Use the existing D-14/D-7/D-3/D-1 cadence to answer different questions:
- D-14: **Why is this coming season/world change interesting?**
- D-7: **Which existing thread of mine might connect to it?**
- D-3: **What specific new choice will become available?**
- D-1: **What should I remember before it starts?**

After the event, preserve results in an archive or retrospective. Late joiners and comeback users get context and catch-up, not shame or impossible completion pressure.

Supercell's September 2026 Clash Royale update is directional evidence: new cards, a hero, album collection and limited-time modes are communicated together as a coherent monthly “what's new” package. Moneyverse should borrow the clarity and anticipation structure, not its reward economy or FOMO.

Xbox's September 9, 2026 Tokyo Game Show announcement similarly uses a dated upcoming broadcast, hands-on preview and community FanFest to create anticipation before a future content moment. Moneyverse should use advance narrative context without pretending every update is a major event.

## 10. Monetization boundary

Freshness is not an excuse to insert more ads.

Rules:
- the primary current-world proof must not be a disguised sponsor placement;
- sponsored content must be labeled clearly before interaction;
- do not place an interruptive ad between `what changed` and the first meaningful action for a D0/D1 user;
- do not target ads using private WLD/WDX, debt, casino, security or sensitive inferred attributes;
- do not sell paid placement that appears to be an organic world event or official market signal;
- subscriptions/cosmetics may support expression, archive customization or ad removal after repeated value, not access to basic truth about what changed.

FTC's May and June 2026 subscription actions reinforce clear material terms, express informed consent and simple cancellation. A pulse/season campaign must never hide recurring billing behind a “continue the story” CTA.

## 11. Experiment backlog

### A — meaningful World Pulse vs static shortcut home
Hypothesis: one credible current-world proof increases first-value understanding and D1 return without increasing confusion.
Target: anonymous/new visitors.
Control: static feature shortcuts.
Treatment: one editorially bounded current-world proof + one sample CTA.
Primary: time-to-first-value, authored-choice rate, D1 retention.
Guardrails: bounce, finance-like misunderstanding, ad-induced churn, complaint rate.
Minimum observation: D7-mature cohort; D30 before broad expansion.

### B — chosen-thread delta vs generic “what's new”
Hypothesis: a real change attached to a chosen priority improves D3/D7 continuation more than a generic feed.
Primary: exact-thread meaningful action and D7 continuation.
Guardrails: unwanted personalization, hide/mute, privacy complaints.

### C — truthful quiet state vs filler freshness
Hypothesis: admitting no major change preserves trust better than low-value filler.
Primary: D7 trust/satisfaction signal and meaningful action/session.
Guardrails: short-term session length, discovery rate.

### D — weekly narrative recap vs daily generic reminders
Primary: comeback rate, message→meaningful action, D30 permission retention.
Guardrails: unsubscribe/mute, spam report, phishing confusion.

### E — original timely public story vs thin event-page volume
Primary: organic visit→sample→activation→D7 and branded/direct return.
Guardrails: indexed low-value page count, bounce, spam/manual-action signals.
Minimum observation: multiple indexing cycles and D30 cohorts.

## 12. KPI framework

Acquisition/activation:
- qualified public-content visit;
- world-pulse comprehension;
- pulse→preview/sample;
- sample→authored choice;
- contextual signup;
- signup→meaningful activation;
- time-to-first-value.

Retention:
- D1 chosen-thread delta recognition;
- D3 relevant-change continuation;
- D7 weekly-recap meaningful action;
- D14 cross-thread/season continuation;
- D30 durable history/archive creation;
- comeback after material-change message;
- returning-user share and WAU/MAU.

Content quality:
- percentage of pulse items tied to a real user-visible change;
- quiet-state rate;
- stale-item exposure rate;
- unique/original public content rate;
- evergreen fallback engagement;
- user-reported relevance/trust.

Growth/economics:
- organic/creator/share source → D7/D30 retained CAC;
- LTV/CAC;
- retained-user contribution;
- ad revenue per eligible retained user;
- ad-induced churn;
- subscription conversion after repeated value.

Trust/security:
- fake-signup/referral-fraud rate;
- spam/report rate;
- phishing/ATO signal rate;
- privacy complaint rate;
- suspicious reward duplication;
- UGC abuse/removal rate.

## 13. Security, abuse and privacy review

### HIGH — fake “world update” phishing / ATO
Impact: credential or session theft.
Scenario: attacker copies a season/company/update card and links to a lookalike login or “claim” page.
Minimum protection: canonical domain/brand consistency; growth content never asks for passwords, OAuth codes or recovery secrets; external/deep-link flows must land safely and preserve normal authentication boundaries; no asset-loss urgency.
Separate dev/QA: **yes** before new external campaign/deep-link surfaces.

### HIGH — public/private activity leakage
Impact: exposes private economic, social or account state.
Scenario: World Pulse accidentally summarizes WDX holdings/losses, loan state, casino history, private club membership, moderation status, security/recovery state or precise personal information.
Minimum protection: public-safe allowlist; personal pulse private by default; explicit reversible sharing; no secret/session/recovery data in URL/metadata/analytics.
Separate dev/QA: **yes** before personalized public/share surfaces.

### HIGH — finance-like manipulation / market abuse
Impact: users mistake a game event for real financial advice or coordinated actors exploit public narratives to manipulate virtual markets.
Scenario: “breaking company news” is framed as a buy signal, or a coordinated group uses pulse/community content to pump a WDX instrument.
Minimum protection: clear fictional/game-only framing; no guaranteed-return language; no official buy/sell recommendation; moderation/fraud review for coordinated manipulation; no cash-value implication.
Separate dev/QA: **yes** before finance-adjacent personalized/public event promotion.

### HIGH — fake activity / social-proof abuse
Impact: false trust and distorted acquisition/retention decisions.
Scenario: bots or operators inflate participant counts, reactions, project milestones or “trending” status.
Minimum protection: do not make unverified counts the primary proof of liveness; label editorial/official/sponsored status; no meaningful WLD/WDX for views/shares/opens; fraud-adjusted metrics.
Separate dev/QA: **yes** if public rankings/trending/social counts are introduced.

### MEDIUM — UGC harassment, impersonation, doxxing or malicious links
Minimum protection: bounded public inputs at first; report/block/removal path; link safety and clear attribution; do not auto-promote low-trust UGC to public pulse/SEO.
Separate dev/QA: **yes** before open-ended public UGC promotion.

### MEDIUM — tracking/privacy overcollection
Impact: external analytics/ad vendors receive a detailed behavioral/economic profile.
Minimum protection: minimize attribution fields; do not export private economy/security data; separate content relevance measurement from sensitive user state.
Separate dev/QA: **yes** before new ad/personalization SDKs.

## 14. Korea + U.S. policy notes

- Korea: KISA's March 4, 2026 spam guidance warns against ambiguous marketing-consent labels and unnecessary friction for push-ad opt-out. World/season update permission must not silently become commercial-marketing permission.
- Korea privacy: the Personal Information Protection Commission's July 23/27, 2026 TikTok/Apple enforcement emphasized lawful grounds, meaningful consent and transparency for behavioral data and overseas transfers. Private priority/pulse behavior should not automatically flow into ad targeting.
- U.S.: FTC 2026 subscription enforcement supports clear terms, express informed consent and simple cancellation. Story/season CTAs must not obscure recurring charges.
- WLD/WDX remain virtual/simulated/game-only. No public pulse should imply real securities, deposits, cash redemption, gambling winnings or guaranteed returns.

Actual legal applicability must be rechecked at launch for the specific campaign, audience, age handling, advertising and payment flow.

## 15. External research note — 2026-09-14

### Directly adopted
- **Discord, 2026-08-20 — “Introducing New Tools to Power Game Discovery and Social Play.”** Takeaway: discovery is more valuable when it connects to actual downstream gameplay/retention events, not just impressions. Adopted: measure pulse→meaningful action→D7/D30, not pulse views alone.
- **Google Search Central, 2026-02-05 — February 2026 Discover core update.** Takeaway: more original, timely, in-depth content; less sensational/clickbait. Adopted: fewer strong public pulse stories, no mass freshness pages.
- **Google Search Central, current Discover guidance.** Takeaway: avoid clickbait/sensationalism and provide timely, unique, people-first content. Adopted: truthful headlines and quiet states.
- **KISA, 2026-03-04 — illegal-spam prevention guide v7.** Takeaway: marketing consent must be clear and opt-out should not be unnecessarily difficult. Adopted: content-update permission is not blanket ad consent.
- **PIPC, 2026-07-23/27 — TikTok/Apple enforcement.** Takeaway: behavioral-data processing and ad use need lawful basis, transparency and meaningful user choice. Adopted: private pulse/priority behavior is not free ad-targeting data.

### Directional/reference only
- **Supercell, September 2026 Clash Royale “What's New.”** Reference: coherent packaging of new content, collection and limited-time modes. Borrow clarity, not its scarcity/reward mechanics.
- **Xbox, 2026-09-09 Tokyo Game Show announcement.** Reference: advance notice, hands-on preview and community event create anticipation before the content moment.
- **FTC, 2026-05 Shutterstock and 2026-06 Genesis Tech matters.** Reference: recurring-payment terms, informed consent and cancellation remain trust/legal guardrails.

## 16. Runtime Product Reality Audit

Runtime verification status for this pass: **unavailable**.

The canonical Production origin in repository documentation is `https://easy-scraping.com`, but the web verification path did not return the Moneyverse runtime during this pass; direct fetch failed and indexed results were not sufficient to prove the current home/guide/announcement experience. Therefore this document does not claim that World Pulse is implemented or absent in the live runtime.

Repository reality still shows:
- the Living Project Plan defines Moneyverse as a community virtual-economy/game platform and preserves game-only financial boundaries;
- Product Growth Plan expects returning users to find a meaningful action quickly and calls for event calendar/recap/seasonal cadence;
- v2026.09.14.68 gives members explicit priority control;
- latest `main` also contains app-API runtime stabilization and public account/data-deletion sitemap changes, which do not conflict with this consumer-growth proposal.

A later pass should repeat the non-destructive runtime audit when the canonical product pages are verifiably reachable.

## 17. Decision and next priority

Do not add more feed volume yet. Prove one narrow loop:

`one real world/season change → one concise pulse → one chosen priority connection → one meaningful action → D1/D3 recognition → D7 recap → D30 durable history`

Do not expand fake “trending,” public activity counts, high-frequency notifications, mass event SEO pages, WLD/WDX share rewards, finance/profit urgency or additional interruptive ad inventory until this loop improves retention and trust without raising abuse/privacy/phishing signals.
