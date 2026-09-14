# Woldeok Moneyverse — Zero-State Continuity & Quiet-Surface Growth Spec

> Version: v2026.09.14.75
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`, `WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md`, `FIRST_SOCIAL_BOND_BELONGING_RETENTION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> Korean counterpart: [ZERO_STATE_CONTINUITY_QUIET_SURFACE_GROWTH_SPEC.ko.md](ZERO_STATE_CONTINUITY_QUIET_SURFACE_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, migration, infrastructure, scheduler or security-code change.

## 1. Gap selected for this iteration

Moneyverse now has detailed plans for first value, return ladders, user-controlled priorities, World Pulse, collections, creator/community acquisition, first social bonds and retention-safe monetization. The remaining activation/retention gap is narrower but visible in production: **when a surface is legitimately empty, quiet, unavailable to the current user, or waiting for the first contribution, the product can explain the state but does not yet have one consumer-growth contract for turning that moment into a useful next action.**

Current production examples include:
- the home Monthly Notes area stating that reviewed public news is still being prepared;
- the announcements page containing no published notice while an advertisement remains present;
- the community lobby showing “no conversation yet” and asking the user to say hello;
- the guide explicitly telling a first-time user that a zero WLD balance and empty ledger are normal.

The frontend already distinguishes “no rows yet” from “the service is unreachable” through the shared `EmptyState` component. This spec preserves that honesty and defines the consumer layer on top of it.

Narrow loop:

`zero/quiet state → understand why it is empty → see what is safe/intact → one useful alternative action → create/follow/save something meaningful → D1 recognition → D7 continuity → content eventually replaces the zero state`

Consumer promise:

**“Nothing here yet does not mean there is nothing to do. Moneyverse should tell me what this state means and give me one useful, honest way forward.”**

This is not an error-state implementation spec, loading-state component contract, API fallback architecture, cache policy or backend availability design.

## 2. State taxonomy: do not collapse different facts

Consumer copy and growth logic must distinguish at least five states:

1. **True zero state** — the user genuinely has no history/content yet, such as no ledger entries or no collection chapter.
2. **Quiet community state** — the community exists but there is no current conversation or relevant activity.
3. **Content-not-published state** — a public surface exists but no reviewed item is available yet.
4. **Filtered zero state** — content may exist, but the user's current filter/priority has no match.
5. **Failure/unavailable state** — data cannot be loaded, authorization failed, or the service is degraded.

Never disguise a failure as “nothing here yet,” and never make a legitimate zero state look like an outage. The existing shared `EmptyState` implementation already encodes this separation in code; growth copy must preserve it.

## 3. First 30 seconds and first 3 minutes

### First 30 seconds
A user who encounters a zero/quiet state should immediately understand:
- why the surface is empty;
- whether their data/content is safe and intact;
- whether they need to do anything;
- the single best next action;
- whether that next action is optional.

A zero-state page must not become an ad-first dead end.

### First 3 minutes
Give one bounded continuation based on context.

Examples:
- **Empty announcements:** offer a useful evergreen guide, current service status, or a season/world archive instead of inventing news.
- **Quiet lobby:** let the user observe the rules and choose a low-risk prompt, interest or public project before asking for open-ended chat.
- **Empty wallet/ledger:** explain that zero is normal for a new account, then point to one verified starter activity rather than banking/casino pressure.
- **No collection history:** offer one starter theme or sample artifact, not a blank inventory grid.
- **No priority-matched World Pulse:** say that nothing relevant changed and offer the saved priority or an evergreen continuation.
- **No search/filter results:** offer reset/filter suggestions or a neighboring category; do not fabricate results.

The user must be able to leave without penalty.

## 4. The Zero-State Continuity Card

Every important zero/quiet surface should conceptually answer four questions. This is a UX-content contract, not a component implementation requirement.

1. **State:** What is true now?
2. **Reason:** Why is it empty/quiet?
3. **Continuity:** What remains safe, saved or still available?
4. **Next:** What one useful action can I take now?

Examples:
- “No reviewed announcements have been published yet. Your account and game progress are unaffected. Check the current service status or explore the getting-started guide.”
- “No one has spoken in the lobby yet. Messages here are temporary. You can read the community rules first or choose a newcomer-friendly prompt.”
- “You do not have a collection chapter yet. Pick one starter theme to save your first chapter.”

Avoid urgency words, fake activity, fake counters, artificial scarcity, or “everyone else is already doing this” pressure.

## 5. Lifecycle behavior

### D0 — convert blankness into first authored state
The zero state should help a new user create one small piece of personal continuity: first saved interest, starter collection theme, profession direction, watch item, learning thread or safe social contribution.

Success is not clicking through the empty state; success is creating a meaningful state that will exist when the user returns.

### D1 — prove memory
Replace generic emptiness with recognition of the user's first authored state. If there is still no new external content, say so honestly and return to the user's saved thread.

### D3 — show progression without filler
If a relevant change exists, show it. If not, offer an evergreen step that deepens the same priority. Do not manufacture “new” cards simply to increase session count.

### D7 — zero state should be rarer because the user created continuity
By D7, an activated user should have at least one durable thread: collection chapter, profession/project path, learning history, season/world follow, useful watchlist, or shared project context.

### D14/D30 — transform from empty surfaces to personal history
The long-term objective is not to fill every screen with feed items. It is to ensure that the user's key surfaces contain personally meaningful history, active goals or archives. A quiet public surface can remain quiet if the user's own continuity is strong.

### Comeback
For lapsed users, do not use absence itself as content. Show:

`what remained → what materially changed → what can be ignored → one safe restart action`

If nothing material changed, say so rather than producing a fake “while you were away” feed.

## 6. Quiet community design

A community surface with no live activity must not create social pressure or fake proof.

Preferred fallback order:
1. community purpose/rules;
2. one newcomer-friendly public artifact or prompt;
3. one bounded non-financial contribution;
4. save/follow the relevant thread;
5. open-ended posting only when the user understands the context.

Do not show fake “online now,” fake trending, seeded fake comments or synthetic member reactions as if they were real people.

A quiet state is safer than fabricated activity. The growth goal is to help the user start a real thread worth returning to.

## 7. Content and editorial zero states

When announcements, season updates, world news or editorial content are empty:
- do not publish filler merely to make the page look active;
- do not generate thin event pages for SEO;
- use a small evergreen alternative with independent value;
- show the last verified update date where useful;
- distinguish “no update” from “service unavailable.”

Google Search's current people-first guidance favors original, substantial and useful content over pages created mainly for search traffic. Naver's Search Advisor similarly states that SEO should improve the experience for users and recommends accurate, unique titles/descriptions and content with real value. Therefore a quiet high-quality archive is preferable to mass low-value freshness pages.

## 8. SEO boundary

### Index candidates
- substantial evergreen getting-started guides;
- original world/season archive pages;
- fictional-company lore with real explanatory value;
- learning guides and glossaries;
- editorial project/community retrospectives.

### Default noindex/unlisted candidates
- user-specific zero states;
- empty search/filter result pages;
- private dashboards/portfolios/balances/debt/casino state;
- referral/invite-only zero states;
- empty personalized feeds;
- security/recovery/report/moderation states;
- thin “coming soon” pages without independent value.

Google documents `noindex` as a page-level method for preventing indexing and states that confidential/private content should be access-controlled rather than relying on robots.txt. Preserve the existing Moneyverse private/account/admin indexing boundary.

Do not create `empty category × season × company × keyword` doorway combinations.

## 9. Monetization boundary

A zero/quiet state is **not free advertising inventory**.

Current production shows a sponsored advertisement on the announcements page even though no announcement is published. This does not automatically establish a policy violation, but it creates a consumer-value and publisher-policy risk: the page can visually contain more monetization than substantive publisher content.

Google AdSense guidance states that paid promotion should not exceed publisher content, prohibits deceptive placement, and warns against pages with little/no value or advertising that can be mistaken for navigation/content.

Therefore:
- do not place an interruptive ad between zero-state explanation and the only useful next action;
- do not make an ad the most visually prominent content on an otherwise empty page;
- do not label an ad as a recommended next step;
- do not reward clicks/views on ordinary ads with WLD/WDX;
- subscription/cosmetic promotion should wait until the user has experienced repeated product value;
- ad-removal subscription must retain clear terms, informed consent and simple cancellation.

Monetization success metric: **retention-adjusted contribution**, not revenue per empty-page impression.

## 10. Viral and acquisition effect

Do not share empty personal states as acquisition artifacts. Share outputs with context and pride: completed collection chapter, project result, season reflection, learning replay or public world artifact.

If a recipient arrives on a quiet/empty public surface:
`understand context → useful evergreen sample → choose one interest → contextual signup if continuity requires → first meaningful action`

Do not use referral codes, fake counters or giveaway pressure to compensate for missing content.

## 11. Experiment backlog

### A — action-oriented zero state vs descriptive-only zero state
Hypothesis: explaining the state plus one contextual next action increases meaningful activation without increasing confusion.
Target: visitors/new users on legitimate zero states.
Control: explanation only.
Treatment: State → Reason → Continuity → one Next action.
Primary: zero-state→meaningful-action rate, time-to-first-value.
Guardrails: back/exit frustration, support contacts, accidental sensitive-action entry.
Minimum observation: D7-mature cohort; D30 for broad lifecycle rollout.
Next: expand only if downstream retention improves, not just clicks.

### B — honest quiet state vs synthetic/filler freshness
Hypothesis: honest “nothing material changed” messaging produces higher trust and equal/better D7 than low-value filler.
Primary: D7 continuation and satisfaction/trust signal.
Guardrails: bounce, unsubscribe/mute, complaint rate.

### C — evergreen alternative vs ad-first empty page
Hypothesis: a useful alternative before monetization improves retained-user contribution.
Primary: meaningful action, D7, retention-adjusted contribution.
Guardrails: ad-induced churn, accidental click, policy complaints.

### D — contextual newcomer prompt vs generic “say hello”
Hypothesis: one bounded interest-matched prompt produces more useful social contributions than open-ended greeting pressure.
Primary: first useful social contribution, D7 shared-thread continuation.
Guardrails: spam, harassment, report/block, privacy complaint.

### E — empty personalized feed noindex vs indexable thin state
Hypothesis: keeping personalized/thin zero states out of search protects organic quality without harming qualified acquisition.
Primary: organic signup→activation→D7 on substantive pages.
Guardrails: indexed thin-page count, search complaints, accidental private exposure.

## 12. KPI framework

Activation:
- zero-state encounter rate by surface/cohort;
- zero-state comprehension;
- zero-state→meaningful-action rate;
- time-to-first-value after zero state;
- first authored state creation rate;
- first-session completion.

Retention:
- D1 return to authored state;
- D3 same-thread progress;
- D7 durable-thread rate;
- D14/D30 meaningful-history coverage;
- quiet-state→comeback continuation;
- WAU/MAU, returning-user share, sessions/user and meaningful actions/session.

SEO/acquisition:
- qualified organic visits to substantive content;
- organic visit→sample→signup→activation→D7/D30;
- thin/empty indexed page count;
- recipient/share landing→meaningful action.

Monetization:
- impressions per eligible user, not per empty page;
- ad-induced exit/churn;
- accidental click signal;
- ARPU/ARPDAU and subscription conversion only alongside D7/D30;
- retention-adjusted contribution and LTV/CAC.

Trust/security:
- fake-signup/referral-fraud rate;
- ATO/phishing signal rate;
- spam/report/block rate;
- privacy complaint rate;
- suspicious reward duplication rate;
- error-vs-empty misclassification reports where measurable.

## 13. Security, abuse and privacy review

### HIGH — failure disguised as empty state
Impact: users can misunderstand lost/unavailable data as legitimately empty, especially wallet/portfolio/history surfaces.
Scenario: an authorization/API failure is rendered as “no transactions yet,” causing users to believe assets/history disappeared.
Minimum protection: preserve the existing semantic boundary between zero and unavailable/error states; high-risk account/economy surfaces must not silently downgrade failure to empty.
Separate dev/QA: **yes** for any runtime change touching account/economy fallback behavior. This planning pass makes no such change.

### HIGH — private-state leakage through “helpful” zero-state recommendations
Impact: exposure of WLD/WDX holdings, debt, casino activity, private club/social graph, moderation/security/recovery state.
Scenario: a public/shared page says “no activity here, continue your debt repayment / hidden club / security recovery.”
Minimum protection: public-safe allowlist; personalization private by default; no secrets/session/recovery identifiers in URLs, metadata, analytics or share payloads.
Separate dev/QA: **yes** before personalized public zero-state recommendations.

### HIGH — phishing/ATO through empty-state recovery links
Impact: credential/session theft.
Scenario: a fake “your wallet is empty — restore account” or “no season rewards — claim here” message leads to a lookalike login.
Minimum protection: canonical domain/brand consistency; growth messaging never asks for passwords, OAuth codes or recovery codes; no loss/asset urgency; safe landing before authentication.
Separate dev/QA: **yes** for external deep-link comeback/recovery campaigns.

### HIGH — bot/fake activity used to erase quiet states
Impact: distorted social proof, referral fraud, spam and economy abuse.
Scenario: fake accounts create posts/reactions so a quiet community appears active, then qualify for rewards/referrals.
Minimum protection: no meaningful WLD/WDX for raw posts/reactions/views; do not count suspicious activity as social proof; preserve anti-abuse/fraud review before economic rewards.
Separate dev/QA: **yes** before economically meaningful community/referral incentives.

### MEDIUM — analytics overcollection
Minimum protection: measure the state and downstream action without exporting private economy/security/social data to ad vendors.

### MEDIUM — low-value UGC/SEO spam
Minimum protection: low-trust thin UGC remains noindex/unlisted where appropriate; reporting/removal; no automatic indexing merely because a URL exists.

## 14. Latest external research note — 2026-09-14

### Directly adopted
- **Threads, June 16, 2026 — Communities and Your Algo.** Threads exposes community progress and user-controlled topic preferences rather than relying only on a generic feed. Adopted: give a quiet user a meaningful interest/progress path they can control instead of inventing activity. Source: https://about.fb.com/news/2026/06/meta-launching-new-features-500-million-monthly-threads-users/
- **Discord Community Onboarding (current help/blog guidance).** Discord recommends prioritizing useful newcomer-friendly channels and allowing users to choose relevant roles/channels, while pairing simpler onboarding with raid protection instead of confusing verification barriers. Adopted: one bounded, relevant continuation from a quiet social state; no giant empty community surface or fake activity. Sources: https://discord.com/blog/community-onboarding-welcome-your-new-members and https://support.discord.com/hc/en-us/articles/11074987197975-Community-Onboarding-FAQ
- **Google Search people-first guidance, current.** Adopted: do not manufacture thin freshness pages to fill empty editorial states. Source: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- **Naver Search Advisor, current.** Adopted: user-helpful content, accurate unique titles/descriptions, and no unrelated popular-keyword stuffing. Sources: https://searchadvisor.naver.com/guide/seo-help and https://searchadvisor.naver.com/guide/content-basic
- **Google AdSense policy/help, current.** Adopted: avoid pages where advertising overwhelms publisher content, deceptive ad placement, incentivized ordinary-ad interaction or ads confused with navigation. Source: https://support.google.com/adsense/answer/2660562

### Legal/reference guardrails
- **FTC Shutterstock settlement, May 2026.** Maintain clear subscription terms, express informed consent and simple cancellation if ad-removal/subscription products are later surfaced after repeated value. Source: https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices

## 15. Runtime Product Reality Audit — 2026-09-14

Verification status: **available**.

Observed public production behavior:
- home clearly states that WLD/rewards are game-only virtual data;
- home presents quick links to wallet, games, exchange, shop, quests and lobby before much of the long-form product promise;
- Monthly Notes says public operational news is being prepared;
- the community lobby can display “no conversation yet” with a generic invitation to say hello;
- the announcements page has no published notice but does display `SPONSORED ADVERTISEMENT`;
- the getting-started guide explicitly explains that a new wallet may have zero balance and no ledger entries, then directs users into quests/jobs and later bank/stock/business/casino systems.

Consumer conclusion: Moneyverse already has honest basic zero-state copy and code-level separation between empty and unavailable states, but **the visible public surfaces do not yet consistently convert a zero/quiet state into one context-matched, retention-producing next action.** This spec remains a growth hypothesis; no runtime change is made in this pass.

## 16. Decision for the next growth cycle

Validate one narrow loop before filling every quiet surface with more content:

`legitimate zero state → State/Reason/Continuity → one useful next action → first authored state → D1 recognition → D7 durable thread`

First candidate: the public announcements/Monthly Notes quiet state, because it is visible pre-signup and currently competes with sponsored inventory.

Do not respond by creating fake announcements, fake community activity, mass SEO filler, early monetization pressure, WLD/WDX click rewards or new backend fallback behavior. Prove that a useful evergreen continuation improves activation/D7 first.