# Woldeok Moneyverse — Arcade & Company Game Specification

> Version: v2026.09.26.444
> Status: PLANNED / implementation requires rating-channel QA
> Korean counterpart: `MONEYVERSE_ARCADE_GAME_SPEC.ko.md`
> Parents: `PROJECT_PLAN.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md`, `CASINO_GAME_SYSTEM_SPEC.md`

## 1. Product thesis
Moneyverse Arcade is a permanent core entertainment layer: short rounds, strong feedback, skill/choice, combos, fever, personal bests, builds, collection and cooperative goals. It is not a casino reskin and never requires a wager to create tension.

Core round: `choose -> act for 20–180 seconds -> combo/fever -> clear/fail -> score/mastery/collection -> stop freely or choose next round`.

Starter access requires no WLD, inventory, company ownership or prior profession. Missing a day never destroys permanent progress.

## 2. Fictional company universe
These are working in-world names and require trademark/domain clearance before public branding.

| Company | Industry | Starter game | Advanced game |
| --- | --- | --- | --- |
| Monevia Mart | retail/convenience | Quick Checkout | Store Rush / Black Friday Boss |
| Velocart Logistics | delivery/logistics | Parcel Sort | Delivery Dash / Network Crisis |
| Ironveil Works | manufacturing | Bolt Match | Factory Fever / Production Line Boss |
| Nexora Systems | software/AI | Bug Tap | Incident Rush / Server Meltdown |
| Savorin Kitchen | food | Order Match | Kitchen Rush / Festival Service |
| Moventra Transit | transport | Gate Flow | Route Control / City Surge |
| Portalis Trade | logistics/trade | Cargo Match | Port Stack / Storm Recovery |
| Arclume Studio | construction/design | Tile Fit | Skyline Stack / City Project |
| Voltide Energy | utilities | Circuit Link | Grid Balance / Blackout Boss |
| Verdara Farm | agriculture | Harvest Timing | Farm Chain / Weather Crisis |
| Chronova Media | media/news | Headline Match | Newsroom Rush / Breaking Event |
| CarePulse Clinic | fictional care ops | Queue Sort | Clinic Flow; no diagnosis/medical advice |
| Astriva Hotels | hospitality | Room Match | Hotel Rush / Convention Day |
| Circlora Works | recycling | Material Sort | Recycling Combo / City Cleanup |
| Orbitalis Freight | sci-fi logistics | Dock Timing | Orbital Cargo / Meteor Event |
| Velmora Atelier | crafting/fashion | Pattern Match | Combo Craft / Collection Season |

## 3. Starter Arcade — minute-zero playable
1. **Quick Tap Fever** — hit timing zones; PERFECT chains fill Fever. 20–40s.
2. **Parcel Sort** — route shapes/colors to destinations under increasing speed. 30–60s.
3. **Order Match** — read 2–6 customer orders and assemble correctly. 45–90s.
4. **Tile Fit** — fit limited pieces into a compact build target. 45–120s.
5. **Bug Tap** — spot rule-breaking UI/code symbols; combo for consecutive correct detections. 30–60s.
6. **Circuit Link** — connect power nodes under move/time constraints. 60–120s.
7. **Cargo Stack** — spatial stacking without overflow; risk is score/combo only. 60–120s.
8. **Harvest Beat** — rhythm/timing harvest with accessibility alternatives to strict timing. 30–90s.
9. **Queue Control** — prioritize fictional service requests by visible rules. 60–120s.
10. **Mini Shop** — receive, stock, pick and checkout a tiny shop in 60–120s.

First-session sequence: Quick Tap -> first PERFECT -> deterministic starter reward -> Mini Shop -> first Fever -> choose a company -> company starter mission -> first cosmetic/title. No random chest is required.

