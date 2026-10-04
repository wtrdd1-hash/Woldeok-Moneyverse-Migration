# Moneyverse Deep Retention Product Operating Model

> Version: v2026.10.04.528
> Status: AUTHORITATIVE PLANNING CANDIDATE / documentation-only
> Date: 2026-10-04
> Canonical language: English
> Korean counterpart: [LIFE_ECONOMY_RETENTION_OPERATING_MODEL_SPEC.ko.md](LIFE_ECONOMY_RETENTION_OPERATING_MODEL_SPEC.ko.md)
> Parents: [LIFE_ECONOMY_USER_WORLD_SPEC.md](LIFE_ECONOMY_USER_WORLD_SPEC.md), [LIFE_ECONOMY_RETENTION_CONTINUITY_SPEC.md](LIFE_ECONOMY_RETENTION_CONTINUITY_SPEC.md)
> Runtime claim: none

## 0. Purpose

v528 converts the retention principles of v527 into an implementable operating model: exact user lifecycle stages, unlock rules, screen hierarchy, goal selection rules, economic-progression pacing, re-entry logic, content cadence, social continuity, experimentation boundaries, admin tooling and measurable acceptance criteria.

The design goal is not "maximum sessions." It is:
- make every return understandable;
- keep at least one meaningful unfinished goal alive;
- create visible progress without runaway inflation;
- preserve agency;
- build optional social attachment;
- give safe recovery from mistakes and inactivity;
- continuously reveal new combinations rather than merely larger numbers.

## 1. User lifecycle state machine

Canonical lifecycle:

`NEW -> ACTIVATED -> EXPLORING -> ESTABLISHED -> CONNECTED -> INVESTED -> VETERAN`

Dormancy side-path:

`ACTIVE_STATE -> AT_RISK -> DORMANT -> RETURNING -> REACTIVATED -> prior/adjusted ACTIVE_STATE`

### NEW
Entry conditions:
- account exists;
- first life path not completed.

Exit criteria:
- starter path selected;
- first complete economic cycle finished;
- first goal accepted or created.

### ACTIVATED
Expected duration:
- first session through ~D3.

Requirements:
- at least one Career Book entry;
- first cash-flow statement;
- one visible next goal;
- one future opportunity preview.

### EXPLORING
Expected duration:
- D2–D14.

Requirements:
- try at least two systems from job, savings, skill, city, business, public project;
- receive one delayed consequence;
- see one world-news event;
- encounter one optional social surface.

### ESTABLISHED
Expected duration:
- D7–D45.

Signals:
- repeated profession/business behavior;
- persistent financial strategy;
- weekly statement opened;
- one medium-term goal in progress.

### CONNECTED
Entry:
- meaningful social edge exists OR meaningful city/public contribution path is chosen.

The system must not require social participation; solo users may move ESTABLISHED -> INVESTED without CONNECTED.

### INVESTED
Signals:
- at least one 30+ day goal;
- substantial Career Book history;
- user-owned business, deep career specialization, significant city/public contribution, or equivalent long-horizon path.

### VETERAN
Not defined by account age alone.

Candidate requirements:
- multi-season history;
- mastery or contribution milestones;
- stable account/economic history;
- at least one prestige/legacy path unlocked.

## 2. Home information architecture

The Life Economy home screen is not a feature menu.

Top-to-bottom order:

### A. Return Recap
Only when meaningful changes occurred.
Shows:
- what changed;
- why it matters;
- whether action is required.

### B. Today
Maximum three primary cards:
1. Must/should address.
2. Best next progress action.
3. New opportunity.

### C. Goal Stack
Four lanes:
- Today;
- Week;
- Season;
- Long-term.

Each shows one active objective and progress.

### D. Economic Snapshot
- liquid WLD;
- free cash flow;
- next obligation;
- resilience;
- credit health;
- job/business status.

### E. World
- one important news item;
- city state;
- season state.

