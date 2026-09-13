# Woldeok Moneyverse — Virtual Casino Game System Specification

> Version: v2026.09.12.28
> Status: implementation-oriented planning specification
> Date: 2026-09-12
> Korean counterpart: [CASINO_GAME_SYSTEM_SPEC.ko.md](CASINO_GAME_SYSTEM_SPEC.ko.md)
> Parent specs: `PROJECT_PLAN.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md` when merged

## 1. Product boundary

The casino is optional virtual entertainment using service-internal WLD only. It is not a real-money gambling product, does not promise cash value, and must not support cash-out, external prizes, token redemption, crypto conversion, gift-card redemption, or any path that turns a game result into real-world value.

Casino launch is fail-closed by jurisdiction and distribution channel. A game can be implemented but remain disabled until the applicable legal, age-rating, store-policy, and operational gates pass.

The casino must never be required for account progression, profession progression, season completion, competitive ranking, or access to economically important content. No user should be pressured to play probability games to remain competitive.

## 2. Legal and distribution gates

### 2.1 Korea

- Treat simulated gambling/casino-style content as adult-oriented/high-risk content for distribution planning.
- Before Korean mobile-store distribution, obtain the required game rating/review and verify the current Korean Game Industry Promotion Act, GRAC requirements, probability disclosure obligations, and store-specific policies.
- The current Google Play Korea guidance states that simulated gambling functionality is unsuitable for users under 19 and casino-style games require a GRAC rating certificate before distribution.
- Korean mobile distribution may ship with casino routes feature-disabled even if the web service offers them under a separately reviewed policy.
- Any paid randomized item system is outside this casino spec and requires its own probability-item disclosure review.

### 2.2 United States

- Keep the product strictly non-redeemable and non-cash-value.
- Perform state-by-state legal review before broadly enabling social-casino-style play. Where counsel identifies material sweepstakes/gambling risk, disable the feature by jurisdiction.
- Default product policy is 18+ for casino access in the U.S. even where a lower age might technically be possible; this is a safety/product choice, not a statement of universal legal minimum age.
- COPPA/child-directed traffic must not enter casino gameplay.

### 2.3 App stores

- Apple treats gambling and frequent simulated gambling as high-risk age-rating/review content. Store submissions must accurately disclose chance-based content.
- Google Play policies can restrict simulated gambling depending on app category, region, and relationship to gambling advertising/content. Casino availability must therefore be controlled separately for web, Android, and iOS.
- App-store compliance is a release gate; web availability does not imply native-app availability.

### 2.4 Funding boundary

Casino stake must never originate from money purchased specifically for chance play. If Moneyverse later sells WLD or any convertible paid currency, the casino must either:
1. reject paid-origin balances through provenance-aware spend rules; or
2. use a separate non-purchasable, non-transferable entertainment balance earned only through ordinary gameplay; or
3. remain disabled until legal/product review approves a different model.

Rewarded ads must not grant casino stakes, extra spins, higher odds, retry opportunities, or loss recovery.

## 3. Safety limits — justified exception to unlimited-default policy

Casino limits are not economy-balancing hardcaps. They are protective limits justified by probability-game safety, legal/store review, fraud control, and loss exposure.

Current baseline remains:
- minimum stake: 10 WLD;
- maximum stake per play: 200 WLD;
- daily total stake: 2,000 WLD;
- daily realized loss: 1,000 WLD.

All values are jurisdiction-aware/versioned config. Users can set stricter self-limits. A self-exclusion lock cannot be shortened while active. Increasing a personal limit should support a cooling-off delay; decreasing it applies immediately.

No VIP tier, subscription, ad purchase, cosmetic purchase, or season level can raise the protective limits.

## 4. Common math contract

All games are server-authoritative. The client submits `game_code`, `bet_option`, `stake_wld`, `idempotency_key`, and current terms/version acknowledgement. The server validates eligibility and limits, obtains cryptographically secure randomness, resolves the outcome, atomically settles the ledger, stores the immutable game receipt, and returns that receipt. Animation is derived from the receipt only.

The launch target baseline RTP for simple chance games is 95%. RTP is disclosed per game and config version. A changed payout table creates a new immutable `game_math_version`; historical receipts retain the version used at settlement.

`gross_payout = floor(stake × payout_basis_points / 10000)`