## 4. Core/high-intensity Arcade
11. **Moneyverse Rush** — rapid event decisions; escalating difficulty, combo and Fever.
12. **Store Rush** — multi-station retail service under time pressure.
13. **Kitchen Rush** — recipe/order sequencing and station management.
14. **Delivery Dash** — route/order optimization under changing fictional traffic events.
15. **Factory Fever** — synchronize machines, buffers and quality checks.
16. **Market Panic** — fictional inventory/demand management; no real securities, cash wager or investment-return representation.
17. **Merge Workshop** — deterministic merge puzzle using known pieces/recipes; no paid random input.
18. **Skyline Stack** — spatial construction and stability puzzle.
19. **Grid Balance** — route finite energy supply to changing demand.
20. **Newsroom Rush** — classify/sequence fictional stories against visible editorial rules.
21. **Incident Commander** — prioritize fictional software incidents and restore systems.
22. **Port Stack** — cargo placement, crane sequencing and ship deadlines.
23. **Rhythm Shift** — beat-based work sequence with non-audio accessibility cues.
24. **Pattern Forge** — memorize/compose production patterns with escalating transformations.
25. **Chain Reaction Lab** — arrange deterministic components then trigger a satisfying cascade.
26. **Ghost Sprint** — race the user's verified previous run, never another user's wagered stake.
27. **Daily Remix** — daily deterministic ruleset/seed shared for fair score comparison; no punitive attendance streak.
28. **Weekly Boss** — multi-stage company crisis with individual + community contribution.
29. **City Project** — all companies contribute toward a persistent world construction goal.
30. **Season Expedition** — branching sequence of skill rooms; route choice changes challenges, not paid odds.

## 5. Dopamine/feedback design without wagering
- combo ladder, PERFECT/GREAT feedback and Fever meter;
- near-completion progress, personal-best delta and instant replay summary;
- deterministic unlock reveal, collection-set completion and evolving company space;
- escalating audiovisual feedback with reduced-motion/sound/haptic controls;
- short rounds with explicit Finish/Continue choice after settlement;
- route/build choices create replay variation;
- difficulty raises execution pressure, never financial loss exposure.

Never use loss-chasing copy, near-miss gambling presentation, fake countdowns/unread state, forced infinite play, paid retries that protect a stake, purchasable score multipliers, paid random rewards or daily-reset punishment.

## 6. Progression
`Account start -> Starter Arcade -> choose company -> trainee mastery -> company games -> specialist mechanics -> cross-company contracts -> Weekly Boss -> City Project -> Season Expedition`.

Progress tracks are mastery, company reputation, collection book, personal best, cosmetics/titles and world-project history. WLD is secondary and bounded. A rich user cannot buy leaderboard power, Fever probability, score multiplier or Boss damage.

## 7. Economy/API integrity
Material rewards are previewed before the round. Client score and completion claims are untrusted. Server validates activity version, seed/rules, proof/events as appropriate, anti-replay and eligibility; reward mutation is atomic/idempotent and ledgered. Repeated low-value farming uses diminishing issuance and abuse controls rather than arbitrary gameplay lockouts.

Suggested entities: `arcade_game_definition`, `arcade_ruleset_version`, `arcade_run`, `arcade_run_proof`, `arcade_personal_best`, `arcade_mastery`, `company_reputation`, `arcade_collection_progress`, `community_project_contribution`.

## 8. Jurisdiction boundary
`ARCADE_SKILL` is a separate feature code from `CASINO`. Casino policy never silently enables Arcade gambling mechanics, and Arcade availability never implies casino approval.

- Korea: CASINO remains fail-closed until required evidence; Arcade avoids stake/chance/prize and casino simulation but still follows applicable game rating/channel review.
- Australia: avoid simulated gambling and paid chance mechanics in Arcade; current classification rules place simulated gambling at R18+ and paid chance purchases at minimum M.
- UK: preserve non-cash/non-tradeable reward boundaries; value-convertibility can change gambling analysis.
- Germany/EU: avoid gambling-like and purchase-pressure mechanics; retain age/rating/consumer-protection review.
- Japan: initial Arcade has no paid random-item mechanic; any future random paid item is a separate review/disclosure project.
- US: Arcade creates no thing-of-value wager; Casino remains state-aware and independently gated.
- Unreviewed markets: no assumption of exemption; local rating/store review remains required.

## 9. Research synthesis
Reference families include time-management/co-op service games, deterministic spatial/tile puzzles, job-simulation decision games, roguelite build variety, rhythm/timing, merge/crafting, route optimization, factory/logistics, personal-best racing and cooperative world goals. Mechanics are inspirations only; art, names, rules, assets and exact level designs must be original.

Research-count rule: broad discovery may exceed tens of thousands of indexed candidates across stores/searches, but no document may claim 50,000 individually reviewed references without a reproducible corpus. Evidence promotion requires deduplication and authority/quality review.

## 10. Acceptance
Starter game playable with zero WLD; no stake/chance/prize economic loop; no paid random reward; no cash-out; deterministic material reward disclosure; server-authoritative settlement; accessibility alternatives; no punitive absence; jurisdiction evidence; economy reconciliation; anti-replay; and five complete responsive QA passes on every affected user/admin surface.