### F. Social/Public
- partnership;
- public project;
- rival/mentor update.

No more than one CTA per card.

## 3. Quick-session mode

Goal: useful completion in 30 seconds–2 minutes.

Sequence:
1. return recap, if any;
2. acknowledge result;
3. complete one low-friction action;
4. see goal progress;
5. leave with a clear future state.

Quick mode excludes:
- complex loan origination;
- deep business configuration;
- multi-step portfolio changes.

## 4. Normal-session mode

5–15 minutes.

Typical session:
- review daily economy;
- complete job/business action;
- progress a skill/goal;
- react to one opportunity;
- review one social/world item.

## 5. Deep-session mode

20+ minutes.

Use cases:
- business optimization;
- city move planning;
- Time Machine scenarios;
- multi-goal planning;
- company governance;
- season strategy;
- detailed statements.

The user may explicitly select session mode. The system may recommend, but never force, deep sessions.

## 6. Progressive unlock schedule

### First session
Visible:
- Today;
- Money;
- Job;
- Goal;
- Career Book.

### After first completed life cycle
Unlock:
- Skills;
- Savings Goal.

### After first weekly review OR 3 meaningful sessions
Unlock:
- Credit Health preview;
- City preview;
- Daily Choice.

### After minimum stability gate
Unlock:
- funded loan simulation;
- investment/portfolio basics;
- business preview.

### Business unlock gate
Example planning conditions:
- at least 3 meaningful sessions;
- one stable income source OR starter entrepreneurship path;
- tutorial completed;
- anti-abuse account checks passed.

Do not use arbitrary real-time waiting as the primary unlock mechanism.

### Social unlock
Friend/co-business surfaces appear after user understands personal economy basics.

## 7. Starter life paths

Starter paths must have approximately equal long-run expected opportunity, but different short-run trade-offs.

### Stable Employee
- predictable salary;
- lower volatility;
- slower skill acceleration;
- good for guided onboarding.

### Apprentice/Growth
- lower initial salary;
- higher skill growth;
- more promotion opportunities.

### Freelancer/Creator
- variable income;
- flexible work;
- early budgeting challenge.

### Small Trader/Entrepreneur
- business exposure sooner;
- greater cash-flow volatility;
- starter safety net.

### Public-Service/Community
- moderate income;
- early city/public-project exposure;
- contribution reputation progression.

Users can pivot later. Starter path is not a class lock.

## 8. First-session exact script

### Step 1 — Choose direction
Prompt: "How do you want to start your Moneyverse life?"
Show 3–5 cards, not a long form.

### Step 2 — First income
One simple job/task.
Outcome is deterministic during tutorial.

### Step 3 — First obligation
A modest living-cost/tax line.
Explain where WLD moves.

### Step 4 — First choice
Examples:
- save;
- train skill;
- buy useful starter business input.

### Step 5 — Immediate feedback
Show:
- cash change;
- goal progress;
- Career Book entry.

### Step 6 — Future preview
Show one locked but understandable opportunity:
"At Skill 2, you can apply for Logistics Specialist."

### Step 7 — Return promise
Show one real pending/future state.

## 9. Goal object contract

Each goal has:
- goal_id;
- category;
- horizon;
- target metric;
- starting value;
- target value;
- progress function;
- expected effort range;
- prerequisites;
- optionality;
- reward family;
- failure/recovery behavior;
- expiration semantics;
- personalization reason;
- analytics identity.

Goals must not depend on hidden criteria.

## 10. Goal categories

### Stability
- maintain positive free cash flow;
- build emergency buffer;
- reduce payment burden.

### Growth
- raise skill;
- earn promotion;
- improve business margin.

### Exploration
- try a city;
- test a new career;
- run Time Machine.

### Recovery
- exit delinquency;
- close failing business safely;
- restore positive cash flow.

### Social
- complete joint task;
- mentor/mentee objective;
- city project contribution.