If a payout multiplier can create fractional WLD, the UI must disclose integer rounding. Prefer stake increments that preserve exact integer payouts. Server/database arithmetic remains integer-safe.

The game service must never dynamically worsen an individual user's odds based on wealth, recent wins, losses, monetization status, engagement, or risk score.

## 5. Launch game catalog

Seven implementation-ready games are specified for this pass.

| Code | Game | Player choice | Win probability | Gross payout | Baseline RTP |
| --- | --- | --- | ---: | ---: | ---: |
| `COIN_FLIP` | Coin Flip | heads/tails | 50% | 1.90× | 95% |
| `DICE_PARITY` | Dice Parity | odd/even | 50% | 1.90× | 95% |
| `DICE_EXACT` | Exact Dice | number 1–6 | 1/6 | 5.70× | 95% |
| `HIGH_LOW_20` | High / Low 20 | 1–10 or 11–20 | 50% | 1.90× | 95% |
| `TREASURE_4` | Treasure Vault | chest 1–4 | 25% | 3.80× | 95% |
| `GEM_MATCH_5` | Gem Match | choose one of 5 gem colors | 20% | 4.75× | 95% |
| `WHEEL_20` | 20-Segment Wheel | tier/color category | variable | option-specific | 95% target |

### 5.1 Coin Flip

**Flow:** choose Heads or Tails → enter stake → review disclosed 50% / 1.90× terms → confirm → receipt resolves `HEADS` or `TAILS`.

Receipt fields: `coin_side`, `selected_side`, `is_win`, `stake_wld`, `gross_payout_wld`, `net_change_wld`, `math_version`.

UI uses a short coin animation but shows the final face only after the receipt exists. No near-miss animation.

### 5.2 Dice Parity

Server generates an integer 1–6 uniformly. Odd wins on 1/3/5; even wins on 2/4/6. Payout 1.90× gross.

UI must show the actual die result and parity label. The animation seed is visual-only and cannot determine settlement.

### 5.3 Exact Dice

User chooses one number 1–6. Uniform server die roll. Probability 1/6. Gross payout 5.70×.

Because variance is higher, the game card displays `1 in 6` alongside `16.67%` and shows the payout before confirmation.

### 5.4 High / Low 20

Server samples one uniform integer 1–20. `LOW` wins on 1–10 and `HIGH` wins on 11–20. Probability 50%, payout 1.90×.

This replaces card-based high/low for P0 to avoid deck-state ambiguity, hidden card-counting assumptions, and more complex probability disclosures. A future card version requires a separate math spec.

### 5.5 Treasure Vault

Four visually identical chests are shown. Exactly one server-selected chest is the winning chest. User selects one chest before resolution. Probability 25%, payout 3.80×.

No chest may visually glow, shake, reorder, or imply a higher chance before choice. Chest positions are presentation-only and must not leak RNG state.

### 5.6 Gem Match

Five gem colors are presented with equal probability. The player chooses one color. The server independently selects one of five uniform colors. Match probability 20%, payout 4.75×.

Accessibility: each gem has text/icon identity; color alone must never convey the selection/result.

### 5.7 20-Segment Wheel

Use a fixed 20-segment logical wheel. Initial option families:
- Blue: 10 segments, probability 50%, payout 1.90×;
- Gold: 5 segments, probability 25%, payout 3.80×;
- Violet: 2 segments, probability 10%, payout 9.50×.

The remaining 3 segments are non-winning neutral segments for those option families. The player chooses exactly one option before spin. Each option independently targets 95% RTP.

The server selects the segment first and returns `segment_index` and `segment_class`; the wheel animation then lands on that exact segment. Animation duration does not change probability.

## 6. Slots theme — deferred, not P0 launch

The repository already contains a slots-themed view. For this plan, slot-style play is not part of the P0 seven-game launch contract. Frequent simulated-gambling imagery creates greater age-rating/store-policy risk. Keep it feature-gated until legal/store review approves an explicit reel math table, symbol distribution, payout table, age rating, and jurisdiction/channel rollout.

No current theme is allowed to invent a `777` or jackpot state after a server loss.

## 7. Ledger and economy contract

Casino must use the ordinary append-only double-entry ledger.

