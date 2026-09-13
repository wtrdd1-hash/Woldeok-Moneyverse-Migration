# Woldeok Moneyverse — Permission-to-Return Lifecycle Growth Spec

> Version: v2026.09.14.66
> Status: Living consumer-growth specification
> Date: 2026-09-14
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`, `BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> Korean counterpart: [PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.ko.md](PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.ko.md)
> Change type: documentation only. No runtime, DB, API, authentication, infrastructure, scheduler or security-code change.

## 1. Gap selected for this iteration

Moneyverse already has a detailed implementation-oriented notification governance specification covering purpose classes, consent, quiet hours, frequency, deep links, security and anti-spam controls. Recent growth work also defines strong acquisition, activation, collection, comeback, archive, brand and monetization loops.

The remaining consumer-growth gap is different: **why should a user grant Moneyverse permission to interrupt them, which messages are valuable enough to deserve that permission, and how does a message return the user to the exact thread they cared about rather than merely generating a click?**

A generic “enable notifications” request is not a retention strategy. A high push opt-in rate is not success if users later mute the app, report spam, distrust the sender, or return to a generic home screen with no continuity.

Canonical loop:

`first value → user chooses something worth following → contextual return-permission offer → useful change occurs → minimal message → exact-context return → meaningful action → D1/D7/D30 continuity`

Consumer promise:

**“Tell me only when something I chose is genuinely worth returning for.”**

This document stays at consumer/product-growth level. It does not add schemas, APIs, schedulers, provider contracts or backend architecture.

## 2. Permission is earned after value, not requested on arrival

Moneyverse should not make push/email permission part of the first anonymous screen or a mandatory onboarding checklist.

The best permission moment is immediately after a user creates a durable reason to return, for example:

- follows a fictional company/world thread;
- chooses a collection chapter or next collection goal;
- saves a season/event they explicitly care about;
- joins a club/community project voluntarily;
- chooses a profession/business objective;
- asks to be reminded about a personally selected recap or event.

The permission explanation must name the value:

- “Let me know when this company story materially changes.”
- “Remind me when the next chapter of this collection becomes available.”
- “Send me one weekly recap of the path I chose.”

Avoid:

- “Enable notifications for the best experience.”
- “Allow alerts so you do not miss rewards.”
- a system permission prompt before the user knows what Moneyverse is;
- tying core gameplay access to optional marketing permission.

The OS permission prompt is the final step after the product-level explanation, not the explanation itself.

## 3. Return-value hierarchy

Not every product event deserves an outbound interruption. Use this consumer priority order.

### Tier A — requested continuity
Highest growth value.

Examples:
- a followed fictional company/world thread changed;
- a chosen season/project entered a meaningful new phase;
- a user-selected collection path has a new relevant chapter;
- an explicitly requested weekly recap is ready.

### Tier B — meaningful personal progress
Useful when it helps the user understand a durable state.

Examples:
- a collection chapter can now be curated/reinterpreted;
- a profession/project milestone unlocked a genuinely new choice;
- a club project the user joined reached a decision point.

### Tier C — broad product/news updates
Prefer in-app or digest unless the user explicitly chose the category.

Examples:
- reviewed monthly world news;
- a new optional theme or season preview;
- a substantial guide or educational replay relevant to a saved interest.

### Tier D — commercial/promotional
Separate, explicitly controlled and never disguised as continuity.

Examples:
- subscription offer;
- sponsor promotion;
- cosmetic sale.

Security, transactional and service-operational alerts remain governed by their own necessary-purpose rules and are not growth inventory.

## 4. First-session permission journey

### First 30 seconds
No outbound-notification ask by default.

The user should first understand:

1. Moneyverse is a persistent community simulation / game-only virtual economy;
2. one concrete thing they can explore now;
3. that their chosen path can persist;
4. that optional reminders exist only after they choose something to follow.

### First 3 minutes
The user makes one authored choice: Build, Collect or Explore, or an equivalent concrete thread.

After a saved/meaningful choice exists, the product may offer a narrow return promise such as:

> “Want one update when this changes?”

The user can choose “Not now” without losing the choice or progress.

### First session end
Prefer an in-product next-step card over an outbound permission nag.

A permission request is justified only when the user has created a future-facing state that can produce a genuinely useful notification.

## 5. Lifecycle return design

### D1 — recognition before interruption
The product should first prove continuity in-app: “the path you chose is still here.”

If there is no meaningful external change, no outbound message is required. A scheduled “Day 1 reminder” merely because 24 hours elapsed is not a success condition.

If the user explicitly asked for a reminder, keep it narrow and context-preserving.

### D3 — one adjacent reason, not a feature blast
If a chosen thread developed, summarize the change and offer one action.

Do not send a list of wallet, bank, stock, casino, shop and quest features.