### Legacy
- multi-season specialization;
- company longevity;
- public contribution history.

## 11. Goal ranking formula

Suggested explainable score:

`GoalScore = 0.30 Relevance + 0.20 Feasibility + 0.15 Novelty + 0.15 UserPreference + 0.10 RecoveryValue + 0.10 Diversity - Penalties`

Penalties include:
- recently dismissed;
- conflicts with user-selected path;
- duplicate category saturation;
- unsafe debt/risk;
- excessive session requirement.

AI may propose a candidate set; deterministic rules produce final eligibility.

## 12. Goal slot rules

Default:
- 1 daily;
- 1 weekly;
- 1 season;
- up to 2 long-term.

Users can pin a goal.
Pinned goals are not displaced by ranking models.

## 13. Opportunity feed object

Fields:
- opportunity_type;
- eligibility;
- expected duration;
- potential upside;
- downside/risk;
- city/world dependency;
- expiration;
- source;
- novelty;
- user relevance;
- explanation.

Examples:
- job opening;
- skill scholarship;
- supplier contract;
- city subsidy;
- partnership;
- public project;
- season task.

## 14. Opportunity ranking

Do not use CTR-only ranking.

Suggested score:
`OpportunityScore = Eligibility * (0.30 Relevance + 0.20 ExpectedUtility + 0.15 Diversity + 0.15 Novelty + 0.10 Timing + 0.10 UserPreference)`

Hard filters:
- legal/jurisdiction availability;
- age/platform availability;
- anti-abuse;
- financial affordability;
- feature prerequisites.

## 15. Economic pacing

The economy must feel alive without requiring constant presence.

### Daily-scale changes
- small job outcomes;
- routine costs;
- small business orders;
- short training.

### Weekly-scale changes
- payroll cycle;
- business statement;
- credit factor update;
- city project progress.

### Season-scale changes
- macro theme;
- industry shifts;
- major career/business opportunities.

### Long-term
- specialization;
- company history;
- city influence;
- mentor reputation.

## 16. Simulation time model

Planning recommendation:
- separate real wall-clock from economic simulation periods;
- allow Test acceleration;
- preserve deterministic period boundaries.

Example:
- economic day: configurable;
- weekly close: every 7 economic days;
- season: 6–8 weeks equivalent.

Do not expose implementation timing as guaranteed until runtime decisions are made.

## 17. Absence policy matrix

### < 24h
Normal progression.

### 1–3 days
- routine accrual;
- no punitive catch-up debt spike;
- compact recap.

### 4–14 days
- cap nonessential negative accrual;
- business productivity may taper;
- loan/living-cost simulation uses protected grace rules;
- missed limited content offers alternative catch-up.

### 15–30 days
- inactive protection mode;
- no catastrophic business liquidation due only to absence;
- comeback/recovery plan generated.

### 30+ days
- freeze or cap nonessential recurring risk;
- return recap summarizes by categories, not every missed transaction;
- user chooses resume/restructure/reset optional non-core plans.

Exact financial rules require economy simulation validation before implementation.

## 18. Recovery plan state machine

`DETECTED -> EXPLAINED -> OPTIONS_PRESENTED -> USER_SELECTED -> IN_PROGRESS -> RECOVERED | REVISED`

Recovery may trigger when:
- free cash flow negative;
- debt burden high;
- business runway low;
- unemployment persists;
- user repeatedly abandons goals.

Options should include at least two viable strategies when possible.

## 19. Softlock score

Internal-only diagnostic, not shown as a stigmatizing score.

Potential factors:
- liquid buffer;
- recurring obligations;
- income reliability;
- debt burden;
- available job eligibility;
- business runway;
- access to public support.

If score exceeds threshold, product prioritizes recovery actions.

## 20. No-ruin rule

No ordinary user should reach a state with:
- no income path;
- no affordable action;
- unavoidable increasing debt;
- no relocation/education/support path.