Recommended transaction types:
- `CASINO_STAKE_HOLD` — stake reserved while a play settles;
- `CASINO_STAKE_TRANSFER` — settled stake moved to casino system reserve;
- `CASINO_PAYOUT_TRANSFER` — gross payout transferred from casino reserve to user;
- `CASINO_HOLD_RELEASE` — failed/cancelled pre-settlement request releases hold;
- `CASINO_PROFIT_BURN` — optional explicit economy-policy burn of realized house reserve surplus.

A transfer to a casino system account is **TRANSFER**, not a hard sink. Only an explicit irreversible burn entry is **HARD_SINK**. Casino must not be required as a primary economy sink; the product economy must remain sustainable without probability play.

Payouts must come from a bounded system reserve/treasury policy, not an invisible unlimited mint. If reserve coverage falls below an operational threshold, casino entry becomes unavailable before settlement integrity is endangered.

## 8. Settlement state machine and idempotency

`REQUESTED → ELIGIBILITY_VERIFIED → STAKE_HELD → RNG_RESOLVED → SETTLED → RECEIPT_AVAILABLE`

Failure branches: `REJECTED`, `HOLD_RELEASED`, `RECONCILIATION_REQUIRED`.

Idempotency key scope: `(user_id, idempotency_key)`. Reusing a key with a different game, option, or stake returns a conflict and never creates a second play.

Suggested deterministic settlement key:
`casino:{user_id}:{play_id}:{math_version}`

Atomic settlement must guarantee exactly one accepted stake and exactly one corresponding payout/no-payout result.

## 9. Database model

Recommended tables/views:

`casino_game_definitions`
- `game_code PK`, `enabled`, `distribution_channel`, `jurisdiction_policy_id`, `math_version`, `rtp_basis_points`, `min_stake`, `max_stake`, `stake_increment`, `terms_version`.

`casino_game_options`
- game/version/option, probability numerator/denominator, payout basis points, display order.

`casino_plays`
- `play_id UUID PK`, `user_id`, `game_code`, `option_code`, `stake_wld BIGINT`, `math_version`, `rng_result`, `gross_payout_wld`, `net_change_wld`, `status`, `idempotency_key`, timestamps, transaction IDs.

`casino_player_safety`
- self-limit values, lock expiry, pending limit increase effective time, jurisdiction/age eligibility status.

`casino_terms_acceptances`
- user, terms version, math disclosure version, accepted time, locale.

Do not store raw RNG secrets in ordinary analytics logs.

## 10. API contract

P0:
- `GET /casino/games` — eligible games, disclosed math, limits, availability reason.
- `GET /casino/safety` — current self-limits/lock state.
- `PUT /casino/safety` — tighten limits immediately; increases follow cooling-off policy.
- `POST /casino/plays` — idempotent play request.
- `GET /casino/plays/:playId` — actor-scoped receipt.
- `GET /casino/history` — actor-scoped paginated history.
- `POST /casino/self-exclusion` — activate lock/self-exclusion.

The play API does not accept win probability, payout multiplier, result, or RNG seed from the client.

## 11. UI/UX

### Casino lobby

Desktop: safety/status banner → current limit usage → seven game cards → recent history. Mobile: safety banner and limits remain above the game grid; game cards become one/two-column cards. Do not place ads in casino routes.

Each game card shows probability, gross payout, RTP link, current min/max stake, and a `How it works` link before the Play CTA.

### Game screen

Order: game title + virtual-only notice → probability/payout summary → choice controls → stake field → estimated win payout → daily safety usage → confirm button → receipt/history.

Confirmation text must show stake, possible gross payout, and that losing forfeits the stake. Avoid `almost won`, streak pressure, celebratory loss-recovery messaging, countdowns, or prompts to double the next bet.

### Result states

- Win: neutral-positive acknowledgement and receipt.
- Loss: neutral acknowledgement; no `win it back` CTA.
- Error: no outcome animation; show whether stake was never taken or has been safely released.
- Limit reached/self-excluded: explain safety state, not an upsell.

Auto-play, turbo-play, loss-chasing, martingale helpers, and one-click repeat after loss are not P0 features.

## 12. Analytics and safety dashboard

Events:
- `casino_lobby_view`
- `casino_game_terms_view`
- `casino_play_confirm`
- `casino_play_settled`
- `casino_play_rejected`
- `casino_self_limit_changed`
- `casino_self_exclusion_started`
- `casino_history_view`

