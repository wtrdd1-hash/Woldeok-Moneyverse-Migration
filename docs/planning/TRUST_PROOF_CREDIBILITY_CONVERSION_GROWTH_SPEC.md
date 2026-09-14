# Woldeok Moneyverse — Trust Proof & Credibility Conversion Growth Spec

> Version: v2026.09.14.88
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`
> Korean counterpart: [TRUST_PROOF_CREDIBILITY_CONVERSION_GROWTH_SPEC.ko.md](TRUST_PROOF_CREDIBILITY_CONVERSION_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code changes.

## 1. Gap selected this run

The current brand promise is clearer than before, but the next acquisition/activation gap is **proof**: a first-time visitor can be told that Moneyverse is a persistent, game-only community economy, yet still need credible reasons to believe the service is legitimate, safe, transparent and worth creating an account for.

This matters more than usual because Moneyverse visibly combines virtual currency, stocks, deposits/bonds/loans, casino-like games, community surfaces and advertising. Even when every mechanic is fictional, these categories are commonly imitated by scams and phishing campaigns. Trust therefore cannot be delegated to a footer policy or a single `game-only` sentence.

Runtime verification on 2026-09-14 found several real trust assets:
- the home repeatedly states that WLD and rewards are game-only and not redeemable for cash;
- the privacy policy explains categories, purposes, retention periods and advertising treatment in concrete terms;
- the service-status page explicitly says it will not guess and will show only collected records.

But the same runtime also shows a proof gap:
- service status currently has no confirmed records and shows monitored systems as `checking`;
- public announcements currently contain no published notice while sponsored inventory is visible;
- the getting-started guide heavily foregrounds compound deposits, bonds, loans, dividends, price appreciation, passive income and a `capitalist` wealth ladder even though the product is game-only;
- public content does not yet provide a consistent consumer-facing provenance contract for who authored/reviewed finance-like educational explanations and when they were reviewed.

Selected loop:

`qualified discovery → clear promise → credible proof stack → safe public sample → authored interest → contextual signup → meaningful action → D1 proof kept → D7 earned trust → D30 durable relationship/share`

This is a consumer trust, content and conversion specification. It does not define new security architecture or implementation contracts.

## 2. Trust is a conversion prerequisite, not a compliance footer

Moneyverse should make trust understandable before asking for an account.

A new visitor should be able to answer:
1. **Is this real as a service?** There is a maintained product, identifiable operational history and truthful status communication.
2. **Is the economy fictional?** WLD/WDX, stocks, bank, loans, casino and rewards are game-only and do not promise cash redemption or financial returns.
3. **What happens to my data?** The service explains what it collects, why, for how long and where advertising is allowed.
4. **Can I verify claims?** Product changes, status, rules and important content have visible provenance rather than unverifiable marketing claims.
5. **Is social proof genuine?** Activity, reviews, user counts, creator endorsements and testimonials are not fabricated, inflated or selectively presented as independent proof.
6. **Can I leave or decline?** Signup, notifications, marketing and future paid plans do not depend on coercive urgency or hidden consequences.

Trust proof should reduce uncertainty while avoiding the opposite failure: exposing sensitive security internals, private incidents, admin identities, private user state or exploitable operational detail.

## 3. Public trust-proof stack

Use a layered proof model. Not every layer must be shown in the first viewport, but a first-time visitor should encounter enough proof to distinguish Moneyverse from a fake investment page, reward farm or anonymous portal.

### Layer A — category and ownership clarity
- consistent Moneyverse name, domain and visual identity;
- plain-language description of the product;
- game-only/simulated disclosure next to finance-like mechanics, not only in a footer;
- no implication of a regulated bank, broker, deposit product, investment advisory service or cash gambling product.

### Layer B — operational continuity
- reviewed announcements/change history where there is something real to announce;
- honest service status that distinguishes `healthy`, `degraded`, `checking` and `no verified record` rather than inventing availability;
- dates on material policy/product documents;
- no fake `live`, `trending`, `active now` or uptime claims when evidence is unavailable.

### Layer C — privacy and safety clarity
- short plain-language privacy summary linked to the full policy;
- explain that private economy/account/security state is not public content;
- explain ad boundaries without implying that private balances, trades, debt or casino history are ad-targeting inputs;
- expose report/block/community rules before requiring social participation where practical.

### Layer D — content provenance
Finance-like or educational pages should make the following understandable where relevant:
- who produced or reviewed the content;
- when it was last materially reviewed;
- whether it describes game rules, product guidance, editorial interpretation or community opinion;
- the source/provenance of external factual references;
- whether automation/AI materially assisted content when users would reasonably expect disclosure.

Do not create fake experts, fake reviewers or vague authority labels such as `verified financial expert` without a truthful basis.

### Layer E — authentic social proof
Only display counts, reviews, testimonials, creator endorsements, user activity or community outcomes when they are genuine and presented with enough context to avoid deception.

Never manufacture:
- fake player counts;
- fake comments or reviews;
- fake `someone just earned` messages;
- fake scarcity or popularity;
- bot-generated followers/views used as commercial credibility;
- company-controlled content presented as independent review.

When there is no meaningful public social proof, show product proof instead: a real archive, rule explanation, collection/project example, reviewed announcement or transparent quiet state.

## 4. First 30 seconds: promise plus one reason to believe

The brand promise should not stand alone.

Recommended first-visit information order:
1. what Moneyverse is;
2. what the visitor can do/build/collect/follow;
3. one reason to believe the service is transparent or persistent;
4. one public-safe sample;
5. game-only boundary where relevant;
6. one next action.

The `reason to believe` should be factual and verifiable, for example:
- a real reviewed season/project archive;
- a dated public change note;
- a real rules explanation;
- a transparent `no verified status yet` state rather than fabricated uptime;
- a public-safe example showing that an action can become a durable record.

Do not use large user-count, profit, uptime, reward or growth claims without a defensible source and measurement definition.

## 5. First 3 minutes and signup

The user should experience **proof before credential commitment** where possible.

Example flow:
`promise → real sample → provenance/context → authored interest → signup only when preservation/personalization is useful`

A user who reads a fictional-company event should understand that the issuer and market are simulated before signup. A user who views a profession path should see what persists. A user who sees a community artifact should know what is public and what requires an account.

Signup copy should not use trust-breaking pressure such as:
- `verify now or lose your WLD`;
- `your profit is waiting`;
- `your portfolio is at risk`;
- fake countdowns;
- false limited access;
- fake security warnings.

Authentication and consent remain existing security boundaries. This growth plan must not weaken account-linking, session, CSRF, RBAC, ledger or privacy controls to reduce signup friction.

## 6. D1/D3/D7/D14/D30 trust ladder

### D1 — prove memory and consistency
Return the user to the thread they chose. The wording and game-only boundary should remain consistent with acquisition copy.

### D3 — prove that records are real
Show one actual change, result, unchanged state or persisted record. Do not invent activity to make the world feel busy.

### D7 — prove operational reliability
A retained user should have encountered a coherent combination of product history, rule clarity, accurate status/changes and predictable privacy boundaries. Trust should come from repeated consistency, not a one-time badge.

### D14 — prove user control
The user can defer, hide, leave, change preferences and avoid unwanted social/marketing pressure without losing ordinary progress.

### D30 — turn trust into durable relationship
The user should have at least one durable history/artifact and a believable understanding of how the service operates. Sharing should be voluntary and public-safe, not required to unlock trust or rewards.

## 7. Acquisition and SEO

Trust-oriented acquisition should prefer qualified intent over maximum traffic.

### SEO
Prioritize pages with clear authorship/provenance where expected, original explanation and stable value:
- beginner guides to the simulated economy;
- fictional company/world profiles with explicit fiction/game context;
- profession/collection guides;
- season/event archives;
- glossary and educational simulation explainers;
- reviewed community/project retrospectives.

Do not scale anonymous thin finance pages, fake comparison/review pages, auto-generated testimonials or pages designed to look like independent investment research.

Google's current people-first guidance states that trust is the most important aspect of E-E-A-T and explicitly asks publishers to make `Who`, `How` and `Why` understandable where relevant. Because finance-like topics can affect financial stability, Moneyverse should be especially conservative about authorship, sources and simulated-product framing.

Naver's current Search Advisor emphasizes access to authoritative/useful information and continued suppression of poor-feedback/spam content. This supports a smaller set of credible, maintained pages rather than mass-generated finance-intent pages.

### Paid/creator acquisition
- disclose material creator/sponsor relationships;
- do not buy or incentivize positive sentiment;
- do not use creator popularity as proof that WLD/WDX has real value;
- measure `trust-qualified activation → D7/D30` rather than clicks or raw signups.

## 8. Social and viral trust loop

Preferred loop:

`real result → public-safe artifact → provenance/context → recipient understands without login → optional sample → authored interest → meaningful activation → D7`

A share object should make clear:
- what it represents;
- whether values are simulated/game-only;
- whether it is user-created, system-generated or sponsored;
- what private information is intentionally excluded.

Do not expose balances, exact holdings, debt, casino history, private club membership, moderation state, security state, email, internal IDs, sessions or recovery information.

## 9. Monetization trust contract

Monetization should not occupy the space where trust is still being established.

Protected early sequence:
`promise → proof → sample → understood next action`

Avoid interruptive monetization inside this sequence. After repeated value, allowed models remain:
- clearly labeled advertising on approved public-content surfaces;
- ad-removal subscription;
- non-P2W profile/space/exhibit/season cosmetics;
- disclosed sponsorship/creator collaboration;
- B2B2C arrangements that do not redefine WLD/WDX as real financial value.

Future subscriptions require clear material terms, express informed consent and straightforward cancellation. FTC 2026 enforcement against deceptive subscription flows reinforces this existing guardrail.

## 10. KPI framework additions

Maintain existing acquisition/activation/retention/revenue metrics and add:

### Trust comprehension
- first-visit `what is Moneyverse?` comprehension;
- game-only boundary comprehension;
- scam/real-finance misunderstanding rate;
- privacy-boundary comprehension;
- public-proof interaction rate;
- content provenance recognition where shown.

### Conversion quality
- proof-view → authored-interest rate;
- proof-view → contextual signup rate;
- signup → meaningful activation after proof exposure;
- time-to-first-trusted-value;
- D1 promise/proof consistency;
- D7 retained users by trust-proof exposure;
- D30 durable relationship/history by acquisition proof source.

### Trust guardrails
- phishing/ATO signal rate;
- fake-signup/referral-fraud rate;
- spam/report rate;
- privacy complaint rate;
- misleading-finance complaint rate;
- ad-induced churn;
- suspicious reward duplication;
- fake/incentivized review or social-proof incidents;
- support contacts indicating `is this real/a scam?` confusion.

Do not optimize `trust badge clicks`, policy-page views or time-on-policy-page as primary success metrics.

## 11. Experiment backlog

### A — promise only vs promise + one verifiable proof
Hypothesis: one factual reason-to-believe improves meaningful activation and D7 without increasing first-screen complexity.
Target: new anonymous visitors.
Control: promise + CTA.
Treatment: promise + one verifiable proof + sample + CTA.
Primary: meaningful activation and D7 retention.
Guardrails: TTFV, bounce, misunderstanding, privacy/security complaints.
Observation: at least one mature D7 cohort; D30 before broad standardization.

### B — generic guide vs provenance-aware finance-like guide
Hypothesis: explicit game-rule context, review date and source/provenance reduce real-finance misunderstanding without lowering qualified engagement.
Primary: comprehension and meaningful activation.
Guardrails: bounce, false-authority perception, SEO quality.

### C — authentic quiet state vs fabricated social proof
Control: honest empty/quiet state.
Treatment candidate: only real, verified activity proof when available.
Rule: fake proof is not an experiment arm and is prohibited.
Primary: D7 retained activation when real proof exists.
Guardrails: spam, bot activity, privacy complaints, fake-review/social-proof incidents.

### D — concise privacy/safety proof vs policy-link only
Hypothesis: a short factual summary before signup improves trust without creating consent fatigue.
Primary: contextual signup → activation.
Guardrails: policy misunderstanding, consent error, TTFV.

### E — sponsor before proof vs sponsor after proof
Hypothesis: delaying sponsor prominence until after product/trust comprehension improves retained contribution despite fewer early impressions.
Primary: D30 retained contribution.
Guardrails: ad-induced churn, accidental-click signal, eligible-user revenue.

## 12. Security, abuse and privacy review

### HIGH — phishing through fake trust/security notices
Scenario: attackers imitate `verified Moneyverse`, `account safety check`, `status incident`, `WLD protection` or `portfolio verification` messages to steal credentials.
User impact: account takeover, fraud, loss of trust.
Minimum protection: canonical domain/brand consistency; growth/status messages never request passwords, OAuth codes or recovery codes; no secrets/session/recovery data in URLs.
Separate development/QA: required for new email/push/deep-link trust campaigns.

### HIGH — fabricated reviews/social proof/creator credibility
Scenario: bots, employees, paid reviewers or synthetic personas inflate reviews, player counts, views or endorsements.
User impact: deceptive acquisition, regulatory/trust risk, bot incentive loops.
Minimum protection: no fake counts/reviews; disclose material connections; do not condition incentives on positive sentiment; separate system/community/sponsored content.
Separate QA: required before public review/testimonial/rating systems or creator reward expansion.

### HIGH — sensitive operational/security leakage through transparency
Scenario: an over-detailed status, incident, changelog or trust page reveals internal topology, admin identities, exploitable weaknesses, private user data or active defense details.
User impact: targeted attacks, privacy loss, operational harm.
Minimum protection: public-safe disclosure scope; aggregate/redact sensitive details; preserve existing incident/security access controls.
Separate security review: required for new public incident/security transparency surfaces.

### HIGH — finance-like credibility misuse
Scenario: `audited`, `safe`, `verified`, `stable`, `guaranteed` or similar trust language is interpreted as financial safety or return assurance.
User impact: financial-service misunderstanding, harmful decision-making, legal risk.
Minimum protection: trust claims must describe the service/process precisely; no cash-value, principal, yield or investment-safety implication; keep WLD/WDX game-only language adjacent to finance-like content.
Separate legal/product review: required for finance-adjacent paid/creator campaigns.

### MEDIUM — trust analytics overcollection
Scenario: proving `trust` becomes justification for joining policy/status behavior with private economy/social/security history for profiling.
Minimum protection: data minimization, purpose limitation, retention limits, no unrestricted export of sensitive state, consent/legal basis where applicable.

## 13. Legal and policy notes

- WLD/WDX and all finance-like mechanics remain virtual/simulated/game-only.
- FTC's Consumer Reviews and Testimonials Rule, effective 2024-10-21, prohibits several forms of fake/false reviews, sentiment-conditioned incentives, undisclosed insider reviews and fake social-media influence indicators; 2025 enforcement warnings show the rule remains actively relevant.
- Creator/sponsor material connections must be disclosed clearly and endorsements must be truthful/non-misleading.
- FTC 2026 subscription enforcement reinforces clear material terms, informed consent and simple cancellation for any future paid plan.
- Youth/community expansion should preserve age-appropriate safety and privacy review. Discord's 2026 teen-safety rollout and Roblox's 2026 age-check communications both emphasize understandable protections and transparency rather than hidden safety friction.
- Korea/U.S. privacy, advertising, subscription and consumer-protection review remains a release-time gate for affected campaigns.

## 14. Research note — 2026-09-14

### Directly adopted
- Google Search Central, current `Creating helpful, reliable, people-first content`: trust is the most important E-E-A-T component; make `Who`, `How` and `Why` understandable where relevant, especially for topics that can affect financial stability or safety.
- Discord Transparency Hub, current 2026: transparency reports and policy/enforcement explanation are treated as part of platform safety credibility.
- Discord, 2026-02-09 (updated 2026-02-24), Teen Default Experience: rollout feedback led to delayed age-assurance expansion, more verification options, vendor transparency and detailed technical documentation; adopt the principle that safety trust requires understandable purpose and transparency.
- Roblox, 2026-01-07, age checks for chat: explicitly states that explaining the user benefit of safety checks is important for adoption; adopt benefit-explanation and layered safety, not Roblox's specific implementation.
- FTC, 2025-12, warnings about possible Consumer Review Rule violations: fake/false reviews, sentiment-conditioned incentives, undisclosed relationships and fake influence indicators remain active enforcement concerns.
- Naver Search Advisor, current 2026: search aims to surface authoritative/useful information and suppress spam/poor-feedback documents.

### Reference/guardrail
- FTC, 2026-05 Shutterstock and 2026-06 Genesis Tech: retain clear subscription terms, informed consent and easy cancellation.
- PIPC, 2026-07-22, G7 privacy regulators discussion: treat child/teen online privacy as an active review area when expanding community, targeting or profiling.

## 15. Runtime Product Reality Audit — 2026-09-14

Verification: **available for public web surfaces**.

Observed strengths:
- home clearly repeats that WLD and rewards are game-only;
- privacy policy is unusually concrete about data categories, purposes, retention and ad boundaries;
- service status uses an explicit `do not guess` framing and distinguishes unverified state.

Observed trust gap:
- status currently has no confirmed record and all three monitored service categories are still `checking`;
- announcements currently have no published notice, while a sponsored advertisement placement is visible;
- the guide still frames progression around compound deposits, bonds, loans, dividends, price appreciation, passive income and a `capitalist` wealth ladder, which can compete with the newer persistent-world/game-only positioning;
- there is not yet a consistent public provenance pattern for finance-like educational/product content.

Therefore trust-proof conversion remains an unverified growth hypothesis rather than a claim that the current product already solves the problem.

## 16. Next growth priority

Validate one narrow sequence before adding more growth surfaces:

`clear promise → one verifiable reason-to-believe → one public-safe sample → authored interest → contextual signup → meaningful action → D1 consistency → D7 earned trust → D30 durable relationship`

Do not expand fake social proof, broad finance acquisition, trust badges without evidence, sponsor-first landing, raw-signup rewards, finance-safety language, or public operational detail beyond a safe disclosure boundary until this sequence demonstrates better D7/D30 retention without worsening phishing, privacy, youth-safety or misleading-finance guardrails.