If such a state exists, it is a P0 design defect.

## 21. Job progression ladder

Each profession should have:
- entry role;
- 2–4 intermediate roles;
- specialist branch;
- leadership/independent branch.

Example Logistics:
- Courier;
- Route Operator;
- Logistics Specialist;
- Fleet Coordinator;
- Supply Chain Manager;
- Logistics Founder.

Each promotion declares:
- skill requirements;
- performance;
- optional certification;
- salary band;
- risk/workload trade-off.

## 22. Skill system

Skill XP comes from:
- relevant work;
- structured training;
- mentorship;
- projects.

Diminishing returns apply to repetitive low-value farming.

Skill progression should unlock new options, not only numeric boosts.

## 23. Job quality

Job cards show:
- pay;
- stability;
- learning;
- flexibility;
- workload;
- city cost context.

A higher salary can be a worse choice for some users. This supports autonomy.

## 24. Business progression

Stages:
`IDEA -> STARTER -> STABLE -> GROWTH -> MULTI_LOCATION -> SPECIALIZED -> LEGACY`

Each stage unlocks:
- product/service depth;
- hiring;
- supplier contracts;
- city expansion;
- partnership;
- advanced analytics.

No stage is unlocked by WLD balance alone.

## 25. Business health score

Explainable components:
- free cash flow;
- gross margin;
- runway;
- demand stability;
- inventory turnover;
- payroll coverage;
- concentration risk.

Used for recommendations, not opaque punishments.

## 26. Company weekly review

Shows:
- revenue;
- costs;
- margin;
- top product/service;
- biggest risk;
- staff status;
- one suggested experiment.

## 27. Economic news personalization

Personalized order:
1. directly affects user's obligations/income;
2. affects job/business/city;
3. season/world importance;
4. general news.

Personalization cannot fabricate or alter facts.

## 28. News consequence cards

Example:
"Central Bank policy rate increased."
Then show:
- your bank savings rate: possible impact;
- your funded loan: fixed/variable simulation impact;
- your business financing: possible impact;
- no-action option.

## 29. Daily Choice content schema

Fields:
- scenario;
- choices;
- immediate effects;
- delayed outcome rules;
- uncertainty band;
- eligibility;
- learning point;
- anti-repetition tags.

Do not use Daily Choice as hidden gambling.

## 30. Daily Choice difficulty

Early:
- clear trade-offs.

Mid:
- 2–3 competing metrics.

Advanced:
- uncertain macro/business context.

Never obscure material downside.

## 31. Career Book taxonomy

Entries:
- firsts;
- promotions;
- recoveries;
- business milestones;
- city moves;
- season history;
- public contribution;
- social partnerships;
- major decisions.

Career Book is permanent unless content violates moderation/privacy rules.

## 32. Story summary generation

AI may summarize history:
"You moved to Harbor City, retrained into logistics, then founded a delivery company."

The source facts must be structured records.
User may disable AI narrative.

## 33. Season template

Every season defines:
- economic theme;
- starting world state;
- target duration;
- personal goal set;
- business goal set;
- community goal;
- one new mechanic/variation;
- catch-up path;
- permanent history reward;
- exit/transition story.

## 34. Season example — Inflation Pressure

World effects:
- rising living-cost index;
- selected input costs;
- policy discussion.

User goals:
- maintain positive cash flow;
- diversify income;
- reduce avoidable spending.

Business:
- margin management;
- supplier alternatives.

Public:
- vote on transit/relief/skills programs.

No forced asset loss.

## 35. Season example — Hiring Boom

Effects:
- more job openings;
- wage competition;
- skill shortages.

Goals:
- promotion;
- reskill;
- hire employees.

## 36. Season example — Supply Shock

Effects:
- selected inputs scarce;
- logistics opportunity rises.

Gameplay:
- supplier diversification;
- inventory strategy;
- city collaboration.

## 37. Social edge lifecycle

