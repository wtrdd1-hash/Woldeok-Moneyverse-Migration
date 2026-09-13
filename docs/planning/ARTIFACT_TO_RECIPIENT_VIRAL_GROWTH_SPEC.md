# Woldeok Moneyverse — Artifact-to-Recipient Viral Growth Spec

> Version: v2026.09.14.58
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`, `COMMUNITY_PROOF_TO_PARTICIPATION_GROWTH_SPEC.md`, `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md`
> Korean counterpart: [ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.ko.md](ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.ko.md)

## 1. Gap selected

The largest remaining growth gap is not whether Moneyverse can expose a share button. The gap is why a member would voluntarily share something, why the recipient would care before knowing Moneyverse, and whether that recipient can reach a first meaningful action without being trapped by a generic signup wall.

Current planning already establishes public-safe artifacts, community proof, collection/identity/season history and a retention-to-viral direction. The missing product contract is the recipient side of the loop:

`meaningful member outcome → artifact worth showing → recipient understands it without an account → recipient explores one related idea → signup only when continuity requires it → first meaningful action → D1/D7 → eventually creates a different artifact worth sharing`

This specification deliberately does not add referral payout mechanics, public-profile database contracts, deep-link implementation details or new UGC infrastructure.

## 2. Viral promise

**“Share something that means something on its own — not an ad for Moneyverse.”**

A good share should answer three questions immediately:
1. What did this person make, learn, finish or contribute?
2. Why is it interesting even if I do not use Moneyverse?
3. What can I safely look at or try next without giving the service my identity first?

The service should earn the recipient’s curiosity before asking for authentication.

## 3. Why members share

Prioritize intrinsic social value over paid referral pressure.

### Identity
- a collection/set that reflects taste;
- a designed room/space/headquarters;
- profession mastery or a chosen long-term path;
- an opt-in profile board or archive chapter.

### Achievement
- completing a collection chapter;
- solving a learning/replay challenge;
- reaching a season milestone;
- completing a club/city/community contribution.

### Interpretation
- a short fictional-company/world insight;
- a replay showing what the user learned from a simulated choice;
- a curated “what changed this week” response.

### Contribution
- a public-safe community project outcome;
- a museum/archive contribution;
- a creator/community collaboration with transparent sponsorship where applicable.

Raw WLD wealth, debt, casino winnings, risky stock returns or private portfolio performance are not default viral objects.

## 4. Share artifact anatomy

Every shareable artifact should stand alone with:
- a plain-language title;
- one visual or compact summary of the member-created outcome;
- enough world/context explanation for a non-member;
- a clear `virtual/simulated/game-only` cue when money/market concepts appear;
- the artifact owner’s chosen public display identity, not forced real identity;
- one primary recipient CTA;
- explicit sponsored/creator disclosure when a material relationship exists.

The recipient CTA should match the artifact:
- collection → “see the set / try a starter collection path”;
- learning replay → “try the same scenario”;
- season chapter → “see what changed”;
- profession milestone → “preview this profession”;
- community contribution → “see the project / contribute after joining.”

Do not reduce every artifact to “Sign up now.”

## 5. Recipient first 30 seconds / 3 minutes / first session

### First 30 seconds
The recipient should understand:
1. who or what shared this, using a safe public identity;
2. what happened;
3. that Moneyverse is a virtual/game-only economy when relevant;
4. what can be explored without login.

### First 3 minutes
Offer one low-friction continuation:
- inspect the artifact/story;
- compare with a safe public example;
- try a small sample/replay;
- explore the related fictional company, collection, profession or season context.

Avoid feature grids, wallet-first onboarding and unrelated financial-game surfaces.

### First session
If the recipient becomes interested, preserve that interest through authentication. A successful recipient session creates one meaningful state such as:
- saving a related thread;
- completing one sample/learning action;
- starting a collection/profession/season path;
- contributing to the related community project after authentication;
- setting one next goal.

Opening the landing page, signing in, visiting a wallet or clicking an ad is not activation.

## 6. Viral loop types

### A. One-to-one relevance loop
A member shares a specific artifact to someone likely to understand why it matters.

Best for learning replays, collection milestones, profession identity and project contributions.

### B. Identity broadcast loop
The artifact expresses taste/status without exposing wealth.

Best for profiles, spaces, museums, seasonal history and curated collections.

### C. Collaborative loop
Sharing invites another person into a project, challenge or discussion after context is clear.

Rewards, if any, should center on cosmetic recognition, project history or bounded convenience rather than spendable economic advantage.

### D. Content discovery loop
A public artifact earns search/social discovery because it is independently useful. Search traffic should enter the same context-first recipient funnel rather than a generic homepage.

## 7. Referral boundary

Referral is a subset of viral growth, not its foundation.

Do not reward:
- raw link clicks;
- raw registrations;
- repeated self-invites;
- posts/shares/views by themselves;
- positive endorsements.

If referral rewards are later used, eligibility should require a real downstream milestone such as multi-day verified participation. Rewards should be capped and should not create WLD/WDX competitive advantage. Fraud-adjusted CAC must include fake-signup and linked-account loss.

A compensated share, creator code, discount, contest entry or other material benefit can change the message from ordinary sharing into an endorsement/advertising context and must be disclosed clearly where applicable.

## 8. Share recipient funnel and cohort model

Canonical funnel:

`artifact creation → share intent → share sent/published → recipient open → artifact comprehension → contextual exploration → signup/auth if needed → recipient activation → D1 → D7 → D30 → recipient-created artifact`

Key cohorts:
- direct-message recipients;
- public social recipients;
- organic search recipients landing on artifact/archive content;
- creator/community-campaign recipients;
- new users vs returning users;
- mobile vs desktop;
- artifact type;
- compensated vs uncompensated sharing.

Do not merge all share traffic into one conversion rate.

## 9. D1/D3/D7/D14/D30 after a shared entry

### D1 — recognition
Return the user to the concept they entered through. Do not erase share context after signup.

### D3 — adjacent relevance
Show one related collection, profession, fictional-company, season or project path.

### D7 — outcome
Show a meaningful change or progress related to the initial artifact and the user’s own action.

### D14 — social depth
Offer an opt-in social/community layer only after the user understands the product context.

### D30 — identity and creation
The user should have something of their own worth keeping, curating or sharing: collection, archive, space, profession history, learning record, season chapter or contribution.

The desired viral loop is therefore not `invite → reward → invite`. It is `receive meaning → create meaning → share meaning`.

## 10. Safety, privacy and abuse review

### High — private-data leakage through share artifacts
User impact: stalking, targeted fraud, embarrassment and account targeting.
Abuse scenario: a share card includes balance, debt, private WDX positions, hidden social relationships, security/recovery state, session identifiers or precise personal data.
Minimum protection: public-safe allowlist; private-by-default personalization; owner preview before public sharing; no secrets/session/recovery data in URL; safe deletion/hide path.
Separate development/QA required: yes before personalized public artifact rollout.

### High — phishing and malicious lookalike shares
User impact: credential theft/account takeover.
Abuse scenario: attackers imitate a Moneyverse artifact, “reward claim” or shared achievement page to lure users into fake login.
Minimum protection: consistent official domain/branding; no credential or auth-code request inside share content; no asset-loss urgency; recipients should be able to inspect public context before authentication; external links require explicit safety policy.
Separate development/QA required: yes before external deep links, messaging campaigns or persistent UGC links.

### High — referral/share fraud and multi-account farming
User impact: polluted community proof, economy loss and bad CAC decisions.
Abuse scenario: one operator creates accounts/devices to manufacture shares, signups or reward milestones.
Minimum protection: no meaningful economy payout for clicks/shares/signups; delayed verified milestones for any future referral reward; caps/eligibility; fraud-adjusted reporting.
Separate development/QA required: yes before economic referral incentives.

### High — harmful/illegal UGC and impersonation
User impact: harassment, doxxing, scams and reputational damage.
Abuse scenario: public artifacts contain malicious links, personal information, impersonation or abusive material.
Minimum protection: reporting/removal path; public-identity controls; no forced real-name exposure; moderation rules; noindex or discovery suppression for low-trust/unreviewed public UGC where appropriate.
Separate development/QA required: yes before large-scale public UGC discovery.

### Medium — minors and age-sensitive sharing
Do not infer sensitive age traits for growth targeting. Do not route minors toward adult/financial-like content or unrestricted stranger interaction without applicable age/privacy/safety review.

## 11. SEO and public discovery

Index only artifacts that provide durable, independent context. Candidate pages:
- substantial collection/season/project showcases;
- fictional-company/world explainers connected to a public artifact;
- educational replay explanations;
- curated archives.

Usually private/noindex:
- one-off personal share cards with thin content;
- referral claim pages;
- raw activity feeds;
- live lobby states;
- balances, holdings, debt, casino history;
- account/security/recovery/moderation pages.

Google’s current UGC guidance supports anti-spam policy, reporting, reputation/approval controls and `ugc`/`nofollow` treatment where appropriate. Google’s 2026-08-28 Site Reputation Policy update reinforces that third-party content must not exist mainly to exploit host authority. Artifact SEO must therefore be valuable without the ranking benefit.

## 12. Monetization

Monetization must follow recipient value:
1. explain the artifact;
2. allow the primary exploration/sample;
3. preserve the contextual next action;
4. only then consider reviewed ad/sponsor inventory.

Do not place ads where they look like “view this collection,” “join project,” “continue,” “login” or other product CTAs. Do not use recipient financial-game interest for sensitive ad targeting.

Creator/sponsor artifacts must make the material relationship hard to miss. Compensation for sharing or positive exposure must not be hidden behind profile-only or terms-only disclosure.

## 13. KPI framework

### Creation/share
- eligible artifact creation rate;
- artifact public opt-in rate;
- share-intent rate;
- share-send/publish rate;
- repeat share rate by artifact type.

### Recipient quality
- recipient open rate where measurable without invasive tracking;
- artifact comprehension/engaged-read rate;
- recipient → contextual exploration;
- recipient → signup;
- recipient signup → activation;
- share-assisted time-to-first-value.

### Retention/viral quality
- share-recipient D1/D3/D7/D14/D30;
- recipient meaningful actions/session;
- recipient-created artifact rate;
- second-generation share rate;
- share-assisted LTV;
- retention-adjusted contribution.

### Trust guardrails
- fake-signup/referral-fraud rate;
- spam/report/block rate;
- malicious-link/phishing/ATO signals;
- privacy complaint and accidental-publication rate;
- impersonation/doxxing reports;
- finance-like misunderstanding complaints;
- accidental ad click/ad-induced churn;
- suspicious reward duplication.

## 14. Experiment backlog

### Experiment A — artifact-first vs generic invitation
Hypothesis: a meaningful artifact produces better activated recipients than a generic “join Moneyverse” invitation.
Cohort: first-time share recipients.
Control: generic invite/share copy.
Treatment: context-rich artifact with one matched preview CTA.
Primary: recipient → activation → D7.
Guardrails: bounce, spam reports, privacy complaints, fake signup.
Observation: at least one mature D7 cohort; prefer multiple artifact cycles.
Next: keep only if downstream quality improves, not merely opens.

### Experiment B — preview before auth vs auth-first
Hypothesis: safe 30–90 second preview improves qualified signup and time-to-first-value.
Control: authentication before meaningful context.
Treatment: public-safe artifact + sample first.
Primary: signup → meaningful action.
Guardrails: unauthorized/private data exposure, abuse traffic, page performance.
Observation: mature D7 cohort.

### Experiment C — identity artifact vs wealth artifact
Hypothesis: collection/space/profession/season identity drives healthier sharing than WLD/return-oriented status.
Control: economy-number-oriented status card where currently available/safe.
Treatment: identity/progress artifact.
Primary: recipient activation and D7.
Guardrails: finance-like misunderstanding, harassment, privacy complaints.

### Experiment D — no referral payout vs signup payout
Hypothesis: intrinsic sharing produces fewer but higher-quality users than raw-signup economic rewards.
Control: only if an existing raw-signup reward exists and is legally/operationally safe to test; otherwise use historical baseline rather than introducing it.
Treatment: no spendable reward for raw signup; recognition/cosmetic-only sharing loop.
Primary: fraud-adjusted CAC and D30.
Guardrails: fake signup, multi-account signals, reward duplication, economy cost.

### Experiment E — value-before-ad vs early ad
Hypothesis: resolving artifact context before monetization protects activation and D7.
Primary: retention-adjusted contribution.
Guardrails: accidental ad clicks, bounce, D7/D30, CWV/performance.

## 15. Research note — 2026-09-14

Directly adopted:
- **Discord Profile Widgets FAQ, updated 2026-09-08:** users can deliberately showcase interests through customizable/reorderable profile widgets. Adopt user-controlled identity expression rather than forced public status.
- **Spotify Messages update, 2026-01-07, with group-sharing update noted from 2026-01-28:** content sharing works best when the shared object already has meaning and participation controls exist. Adopt content-first sharing and user control; do not adopt Spotify scale as a forecast.
- **Google Search Central — Prevent User-Generated Spam:** clear abuse policy, reporting, spam-account controls and selective indexing are prerequisites for scalable UGC discovery.
- **Google Search Central, 2026-08-28 Site Reputation Policy update:** third-party content must not be created primarily to exploit host ranking authority.
- **FTC current Endorsement Guides guidance:** compensated/incentivized sharing can require clear and conspicuous material-connection disclosure; fake or distorted social proof is deceptive.

Reference only:
- **Discord, 2026-08-20 Game Discovery/Social Play:** discovery should be judged by downstream meaningful play/retention, supporting share → activation → D7/D30 rather than share CTR optimization.

## 16. Runtime Product Reality Audit — 2026-09-14

Public service verification was available.

Observed on the public home:
- WLD/game-only disclosures remain visible;
- the product describes itself as a Discord-connected community virtual economy;
- Start Here provides pre-login exploration cues;
- the public lobby can be visibly quiet/empty;
- Monthly Notes still says public operating news is being prepared;
- multiple sponsored advertisement placements are already present.

Implication: Moneyverse does not yet have a strong visible public artifact-to-recipient loop on the home surface. Viral planning should therefore prioritize one truthful shareable outcome and a context-first recipient landing before expanding referral payout, public activity feeds or ad inventory.

## 17. Decision

For the next growth phase, prioritize:

`meaningful outcome → public-safe artifact → recipient understands before login → matched preview → activation → D1/D7 → recipient creates own artifact`

Do not prioritize new referral cash-like rewards, viral spam prompts, public wealth cards, bulk profile indexing or ad-heavy share landing pages until this loop improves qualified activation and retention without worsening abuse/privacy/trust guardrails.
