# Woldeok Moneyverse — Dormant Inventory Reuse & Curation Retention Growth Spec

> Version: v2026.09.15.101
> Status: Living consumer-growth specification
> Date: 2026-09-15
> Parent plans: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`, `IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.md`
> Korean counterpart: [DORMANT_INVENTORY_REUSE_CURATION_RETENTION_GROWTH_SPEC.ko.md](DORMANT_INVENTORY_REUSE_CURATION_RETENTION_GROWTH_SPEC.ko.md)
> Change type: documentation only; no runtime, DB, API, auth, migration, scheduler, infrastructure or security-code change

## 1. Gap selected

The latest product reality now combines two important changes. `v2026.09.15.98` made dormant holdings easier to discover through `unequipped` filtering and `oldest` acquisition sorting in the member marketplace workbench. While this planning run was in progress, `main` advanced again to `v2026.09.15.100`, consolidating additional cosmetic sink items. Acquisition/ownership breadth is therefore expanding at the same time that older holdings are becoming easier to find.

The largest remaining retention gap is:

**When users discover old, unequipped or duplicated possessions, can Moneyverse turn them into renewed identity, memory and goals, or does a larger catalog merely produce more clutter and another reason to acquire more?**

The current `/marketplace` remains a member-only preparation workbench. It explicitly does not expose listing or purchase mutations, and player-to-player transfer/crafting settlement remain disabled until authoritative contracts are implemented and verified. This spec preserves that boundary and does not design trading APIs, escrow, crafting settlement, destruction rules or database changes.

## 2. Consumer promise

**Old items should become memories, displays, useful plans or deliberate cleanup decisions — not clutter that pressures the user to buy, sell or speculate.**

An old holding should help answer:
- Why did I get this?
- Does it still fit my identity, profession, collection or season history?
- Should I feature it again, group it into a chapter, hide it from everyday view, or simply leave it alone?
- If trading/crafting becomes available later, is that clearly future and conditional rather than implied today?
- Can I finish a cleanup session feeling more ownership without acquiring anything new?

Do not create artificial inventory scarcity, storage pressure, forced liquidation, hidden expiry or transaction requirements just to manufacture engagement.

## 3. Stewardship ladder

The durable ownership loop should be:

`Acquire → Use → Curate → Reinterpret`

**Acquire:** obtain something because it supports identity, collection, utility, season or a meaningful reward.

**Use:** equip, display or otherwise make it part of the current experience.

**Curate:** decide what matters now through feature/group/display/archive-from-everyday-view/later choices.

**Reinterpret:** let an older item gain new meaning through a later season, profession path, retrospective, exhibit or community project.

Age and unequipped state are discovery signals, not a judgment that an item is “useless.”

## 4. Reversible cleanup decision ladder

When an older unequipped item is surfaced, the default consumer choices should remain reversible where possible:
1. keep visible;
2. feature/use again;
3. group into a season, profession, theme or chapter;
4. archive from everyday view without pretending ownership/history disappeared;
5. revisit later without penalty;
6. prepare for a future supported action only after that action is separately implemented and validated.

The current marketplace filters can help find candidates, but filter results must never imply tradability or transfer eligibility.

## 5. Lifecycle role

### First 30 seconds / first 3 minutes / first session
Inventory cleanup is not a new-user activation requirement. The persistent-world promise, game-only WLD/WDX boundary, a useful sample and one authored interest come first. A first purchase, marketplace visit or cleanup action is not activation.

### D1
Restore the thread the user chose. Do not give a one-day-old account housekeeping work simply to raise engagement.

### D3
Encourage meaningful use or understanding of something already owned before teaching optimization or disposal.

### D7
If a small collection exists, offer one light curation action such as featuring or grouping an item. Taste formation matters more than inventory turnover.

### D14
For users with enough holdings, offer an optional organization opportunity using recent/oldest, equipped/unequipped, quantity or serialized context. `Not now` is a valid outcome.

### D30
Success means the user can see what they acquired, still use, grouped into chapters, deliberately set aside and later rediscovered. The goal is **inventory with history and authorship**, not minimum transaction count.

## 6. Session design

### 1–3 minute quick check
- find one old unequipped item;
- re-feature an old favorite;
- group one item;
- choose `later`;
- exit with no loss.

### 5–15 minute meaningful session
Use a narrow filter such as `oldest + unequipped`, inspect only a small number of holdings, make a few intentional curation decisions, show a concise before/after summary, then allow an explicit finish.

### 30+ minute deep session
Build a season archive, redesign a gallery/identity space, compare old and current themes, create a personal retrospective, prepare a public-safe exhibit, or plan future supported trading/crafting only when those systems truly exist.

Do not add artificial action caps to curation itself.

## 7. Reinterpretation loops

- **Season:** show how an older theme connects to a new chapter without implying resale appreciation.
- **Profession:** rediscover profession-related cosmetics or objects when the user returns to that path.
- **Collection:** connect an isolated old piece to a later chapter or exhibit.
- **Personal retrospective:** surface truthful context such as “you first acquired this during…” and let the user decide whether to feature it again.
- **Community:** permit opt-in, public-safe contributions to club/city/museum-style projects without exposing private inventory by default.

Inventory age should become narrative context, not `sell now` pressure.

## 8. Marketplace boundary

Until separately implemented and verified, growth copy must not imply:
- another user can buy the item now;
- any displayed value is a guaranteed market price;
- an item can be instantly sold for WLD;
- age, serial number or rarity guarantees appreciation;
- cleanup equals listing;
- `oldest` or `unequipped` means transfer eligible.

If player trading later ships, transaction volume alone is not a retention KPI. Ownership, provenance, safety and fair participation remain primary.

Future listing, crafting/recycling and gifting require separate product/security/fraud/legal QA. Before irreversible or value-changing actions, users must understand what leaves their control, fees/price consequences, reversibility, provenance/history loss, probabilistic outputs where relevant and the game-only nature of WLD/WDX.

## 9. Viral / acquisition / SEO

Preferred share artifacts express authored transformation:
- before/after gallery cleanup;
- rediscovered favorite;
- season archive chapter;
- profession-history shelf;
- curated older set;
- opt-in community exhibit contribution.

Recipient loop:

`public-safe artifact → understand theme/story → useful sample → authored interest → contextual signup if needed → meaningful action → D7`

Private holdings are not SEO assets. Do not index user holdings, acquisition dates tied to accounts, serialized private holdings, purchase history, cleanup recommendations, draft listing state, balances, debt, casino, security or recovery state.

Prefer public season retrospectives, exhibit/curation guides, fictional-item lore/provenance and official explanations of the workbench-vs-future-trading boundary. Do not mass-generate `item × owner × acquired date × rarity` pages.

## 10. Monetization

Do not monetize clutter itself. In particular:
- do not charge for basic organization because the catalog grew;
- do not reduce default inventory capacity to sell storage relief;
- do not increase ads because cleanup sessions are longer;
- do not place sponsor units between an item and an irreversible/transfer decision;
- do not use repeated visits or attachment to secretly raise prices;
- do not tell users that old items are “losing value” to create urgency.

Healthy monetization may follow demonstrated attachment through optional non-P2W gallery/archive themes, presentation cosmetics, clearly disclosed sponsorship on suitable public editorial pages, or transparent subscription benefits after repeat value.

Protected sequence:

`identify old holding → understand context → curate → confirm preserved state → finish`

## 11. Funnel and KPI additions

Primary funnel:

`owned history exists → cleanup candidate discovery → authored keep/feature/group/later choice → visible organization result → D7/D14 voluntary revisit → D30 durable chapter → optional reinterpretation/share`

Core metrics:
- oldest/unequipped discovery → meaningful curation;
- cleanup completion without new acquisition;
- old-item re-feature rate;
- grouping/chapter rate;
- voluntary cleanup-session finish;
- D7 return after cleanup;
- D14 second voluntary curation session;
- D30 durable-history coverage;
- season/profession reinterpretation rate;
- share → visit → activation → D7.

Quality diagnostics:
- search/filter success and zero-result recovery;
- time-to-find intended holding;
- abandonment before a meaningful choice;
- `keep as-is` / `later` rate as valid outcomes;
- missing/hidden-item support complaints;
- workbench-vs-live-trading misunderstanding.

Revenue/economy diagnostics remain subordinate to retention: retention-adjusted shop spend, purchase→actual-use/display, ARPU/ARPDAU, LTV/CAC, ad-induced churn and contribution margin after fraud/support costs.

Trust guardrails include phishing/ATO signals, multi-account/reward duplication, inventory privacy complaints, future wash-trading/collusion/manipulation, bot sniping, finance-like appreciation misunderstanding, youth-pressure complaints and public/private leakage.

## 12. Experiment backlog

### A. Old-item reinterpretation vs next-item recommendation
Target users with enough holdings and an older unequipped item. Treatment shows one `rediscover an old item` path before acquisition recommendations. Primary metric: D30 durable-history / reinterpretation. Observe a matured D30 cohort. Guardrails: revenue collapse, confusion, pressure, privacy and abuse.

### B. Cleanup closure summary vs endless grid
Treatment shows `reviewed / featured / grouped / later` plus `finish for today`. Primary: voluntary-finish satisfaction and D7 return. Guardrails: forced session length, support burden, misleading counts. Observe at least two matured weekly cohorts.

### C. Neutral stewardship language vs liquidation framing
Compare `rediscover / organize / keep` with transaction-oriented `unused value / clear out / sell later` framing. Primary: meaningful curation plus comprehension that live trading is not available. Guardrails: support tickets and finance-like misunderstanding. Observe at least one matured D7 cohort.

### D. Seasonal reinterpretation vs new-rotation-only promotion
Treatment connects one relevant older owned item to a new theme before/alongside optional new content. Primary: D14 meaningful session and old-item reuse/display. Guardrails: privacy, false provenance, FOMO and notification opt-out. Observe one season preview window plus 14 days.

### E. Private cleanup vs opt-in public transformation artifact
Treatment offers a public-safe before/after artifact containing only user-selected theme/result, never exact private holdings/balance/history. Primary: recipient → useful preview → meaningful activation → D7. Guardrails: privacy, spam, referral fraud, phishing and leakage.

## 13. Security, abuse and privacy review

### HIGH — marketplace/cleanup phishing and ATO
Fake `old item found`, `sell unused item`, `confirm archive` or `claim marketplace value` messages can harvest credentials. Minimum: canonical domain/brand consistency; never ask for password, OAuth code or recovery code; no secrets/session/recovery data in URLs. Separate QA before new external cleanup messaging.

### HIGH — private inventory leakage
Exact holdings, serials and acquisition history can enable targeted scams. Minimum: private-by-default holdings, public-safe allowlist, explicit sharing scope, no balance/debt/casino/security/moderation state in cleanup analytics/share URLs. Separate QA before personalized public inventory/showcase.

### HIGH — future wash trading, collusion and multi-account abuse
Do not reward raw cleanup/list/open/share with meaningful WLD/WDX. Preserve account-age, eligibility, anomaly, replay and ledger boundaries. Future player trading requires dedicated fraud/market-integrity QA.

### HIGH — destructive-action manipulation
If recycle/craft/destroy actions are introduced later, irreversible meaning must be explicit and reviewable; history/serial loss must be explained; destructive action cannot be the default cleanup choice. Separate QA required.

### HIGH — finance-like valuation/speculation framing
Old/rare/serialized items must not be marketed as guaranteed appreciating investments. Preserve game-only disclosure and no cash-value/guaranteed-return claims. Separate QA before public price-history/valuation or creator campaigns around item value.

### MEDIUM — behavioral profiling from inventory history
Do not export private holding history to advertising/third-party analytics by default or infer hidden individualized pricing from attachment/cleanup behavior. New tracking/pricing experiments require privacy/legal review.

## 14. Legal / policy cautions

Korean privacy policy must remain consistent with actual collection/use. Current PIPC enforcement in July 2026 against TikTok and Apple reinforces that third-party behavioral data and other personal data require a lawful basis, real user choice and transparent overseas-transfer disclosures where applicable. Inventory age, purchase history and attachment signals therefore should not become an unrestricted ad profile.

In the U.S., the FTC’s August 2026 personalized-pricing enforcement-policy proposal remains a **proposal, not a final rule**; its September 2026 comment-period extension confirms the policy is still under consideration. Moneyverse nevertheless adopts the conservative product rule that cleanup/attachment history must not secretly determine individualized prices.

FTC’s July 2026 Elite Events action is used only as directional fraud evidence: scarcity/resale markets can attract fake accounts, proxies and purchase-limit circumvention. It is not treated here as a statement that the BOTS Act directly governs Moneyverse virtual items.

## 15. Research note — reviewed 2026-09-15

**Directly adopted:** Epic Games Fortnite Archive current support guidance (reversible hiding rather than deletion); Pinterest’s 2025-10-27 board-personalization update (saved content becomes more useful through organization/taste refinement); Steam’s current Trade Protected Items guidance (item trading is a distinct security/protection boundary).

**Reference/guardrails:** FTC Elite Events action (2026-07), FTC proposed personalized-pricing enforcement policy and comment extension (2026-08/09), eBay Authenticity Guarantee expansion to collectible coins (2026-08-18), Discord Trust & Safety scam/phishing guidance updated 2026-07-23, and Korean PIPC’s 2026-07-27 TikTok/Apple enforcement.

## 16. Runtime Product Reality Audit — 2026-09-15

Public Production is reachable and clearly states WLD/rewards are game-only and non-cash. The public first viewport still exposes multiple shortcuts and sponsored placements before/around the fuller persistent-world positioning.

Repository reality is clearer for the authenticated marketplace: it is member-only/noindex, provides search plus category/rarity/effect/minimum quantity/acquisition-window/equipped/unequipped/serialized/newest/oldest controls, explicitly says filters do not indicate tradability, and intentionally exposes no listing/purchase mutation until authoritative transfer/crafting contracts are implemented and verified.

The authenticated marketplace was not independently exercised with a member account during this planning run. Runtime verification is therefore **partially available**: public Production verified; authenticated marketplace implementation verified from latest `main`, but not Production E2E.

## 17. Decision

Adopt dormant-inventory stewardship as the next growth bridge after identity-safe merchandising.

Immediate hypothesis:

`old owned item discovered → meaning understood → keep/feature/group/later → authored organization result → voluntary return → D30 durable history → optional public-safe reinterpretation`

Do not expand live trading, destructive cleanup, reward-heavy marketplace actions, public inventory exposure, hidden individualized pricing or finance-like item valuation through this documentation-only run.