`DISCOVERED -> INVITED -> ACTIVE -> STABLE -> DORMANT | ENDED`

Social edge types:
- friend;
- mentor;
- co-owner;
- city collaborator;
- friendly rival.

## 38. Social safety

Users can:
- mute;
- block;
- leave partnership subject to financial governance;
- hide profile;
- disable recommendations.

No social feature can expose exact private finances without explicit consent.

## 39. Mentor matching

Match on:
- skill path;
- timezone;
- language;
- mentoring preference;
- reputation;
- safety status.

Do not match based on wealth alone.

## 40. Co-business task design

Tasks should be asynchronous:
- procurement;
- pricing;
- production;
- marketing abstraction;
- finance review.

Shared progress continues if one member is offline.

## 41. Rival matchmaking

Match bands:
- lifecycle stage;
- feature path;
- comparable recent performance.

Rotate comparison metric to avoid wealth fixation.

## 42. Public project progression

Phases:
`PROPOSED -> ELIGIBILITY_REVIEW -> VOTING -> FUNDED -> EXECUTING -> COMPLETE -> OUTCOME_REVIEW`

Users receive updates at material transitions only.

## 43. City progression

City has:
- level/status;
- infrastructure;
- economic diversity;
- employment;
- affordability;
- public satisfaction proxy.

City progression emerges from aggregate activity and public projects; it cannot mint WLD.

## 44. Veteran progression

Veteran unlocks:
- advanced scenario lab;
- mentor certification;
- company archival tools;
- city advisory participation;
- historical profile themes;
- rare non-power collections.

Veteran status never grants rule bypass.

## 45. Prestige economy

Good prestige sinks:
- office/home cosmetics;
- historical plaques;
- company branding;
- profile themes;
- city monuments with capped recognition.

Avoid:
- stronger credit score for payment;
- better loan odds;
- hidden market advantage;
- superior public-vote weight.

## 46. Re-engagement decision engine

Inputs:
- user consent/preferences;
- dormant duration;
- active goals;
- social events;
- actual new opportunities;
- season/world changes.

Output:
- no message;
- in-app inbox only;
- digest;
- optional push.

Default bias is toward fewer messages.

## 47. Notification eligibility

A non-transactional notification is eligible only if:
- user opted in;
- content is still valid;
- quiet hour rule allows or summary queue is used;
- same topic was not recently sent;
- user did not already act;
- frequency cap remains.

## 48. Notification examples

Good:
"Your logistics training is complete. A new Tier 2 job is now available."

Bad:
"COME BACK NOW OR MISS OUT!"

Good:
"The city project you voted on has reached the funding stage."

Bad:
"Your city needs you urgently!" when not truly urgent.

Apple guidance emphasizes timely high-value notifications, consent, avoiding duplicate reminders and representing urgency accurately. This is adopted as product contract.

## 49. Notification frequency planning defaults

Hypothesis defaults pending observed data:
- transactional/security: as needed;
- user-requested reminder: per request;
- social/opportunity: <= 3 per week combined;
- digest: <= 1 per day, opt-in;
- season: only material milestones.

Experiment may reduce frequency freely. Increasing beyond default requires explicit review.

## 50. Content freshness budget

Each live-ops cycle should budget content across:
- 30% progression;
- 20% economy/world;
- 20% social/community;
- 15% collection/prestige;
- 15% experiments/tutorial improvements.

Percentages are planning starting points, not immutable quotas.

## 51. Content repetition controls

Track content tags.
Avoid showing same:
- Daily Choice archetype;
- job story;
- opportunity type;
- notification topic;
too frequently.

Use cooldown windows.

## 52. Content authoring template

Every live content item defines:
- objective;
- audience;
- prerequisites;
- duration;
- economy effects;
- reward classification;
- localization;
- abuse risks;
- accessibility;
- analytics;
- rollback;
- retirement date.

## 53. Live-ops calendar

