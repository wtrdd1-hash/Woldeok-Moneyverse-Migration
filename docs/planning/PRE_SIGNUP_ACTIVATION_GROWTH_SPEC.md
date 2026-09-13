# Woldeok Moneyverse — Pre-Signup Activation & First-Value Growth Spec

> Version: v2026.09.13.17
> Status: Living consumer-growth companion to `PRODUCT_GROWTH_PLAN.md`
> Date: 2026-09-13
> Korean counterpart: [PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.ko.md](PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, infrastructure or Production change.

## 1. Growth gap selected for this pass

The largest current acquisition/activation gap is the step before account creation. Existing planning is comparatively detailed after sign-up, but a visitor arriving from search, a shared card, a season page, a fictional-company page or a community link still needs an immediate answer to three questions:

1. What is Moneyverse?
2. What can I do here right now?
3. Why should I create an account after seeing it?

The product should therefore treat **pre-signup activation** as a first-class funnel rather than sending every public visitor directly to authentication.

## 2. Visitor value proposition

The first screen should communicate one sentence of value before system complexity:

**Learn, build and compete inside a persistent virtual economy — with fictional markets, collections, jobs, businesses and seasons, without real-money investment risk.**

Supporting proof should use concrete examples, not feature-count copy:

- follow one fictional company and see why its virtual price moved;
- preview a collection or season archive;
- see one short job/business progression path;
- inspect a sample weekly recap or achievement card;
- understand that WLD/WDX are virtual, simulated and not cash-redeemable.

Avoid opening with banking terminology, dense economy dashboards, admin-like numbers, or a list of every system.

## 3. First 30 seconds

A first-time anonymous visitor should see, above the fold:

- one primary promise;
- one interactive or content-rich proof surface;
- one primary CTA: **Try a sample** or **Explore Moneyverse**;
- one secondary CTA: **Create account**;
- a concise `virtual / simulated / game-only` disclosure where market or economy content is shown.

The first public surface must not expose private balances, portfolio positions, member identifiers, security state, moderation state or authenticated API data.

## 4. First 3 minutes — no-account sample journey

The default anonymous journey should be a bounded preview rather than a fake account.

### Minute 0–1: choose an interest
Offer 3 simple paths:

- **Market:** inspect one fictional issuer/event and make a non-binding prediction.
- **Build:** preview a job → collection → business progression path.
- **Collect:** explore one themed collection/season set and its history.

### Minute 1–2: complete one reversible sample interaction
Examples:

- choose which fictional event would most likely affect a virtual company and reveal the explanation;
- assemble a sample collection set from 3 items;
- choose one of 3 starter goals and preview the next two progression steps.

Anonymous interactions do not mint WLD, create authoritative holdings, place orders, create referral rewards or persist sensitive state.

### Minute 2–3: show the personalized reason to sign up
The CTA should connect directly to what the visitor just did:

- `Save this watchlist and continue the market lesson`;
- `Start this collection and keep your progress`;
- `Choose this path and unlock your first real job`.

After authentication, return the user to the same intent instead of dropping them on a generic home page.

## 5. Search-to-play content system

SEO pages should be designed around a user goal and a next playable action.

Priority clusters:

| Search intent | Public content | Natural next action |
|---|---|---|
| What is paper trading / simulated investing? | beginner learning guide | try one fictional market scenario |
| How diversification works | educational guide | build a sample 3-company watchlist |
| Virtual company / ticker | issuer lore + event history | follow/save after sign-up |
| Beginner economy game | product explainer | choose Build path |
| Season/event archive | archive + collectible history | preview current season goal |
| WLD/WDX meaning | glossary | explore a safe sample loop |

Content must be useful without requiring sign-up. The sign-up CTA should extend the value rather than lock the answer behind authentication.

Do not mass-produce thin ticker, glossary or event pages merely for keywords. Each indexed page should contain original Moneyverse-specific explanation, meaningful context and a clear reason for a person to bookmark/share it.

## 6. Share-to-play loop

Shareable cards should be understandable without an account and have a safe public landing state.

Good share objects:

- collection completion;
- season archive record;
- educational replay result;
- club/city project milestone where public;
- fictional-market journal insight with no private holdings;
- cosmetic room/profile showcase.

A shared link must never contain a session token, private portfolio, private balance, email, device identifier, moderation case, account-recovery data or hidden referral identity.

Referral rewards, when used, should remain milestone-based and non-economic-first. A raw registration is not sufficient. Cosmetic, title, collection or convenience rewards are preferred over WLD advantage.

## 7. Activation definition

For consumer-growth reporting, distinguish:

- **Visit:** anonymous landing or public-content session.
- **Engaged visit:** visitor performs at least one meaningful public interaction or consumes a substantial guide/sample.
- **Signup start:** authentication/account-creation flow begins.
- **Signup complete:** account is successfully created/authenticated.
- **First value:** first verified meaningful product action after sign-up.
- **Activated user:** reaches a defined first-session milestone and has an explicit next goal.

Recommended first-value actions include completing one guided job, saving a fictional watchlist item, starting a collection, or completing one safe learning step. Merely opening the dashboard is not activation.

## 8. Cohort KPI chain

Every acquisition source should be evaluated through the same downstream chain:

`impression/referral → public visit → engaged visit → signup start → signup complete → first value → D1 → D3 → D7 → D14 → D30 → revenue/margin`

Core metrics:

- public-visit → engaged-visit rate;
- engaged-visit → signup-start rate;
- signup-start → signup-complete rate;
- median time-to-first-value;
- first-session completion rate;
- D1/D3/D7/D14/D30 retention by acquisition source;
- organic signup activation rate;
- share-link visit → activation rate;
- referral → activated-user rate;
- returning-user share;
- ad-induced churn and subscription conversion where monetization is active;
- CAC and LTV only after source quality is tied to retention.

Do not treat impressions, clicks, registrations or sessions alone as success.

## 9. Experiment backlog

### Experiment A — public sample vs immediate sign-up wall
- Hypothesis: showing one useful interactive sample before authentication increases activated sign-ups.
- Cohort: first-time public visitors.
- Control: current sign-up-first path.
- Treatment: interest choice + one sample interaction + intent-matched signup CTA.
- Primary: visit → activated-user conversion.
- Guardrails: signup completion, D1, error rate, privacy complaints, fake-signup rate.
- Minimum observation: at least one full weekly traffic cycle; do not conclude from small early samples.
- If successful: expand by acquisition intent. If not: inspect sample complexity and CTA mismatch rather than adding more prompts.

### Experiment B — one promise vs feature grid
- Hypothesis: one clear promise plus proof reduces first-30-second confusion.
- Primary: engaged-visit rate and signup-start rate.
- Guardrails: bounce, accessibility, page performance, misleading-finance reports.

### Experiment C — intent-preserving post-auth return
- Hypothesis: returning users to the exact public intent increases first-value completion.
- Primary: median time-to-first-value and first-session completion.
- Guardrails: auth failure, redirect abuse, account-security incidents.

### Experiment D — educational SEO CTA vs generic CTA
- Hypothesis: `Try this concept` outperforms generic `Sign up now` for learning-intent search traffic.
- Primary: organic visit → first value.
- Guardrails: search landing engagement, D7, misleading-content complaints.

## 10. Retention bridge after first value

Immediately after first value, show one next goal — not a wall of systems.

- D1 reason: see what changed since the first action.
- D3 reason: complete a small multi-session goal.
- D7 reason: receive a weekly progress recap and choose the next track.
- D14 reason: see visible identity/collection/business progress.
- D30 reason: preserve a meaningful archive, collection, season or social record.

Missing a day should not destroy progress. Comeback messaging should summarize what changed and offer a catch-up path rather than threaten loss.

## 11. Monetization placement

Monetization must follow demonstrated value.

Before first value:
- no paywall for the core explanation/sample;
- no deceptive native ad beside buy/sell/loan-style controls;
- avoid intrusive interstitials that interrupt the first sample.

After repeat value:
- ad-free subscription may be positioned as comfort;
- cosmetic/profile/space/season expression may be sold without economic advantage;
- sponsor content must be clearly labeled and separated from fictional-market outcomes.

Evaluate monetization by D1/D7/D30 retention, ad-induced churn, subscription conversion, ARPU/ARPDAU, LTV/CAC and margin — not ad impressions alone.

## 12. Security, privacy and abuse review

### High — public/private boundary leakage
Risk: SEO/share/sample pages accidentally expose authenticated account or portfolio data.
Minimum condition: public pages use explicitly public data only; private account/portfolio/security/recovery/moderation pages remain authenticated and non-indexable.
Separate QA: required before public launch of new share/SEO surfaces.

### High — open redirect / auth continuation abuse
Risk: intent-preserving post-auth return becomes a phishing/open-redirect vector.
Minimum condition: only allowlisted internal destinations and safe server-validated continuation state.
Separate QA: required for runtime implementation.

### Medium — referral/fake-signup abuse
Risk: public growth loops generate bot accounts, spam invitations and multi-account rewards.
Minimum condition: no reward for raw registration; verified milestone eligibility; abuse monitoring; reward value favors non-economic items.

### Medium — public UGC harassment / impersonation / malicious links
Risk: shareable public social/club/market content becomes an abuse channel.
Minimum condition: public scope controls, report/block paths, safe-link handling, moderation coverage and no private member data in cards.

### Medium — analytics/privacy overcollection
Risk: acquisition attribution causes excessive cross-site or sensitive profiling.
Minimum condition: purpose-limited analytics, consent/choice where required, no tokens/private balances/security attributes in analytics payloads, age/region safeguards.

## 13. Legal and policy notes

- WLD/WDX remain `virtual / simulated / game-only`; public copy must not imply investment return, deposit protection, cash redemption or guaranteed earnings.
- Incentivized reviews/testimonials must not require positive sentiment; material incentives/connections need appropriate disclosure.
- Personalized advertising, minors, cross-border data and new tracking vendors require privacy/legal review before launch where applicable.
- Financial-learning pages should be especially careful about trust, sourcing and avoiding claims that look like real financial advice.

## 14. External evidence reviewed — 2026-09-13

### Google Search Central — helpful, reliable, people-first content
Type: official search documentation. Directly adopted.
Key implication: indexed Moneyverse pages should solve a real visitor need, add original value, clearly show why the page exists, and avoid search-engine-first mass content. Google also emphasizes trust strongly for financial-stability-related topics.

### Google Discover core update — 2026-02-05
Type: official search update. Directional reference.
Key implication: original, in-depth, timely content and topic-level expertise are more durable acquisition assets than sensational/clickbait growth pages.

### TradingView The Leap / Paper Trading — 2026
Type: current product example. Directional reference only.
Key implication: simulated practice can be paired with education, community and progression so the user understands the experience before deeper commitment. Moneyverse does not adopt TradingView's real-money prize model.

### U.S. FTC Consumer Reviews/Testimonial guidance and 2026 enforcement
Type: government guidance/enforcement. Directly adopted for referral/review safeguards.
Key implication: incentives cannot be conditioned on positive sentiment and material incentive relationships should be disclosed.

## 15. Decision

Adopt **pre-signup activation** as the next consumer-growth priority. The next product-growth pass should evaluate whether public samples, public learning pages and share landings form a coherent acquisition → first-value path before expanding paid acquisition or adding more post-signup systems.

## 16. Version record

### v2026.09.13.17 — Pre-signup activation and first-value funnel
- Defined the first 30 seconds and first 3 minutes for anonymous visitors.
- Added three no-account sample paths: Market, Build and Collect.
- Added search-to-play and share-to-play funnels.
- Defined visit, engaged visit, first value and activated user separately.
- Added D1/D3/D7/D14/D30 source-cohort KPI chain.
- Added four growth experiments and trust/safety guardrails.
- Added monetization placement rules that protect first value and retention.
- Added public/private, redirect, referral, UGC and analytics security/privacy gates.

Documentation only. No runtime, database, API, authentication, infrastructure or Production configuration was changed.