Dashboard metrics:
- plays/users by game and jurisdiction;
- total stake transfer, payout transfer, net house result;
- observed RTP vs configured RTP with statistical confidence bands;
- P50/P90/P99 daily stake and realized loss;
- protective-limit trigger rate;
- self-limit adoption and self-exclusion counts;
- duplicate/idempotency rejection rate;
- failed settlement / reconciliation count;
- reserve coverage ratio;
- suspected automation/multi-account patterns.

Do not optimize product success primarily for stake volume, user loss, or time spent gambling. Guardrails include retention outside casino, self-limit use, complaint rate, and probability-game share of total session time.

## 13. RNG and QA acceptance

- Use a cryptographically secure server RNG appropriate to the platform/runtime.
- Automated distribution tests validate each option against theoretical probability across large simulated samples in non-production environments.
- Exact payout/RTP calculations are unit-tested using integer arithmetic.
- Concurrent duplicate requests prove one settlement only.
- Refresh/retry/read-after-write returns the same immutable receipt.
- UI animation is tested against stored result so visual and ledger outcomes cannot diverge.
- Production QA uses only approved low-impact test accounts and non-destructive stakes; bulk probability simulation never runs against production balances.

## 14. Abuse prevention

Detect or protect against:
- request replay and modified payload reuse;
- concurrent duplicate clicks;
- forged payout/result fields;
- client clock manipulation;
- automation/bot burst patterns;
- multi-account attempts to evade protective limits;
- paid-balance provenance bypass;
- stale terms/math-version requests;
- integer overflow/unsafe JS number conversion;
- RNG endpoint or log leakage.

Rate limits are security/system protections and are not marketed as gameplay limits.

## 15. Admin console

Admin can view game availability, math version, configured probabilities/payouts, observed RTP, reserve coverage, safety-limit metrics, jurisdiction/channel flags, settlement errors, and reconciliation status.

A math/payout change must create a new version with preview, reason, effective time, rollback/disable plan, and audit entry. Existing receipts are immutable. High-risk config changes require current admin security controls including reauthentication/second factor where applicable.

Emergency controls:
- disable all new plays while allowing history/receipts;
- disable one game/option;
- jurisdiction/channel kill switch;
- freeze payout-policy rollout before effective time;
- enter reconciliation mode if ledger invariant fails.

## 16. Season and reward integration

Casino participation is not required for season completion. Seasons may offer an optional educational task such as reading probability/RTP explanations, but must not reward higher stake volume or greater losses.

No season booster may improve casino odds or payout. Cosmetic casino-table themes, non-functional badges, and profile collectibles are allowed only if they do not imply probability advantage.

## 17. Definition of Done

A casino game is launch-ready only when:
1. math/probability/payout/RTP are documented and unit-tested;
2. server RNG and immutable receipt drive the visual result;
3. idempotent atomic ledger settlement passes concurrency tests;
4. safety limits/self-exclusion work and cannot be monetized away;
5. age/jurisdiction/channel policy is explicitly configured;
6. Korean/U.S. legal/store review status is recorded;
7. no paid-origin stake path exists without separate approval;
8. accessibility, responsive, empty/error/limit states pass QA;
9. observed-RTP monitoring and reserve coverage alerts exist;
10. production rollout uses test-server exact-SHA verification before enablement.

## 18. External reference notes for this version

- Apple App Review Guidelines §5.3 classify gambling as highly regulated and require legal vetting; App Store age-rating definitions treat frequent simulated gambling as 18+ content.
- Google Play's Korea distribution guidance states simulated gambling is unsuitable for users under 19 and casino-style games require GRAC rating review/certification before Korean distribution.
- Google Play real-money gambling/games policy and distribution rules require channel-specific review; web eligibility does not automatically make native-app casino content acceptable.

These references are product-policy inputs, not legal advice. Final launch remains `legal review required` for Korea/U.S. casino availability.

## 19. Version record

### v2026.09.12.28 — casino game system pass

- Expanded the existing 3-game math baseline into seven explicitly specified games.
- Added legal/distribution gates for Korea, U.S., web, iOS and Android.
- Preserved protective casino limits as a justified safety exception to unlimited-default gameplay.
- Added paid-balance separation, no-ad-stake rule, ledger semantics, reserve model, state machine, DB/API contracts, UX/safety states, analytics, RNG QA, abuse prevention and admin kill switches.
- Deferred slot-style launch pending stricter legal/store/math review.

Documentation-only. No test-server or Production deployment is part of this version.