Recommended operating rhythm:
- Mon: weekly statement + goals;
- Tue/Wed: opportunity/content rotation;
- Thu: social/public update;
- Fri/weekend: optional event beat;
- season milestones on predeclared cadence.

Avoid daily mandatory events.

## 54. Admin retention command center

Views:
- lifecycle funnel;
- cohort retention;
- goal completion;
- feature breadth/frequency;
- social-edge formation;
- notification delivery/opt-out;
- dormant/reactivation;
- softlock/recovery;
- season health;
- content fatigue.

## 55. Lifecycle funnel dashboard

Show:
- NEW count;
- activated within first session;
- exploring;
- established;
- connected;
- invested;
- veteran;
- dormant;
- reactivated.

Each transition has median time and drop-off.

## 56. Event-based retention dashboard

For each anchor event:
- event date;
- D1/D7/D30 returning;
- feature path;
- acquisition source;
- locale;
- platform.

Anchor events:
- first salary;
- first goal;
- first promotion;
- first business profit;
- first social edge;
- first public vote;
- first Time Machine;
- first AI advice use.

## 57. Feature breadth/frequency matrix

Each user has:
- breadth = number of meaningful feature families used in window;
- frequency = meaningful actions, deduplicated from spam clicks.

High-frequency one-feature farming should not be treated as deep engagement.

## 58. Session health

Track distribution:
- quick;
- normal;
- deep.

Do not optimize toward only longer sessions.
Healthy product should support all three.

## 59. Fatigue signals

Potential signals:
- repeated goal dismissals;
- notification mute;
- opportunity ignore;
- abandoned session after overload;
- decreasing feature breadth;
- same quest repetition.

Response:
- reduce density;
- rotate content;
- offer simplified mode.

## 60. Personalization memory

Store product preferences:
- favored paths;
- dismissed goal categories;
- preferred session mode;
- risk preference;
- notification preferences.

Do not infer sensitive real-world traits.

## 61. AI recommendation contract

Input snapshot is versioned.

Output schema:
- recommendation;
- reason codes;
- evidence references;
- expected benefit;
- downside;
- alternative;
- confidence/uncertainty;
- action type;
- required user confirmation.

## 62. AI "next best action" guard

AI suggestion is allowed only after deterministic eligibility.

If AI unavailable:
- fallback rules must still produce Today/Goals.

## 63. No manipulation requirement

Personalization cannot use known vulnerability to:
- increase spending;
- increase loss aversion;
- increase notification pressure;
- push high-risk debt.

## 64. FTUE metrics

Measure:
- time to starter choice;
- time to first income;
- time to first obligation;
- time to first meaningful choice;
- time to first goal;
- first-session completion;
- first-session confusion/backtracks.

## 65. FTUE abandonment handling

If user leaves:
- preserve state;
- resume at exact step;
- no reset;
- no duplicate tutorial reward.

## 66. Returning-user recap algorithm

Create semantic summary, not transaction dump.

Prioritize:
1. irreversible/material changes;
2. newly available options;
3. completed pending items;
4. goal progress;
5. social/public changes.

Maximum default recap items: 5.

## 67. Backlog compression

If 50 events occurred while absent:
- group by category;
- summarize totals;
- expose drill-down.

Example:
"Your business completed 12 routine orders" rather than 12 cards.

## 68. Economic statement design

Weekly statement sections:
- Starting position;
- Income;
- Costs;
- Taxes/transfers;
- Debt;
- Savings/investment;
- Business;
- Net change;
- Why it changed;
- Next week.

## 69. Personal benchmark design

Use user-relative trends first:
- compared with own previous week;
- compared with chosen goal.

Percentile comparison is optional and coarse.

## 70. Fairness constraints

Do not let:
- early adopter compounding;
- veteran wealth;
- social network size;
create unbeatable advantages.

Use leagues, relative metrics and capped prestige effects.

## 71. Economy-event impact budget