### D7 — weekly evidence of value
The strongest general-purpose retention message is a user-requested weekly recap showing:

- what the user chose;
- what changed;
- what the user accomplished;
- one next step.

Progress should not be reduced to WLD wealth or WDX returns.

### D14 — deepen identity
Messages may surface a new curation, display, profession, world or club-project choice when it directly relates to the existing path.

### D30 — durable history
A monthly/season recap should show what became part of the user’s history and why a future season/chapter may matter.

Avoid “30 days = reward expiry” pressure.

### Inactivity / comeback
For lapsed users, use the established catch-up promise:

`what remained → what materially changed → what can be ignored → one action now`

Do not manufacture a message if nothing meaningful changed.

## 6. Message structure

Every growth-return message should pass a four-part test:

1. **Recognize:** identify the user-selected thread without exposing sensitive private details.
2. **Explain:** state what actually changed.
3. **Bound:** avoid fake urgency, financial pressure or invented scarcity.
4. **Continue:** offer one exact next action that resumes the thread.

Good pattern:

“Your Moonlight Archive chapter has a new season connection. See what changed and choose whether to add it to your archive.”

Bad pattern:

“URGENT: You’re missing rewards! Come back now before your progress disappears.”

Financial-game messaging must never imply real profit, guaranteed yield, recovery from losses, or urgent buy/sell behavior.

## 7. Context preservation after click

A notification click is not activation.

The return experience must preserve the reason the user tapped:

`message → relevant public/safe context if allowed → auth/reauth if necessary → original destination → one meaningful action`

Do not dump a returning user on the generic home page solely to maximize ad impressions or feature exposure.

If the destination is no longer available, explain that state safely and offer the closest non-sensitive continuation.

## 8. In-app before outbound

Use the least interruptive channel that can achieve the user goal.

Preferred order for optional growth communication:

1. on-surface next-best-action;
2. in-app inbox/recap;
3. user-requested digest/email/push;
4. separately consented marketing.

A user who returns naturally does not need an outbound reminder for the same event.

Outbound delivery should not substitute for weak product navigation or an empty home state.

## 9. Permission and preference UX principles

Consumer-facing controls should answer three questions:

- **What will I hear about?** Example: seasons, collections, community projects, weekly recap, product offers.
- **How often?** Real-time only where genuinely useful; otherwise digest/weekly/off choices are preferable.
- **Where?** In-app, email, push where available and consented.

Users should be able to keep security/service communication while muting optional growth or marketing messages.

Marketing preference language must be explicit. Do not rename advertising as “benefits,” “important information,” or “community updates.”

## 10. Habit design without coercion

Notifications support the habit; they must not become the habit.

A healthy loop is:

`user intent → product change/progress → optional reminder → useful return`

Not:

`daily alarm → claim reward → reset countdown → repeat`

No hard streak punishment, asset-loss threat, larger WLD grant for churn, repeated casino prompt, or P/L pressure should be used to justify notification volume.

## 11. Social and viral messaging

Social return messages can be valuable when they reflect a relationship or project the user chose.

Allowed direction:

- a club project the user joined reached a milestone;
- someone responded to content the user intentionally made public;
- a shared collection/story has a new contextual update.

Avoid default lock-screen exposure of:

- private social graph;
- private message content;
- WLD/WDX holdings;
- debt or loan state;
- casino history;
- account/recovery/security details beyond the minimum needed for genuine security alerts.

Community notifications need block/report/privacy controls and must not amplify harassment or coordinated spam.

## 12. LiveOps and season anticipation

D-14/D-7/D-3/D-1 season communication remains useful only when each message adds new information.

Suggested consumer progression:

- D-14: what theme/change is coming and why it matters;
- D-7: let the user choose which old/new thread to follow;
- D-3: explain one concrete connection or preview;
- D-1: concise reminder of the user-selected thread;
- launch: direct continuation, not a generic homepage blast.

Users joining late should receive a catch-up path, not four missed notifications at once.

## 13. Acquisition and brand impact

Notification permission is a downstream trust asset, not an acquisition KPI.

Do not optimize paid/organic landing pages for “enable notifications” conversion. Optimize for first value and authored choice first.

Brand principle:

**Moneyverse remembers what the user cared about; it does not demand attention merely because it can send a message.**

This reinforces the v65 promise of persistent choice and remembered history.

## 14. SEO impact

Private notification inboxes, preference states, unsubscribe pages, deep-link continuation state, account reminders and user-specific recap pages are not SEO inventory.

Public indexable candidates:

- a clear help page explaining notification choices;
- season/event public archives;
- reviewed world/company/collection content that is independently useful.

Do not generate indexable “you missed this” or personalized notification landing pages.

## 15. Monetization boundary

Optional return communication is not ad inventory by default.

Rules:

- security/account messages never contain sponsor placements;
- a collection/season continuity message is not converted into a commercial message by attaching an unrelated offer;
- subscription/cosmetic promotions require the appropriate commercial preference/consent and clear labeling;
- no advertiser buys priority over user-selected continuity;
- do not use private economy behavior, recent losses, debt, casino behavior or security state to personalize commercial notifications;
- no meaningful WLD/WDX reward for merely enabling notifications, opening a message or clicking an ad.

Profitability should include unsubscribes, permission revocation, complaints, churn, support load and downstream D7/D30 impact, not only CTR/revenue.

## 16. KPI framework

### Permission quality
- eligible-value-moment → permission-explanation view;
- explanation → category opt-in;
- OS permission grant where applicable;
- 7/30-day permission retention;
- category mute/unsubscribe rate;
- notification permission revocation rate.

### Return quality
- delivered → meaningful return, not only open;
- context-preserved return rate;
- message → meaningful action;
- D1/D3/D7/D14/D30 after message;
- natural-return share vs message-assisted return;
- time-to-context after click;
- return-session satisfaction/complaint signal.

### Business quality
- retained-user contribution by lifecycle messaging cohort;
- reactivation LTV/CAC impact;
- commercial opt-in conversion after repeated value;
- notification-attributed revenue net of churn/support cost.

### Trust/safety guardrails
- spam/complaint rate;
- opt-out/unsubscribe rate;
- phishing/impersonation reports;
- account-takeover signal rate following message campaigns;
- privacy complaints;
- suspicious reward duplication/fake-account rate;
- harassment/report rate for social notifications.

CTR/open rate is diagnostic, not the primary success metric.

## 17. Experiment backlog

### Experiment 1 — value-earned permission timing
- Hypothesis: asking after a saved/followed thread produces lower raw prompt volume but higher 30-day permission retention and D7 quality than first-session generic prompting.
- Cohort: first-time users who complete one meaningful choice.
- Control: generic early notification prompt.
- Treatment: contextual ask after a durable choice.
- Primary: 30-day permission retention + D7 retained rate.
- Guardrails: denial, revocation, complaint, activation drop.
- Observation: D30 minimum.
- Next action: keep only if retained quality improves, not merely grant rate.

### Experiment 2 — category-specific promise vs generic alerts
- Hypothesis: “weekly recap / this season / this collection” opt-ins outperform “all notifications” on retention and trust.
- Primary: category opt-in retained at D30 and message→meaningful-action.
- Guardrails: unsubscribe, spam complaint.

### Experiment 3 — change + one action vs generic comeback
- Hypothesis: a concrete state change plus one exact continuation action produces higher D7-after-return than “We miss you.”
- Cohort: 7–29 day lapsed users with a valid saved thread.
- Guardrails: phishing reports, opt-out, finance-like pressure complaints.

### Experiment 4 — exact-context destination vs home landing
- Hypothesis: returning to the original thread reduces time-to-value and raises meaningful-action rate.
- Guardrails: auth failure, privacy leakage, destination-error rate.

### Experiment 5 — weekly recap vs scheduled daily reminder
- Hypothesis: one high-signal recap yields better D30 retention and lower fatigue than generic daily reminders for users without daily-critical events.
- Guardrails: sessions/user quality, unsubscribe, notification revocation.

## 18. Security / abuse / privacy review

### High — notification impersonation / phishing / ATO
**Impact:** users may enter credentials or account data into fake Moneyverse pages.

**Scenario:** an attacker copies Moneyverse branding and sends “reward/season/account update” messages with a fake login link.

**Minimum conditions:** canonical-domain consistency, no credential requests in growth messages, safe first-party destinations, clear distinction between security and promotional messages, user education/help surface.

**Separate development/QA needed:** yes for actual outbound campaign/deep-link launch and anti-phishing checks.

### High — private-state leakage on lock screens or shared devices
**Impact:** holdings, debt, social relationships or security/account information can be exposed.

**Scenario:** a personalized message includes WLD/WDX positions, loan state, private community content or sensitive recovery information.

**Minimum conditions:** privacy-minimized preview copy, public-safe field allowlist, generic lock-screen wording for sensitive classes, private state kept behind authentication.

**Separate development/QA needed:** yes before sensitive personalized push/email.

### High — marketing disguised as service/benefit communication
**Impact:** spam complaints, legal/compliance risk and trust loss.

**Scenario:** a sponsor/subscription offer is sent as “important account information” or “benefit alert.”

**Minimum conditions:** clear purpose separation, explicit marketing choice where required, easy refusal/unsubscribe, no security/transactional surface reuse.

**Separate legal/QA review needed:** yes before commercial messaging.

### Medium — notification fatigue / coercive retention
**Impact:** permission revocation, churn, unhealthy engagement.