Every live event documents maximum intended effect on:
- median free cash flow;
- P10/P90 outcomes;
- new-user affordability;
- business failure risk;
- debt burden;
- total WLD.

High-impact events require scenario simulation.

## 72. Recovery event budget

Each crisis/live event must include:
- affected cohorts;
- minimum recovery route;
- public support option if relevant;
- exit condition.

## 73. Experiment registry

Fields:
- experiment_id;
- hypothesis;
- owner;
- audience;
- allocation;
- start/end;
- primary metric;
- guardrails;
- statistical method;
- stop rule;
- rollback;
- decision.

## 74. Retention experiment examples

Safe:
- Today card ordering;
- goal explanation wording;
- digest timing;
- number of opportunity cards;
- weekly review visualization.

Requires elevated review:
- reward amount;
- debt grace;
- business failure rules;
- notification frequency.

Prohibited:
- hiding opt-out;
- fake scarcity;
- reducing safety disclosure;
- exploiting known vulnerable cohorts.

## 75. Cohort decision standards

Do not call a feature successful because global D7 rises if:
- new-user softlock worsens;
- notifications are muted more;
- one locale deteriorates;
- high-risk debt increases.

Use segmented guardrails.

## 76. Data freshness

Today screen:
- critical economic data must include freshness timestamp;
- stale data gets explicit stale state;
- no action based on stale sensitive values without revalidation.

## 77. Offline/partial state

If backend partial:
- show cached summary;
- block risky mutations;
- queue no financial write locally unless explicit idempotent design exists.

## 78. Accessibility details

Today screen:
- heading order;
- screen-reader labels;
- progress text, not color-only;
- reduced-motion celebration;
- 200/400% reflow;
- touch target sizes;
- no auto-advancing carousel.

## 79. Localization details

Content items store:
- semantic source key;
- locale version;
- review state;
- fallback policy.

Never machine-translate legal/financial-critical labels without review.

## 80. Korea-specific retention rules

- no cash-value framing;
- no chance-based urgency tied to transferable economic value;
- no casino-style streak/fomo mechanics in life economy;
- bank/credit/loan surfaces clearly labeled simulation;
- notification language avoids real-finance urgency implication.

## 81. Overseas retention rules

- locale-specific season storytelling;
- local quiet hours/timezone;
- jurisdiction flags;
- region-specific terms without claiming legal accuracy.

## 82. SEO-to-account continuity

Public calculator session can create anonymous scenario token.

After signup:
- user may explicitly import scenario;
- imported scenario remains sandbox until user chooses goals;
- no automatic financial actions.

## 83. Guest return

Anonymous guest may return to recent calculator state via privacy-preserving local/session mechanism where appropriate.
Do not create covert identity tracking.

## 84. Public profile retention role

Profile gives:
- history;
- identity;
- shareable achievements.

It must not become pressure to expose wealth.

## 85. Share-card rules

Shareable:
- milestone;
- season result;
- job/career title;
- business anniversary;
- city contribution.

Avoid exact balances and debt.

## 86. Content retirement

Retire content when:
- low utility;
- high confusion;
- exploit risk;
- repetitive fatigue;
- outdated world assumptions.

Retirement should not invalidate already-earned permanent history.

## 87. Operational SLA planning

Retention content system should define future runtime SLAs for:
- Today load;
- goal generation;
- notification queue;
- recap generation;
- weekly statement.

Exact SLO numbers require production measurement before authority.

## 88. Failure modes

P0:
- duplicate economic reward;
- irreversible absence loss;
- no recovery path;
- hidden debt/cost;
- AI autonomous economic mutation;
- notification spam bypassing preferences.

P1:
- repetitive goals;
- irrelevant opportunities;
- poor recap;
- excessive content density.

## 89. Database additions/refinements

Suggested tables:
- `life_progression_states`;
- `user_goal_slots`;
- `goal_candidates`;
- `opportunity_candidates`;
- `return_recap_items`;
- `user_content_exposures`;
- `content_cooldowns`;
- `economic_pending_states`;
- `absence_protection_states`;
- `recovery_plan_options`;
- `social_edge_states`;
- `season_user_progress`;
- `retention_event_anchors`;
- `notification_eligibility_decisions`;
- `user_session_mode_preferences`.

## 90. API surface refinements

- `GET /life-economy/home`
- `GET /life-economy/today`
- `GET /life-economy/goal-stack`
- `POST /life-economy/goals/:id/pin`
- `POST /life-economy/goals/:id/dismiss`
- `GET /life-economy/opportunities`
- `GET /life-economy/return-recap`
- `GET /life-economy/weekly-statement`
- `GET /life-economy/pending`
- `GET /life-economy/recovery`
- `POST /life-economy/recovery/:optionId/select`
- `GET /social/economic-edges`
- `GET /seasons/current/progress`
- `GET/PUT /users/me/engagement-preferences`

## 91. Idempotency and financial writes

All financial mutations remain separate from retention services.
Retention/goal services may request actions through domain APIs but cannot directly mutate ledger balances.

## 92. Privacy

Retention analytics must avoid:
- unnecessary message content;
- sensitive inferred traits;
- external identity enrichment.

Use pseudonymous product identifiers and minimal event payloads.

## 93. Admin roles

Suggested permissions:
- content_editor;
- liveops_manager;
- retention_analyst;
- economy_reviewer;
- notification_manager.

No single content role gains ledger mutation authority.

## 94. Change approval

High-impact live-ops changes require:
- preview;
- economy simulation;
- localization check;
- safety review;
- audit reason;
- rollback plan.

## 95. Content preview

Admin preview must show:
- mobile;
- desktop;
- locale;
- lifecycle cohort;
- economic state;
- accessibility state.

## 96. Content simulation

Before publish:
- eligible user count;
- expected economic effect range;
- notification volume;
- conflicts/cooldowns;
- localization completeness.

## 97. Retention acceptance metrics

A feature is not accepted on engagement lift alone.
Required:
- primary retention/progression benefit;
- no material softlock increase;
- no unacceptable notification opt-out increase;
- no economic invariant failure;
- no accessibility regression;
- no cohort harm hidden by aggregate lift.

## 98. Product north star

Recommended north-star composite rather than one metric:

`HealthyContinuity = meaningful_return_rate * goal_progress_quality * recovery_health * breadth_factor`

This is a conceptual framework, not a production formula until calibrated.

## 99. Reference basis

- Unity 2026 Game Development Report: current studio use of daily missions, achievements, leaderboards, social/live-ops and regular content updates.
- Unity 2025 Gaming Report: live-ops, social, event and content-update practices.
- Self-Determination Theory / PENS: autonomy, competence, relatedness.
- Person-Based Approach research: choice, graded goals, useful feedback and positive autonomy-supportive communication.
- GameAnalytics: retention, cohorts, progression and engagement analytics.
- Apple HIG Notifications: consent, high-value/timely content, avoid duplicate reminders, accurate urgency.
- Android notification guidance: runtime permission and contextual permission timing.
- FTC dark-pattern guidance: prohibit deceptive urgency, obstruction and manipulation.

## 100. Definition of Done

v528 planning is complete when:
- lifecycle states have explicit entry/exit criteria;
- screen hierarchy and session modes are defined;
- progressive unlocks and starter paths are defined;
- goal/opportunity object and ranking rules exist;
- absence and recovery algorithms are specified;
- job/business/season/social/veteran progression is concrete;
- notification eligibility and frequency rules are implementable;
- live-ops calendar/admin tooling/experiment registry are defined;
- DB/API additions are enumerated;
- privacy/accessibility/domestic/overseas rules exist;
- authority and work/update records are synchronized;
- runtime/Test/Production is not falsely claimed.