**Minimum conditions:** meaningful-change threshold, user category/frequency control, digest preference, quiet periods, no FOMO/streak-loss pressure.

### Medium — bot/multi-account notification reward farming
**Impact:** fake accounts and economy abuse if notification actions mint value.

**Minimum conditions:** do not reward permission/open/click with meaningful spendable WLD/WDX; treat downstream verified behavior separately.

### Medium — analytics overcollection
**Impact:** notification attribution can expose sensitive economy or social profiles to vendors.

**Minimum conditions:** aggregate/pseudonymous measurement where possible; no session secrets, recovery data, private balances, debt, casino history or unrestricted message content in analytics payloads.

## 19. Korea / US policy notes

### Korea
KISA’s 7th revision of the anti-spam guide, published 2026-03-04, explicitly highlights:

- do not use ambiguous labels such as “benefit alerts” or “information provision” when requesting advertising consent;
- app-push advertising refusal should not require unnecessary login or complex steps;
- coupons/points/benefits do not automatically justify promotional messaging without required prior consent.

Direct adoption: explicit purpose language, low-friction refusal and separation of commercial messages from product continuity.

KISA’s 2026-05-19 warning about government-impersonation phishing shows how trusted branding and official-looking links can be abused to steal credentials. Direct adoption: Moneyverse return messages must reduce login-link ambiguity and phishing-like urgency.

Legal applicability for each actual channel/campaign remains subject to launch-time legal review.

### United States
The FTC CAN-SPAM baseline continues to prohibit deceptive header/subject information and requires a valid opt-out path for commercial email. Direct adoption: truthful commercial identity and working unsubscribe/suppression.

Apple platform guidance also requires permission before notifications and says marketing notifications require explicit permission and must not abuse Time Sensitive interruption. This is platform policy/design guidance, not a substitute for legal review.

## 20. External product/reference evidence — researched 2026-09-14

### Direct adoption
1. **Android Developers — Notification runtime permission, updated 2026-09-01**
   - Request notification permission in the context of the feature so users understand why they should opt in.
   - Use responsibly because users can revoke permission.
   - Adopted: value-earned, contextual permission timing.

2. **Discord Mobile Notifications Settings 101 — updated 2026-07-31**
   - Discord separates in-app notification decisions from OS-level presentation and supports granular server/user controls.
   - Adopted: category/channel control and user agency rather than one global growth switch.

3. **Apple Human Interface Guidelines / User Notifications**
   - Notifications should be timely, high-value information; marketing notifications require explicit permission and should not break Focus using time-sensitive priority.
   - Adopted: high-value threshold and non-abusive interruption.

4. **KISA anti-spam guide 7th revision — 2026-03-04**
   - Adopted: explicit advertising-consent language and low-friction opt-out.

5. **KISA government-impersonation email warning — 2026-05-19**
   - Adopted: phishing/brand-impersonation guardrails for return messaging.

### Reference only
- Discord’s email/notification category model and per-server controls are useful patterns, but Moneyverse should not copy Discord’s category taxonomy mechanically.
- External vendor claims about uplift from automated re-engagement are not used as Moneyverse forecasts.

## 21. Runtime Product Reality Audit — 2026-09-14

Runtime verification: available.

Observed public production state:

- homepage clearly states that WLD/rewards are game-only virtual data;
- fast shortcuts still foreground wallet, minigames, exchange, shop and quests;
- multiple sponsored-ad placements already exist;
- monthly public news is still unpopulated;
- public lobby can look quiet/empty;
- the getting-started guide still foregrounds login → wallet balance → quest/job → compound deposit/shop and a finance-heavy wealth ladder;
- announcements currently have no published notice while a sponsored placement exists.

The public runtime does not expose a visible consumer journey that says “follow this chosen thread, then opt into one useful return update.” Therefore this permission-to-return loop remains a planning hypothesis, not a verified runtime behavior.

No runtime changes are performed in this documentation run.

## 22. Decision gates

Do not expand outbound growth messaging until evidence shows:

1. users understand the brand/game-only promise first;
2. a durable authored choice exists before permission is requested;
3. messages return users to the same intent/context;
4. message-assisted D7/D30 improves without worse unsubscribe/complaint/privacy/phishing signals;
5. commercial messaging is clearly separated from product continuity.

Until then, do not expand generic daily reminders, first-screen push prompts, wealth/profit comeback copy, WLD/WDX click rewards, sponsor content in account/security messages or notification-driven ad inventory.

## 23. Next growth priority

Validate one narrow owned-return loop end-to-end:

`user follows one collection/world/season thread → contextual notification permission → one real state change → one concise return message → exact-thread continuation → meaningful action → D7-after-message → D30 permission retention`

If this loop cannot outperform natural return while preserving trust, the answer is not to send more messages; it is to improve the underlying product reason to return.
