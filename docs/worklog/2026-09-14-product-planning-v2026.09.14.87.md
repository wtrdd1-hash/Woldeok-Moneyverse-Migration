# Worklog — Brand Promise & Discovery Positioning Growth v2026.09.14.87

## Starting state
- Start-of-pass `main`: `610c89d3deac535ace3246b428f9312761e3a6cf`.
- Re-read current Living Project Plan and Product Growth Plan.
- Re-read the latest healthy-session/retention growth spec and current runtime/product baseline.
- Reviewed recent `main` changes including per-stock alert deep-link work and the Node image dependency bump; no conflict with this documentation-only pass.

## Gap selection
Recent planning strongly covers signup continuity, first-week complexity, mastery, comeback, social continuity and healthy session endings. The largest uncovered consumer-growth problem selected for this pass was first-visit positioning: the public product truthfully exposes many systems, but a new visitor may not form one memorable reason to care before seeing wallet/games/exchange/shop/quests/community/sponsors.

## Decision
Define Moneyverse primarily as a persistent community world where user actions become progress, collections, stories and shared history, with the virtual economy as a game mechanic rather than the whole consumer identity.

Adopt funnel:
`qualified discovery → one clear promise → one proof/sample → authored interest → contextual signup → meaningful activation → D1 promise kept → D7 coherent identity → D30 durable history/share`.

## Research reviewed
- Roblox, 2026-06-15, discovery optimization: longer-term retention signals instead of short-click proxies.
- Discord, 2026-08-20, game discovery/social play: contextual discovery, official identity and downstream gameplay/social actions.
- Google Search Central people-first guidance: clear primary purpose, substantial/original content and satisfying outcomes.
- Google Discover core update, 2026-02-05: less sensational/clickbait, more original/timely/in-depth content.
- Naver Search Advisor current 2026 guidance: clear main-page brand/site-nature titles and useful/authoritative content quality.
- FTC endorsement guidance: truthful/non-misleading endorsements and disclosure of material connections.

## Runtime Product Reality Audit
Verified public home at `https://easy-scraping.com/`.
Observed:
- repeated game-only WLD/reward disclosure;
- title/category framing around Discord community virtual economy/game rewards;
- first visible shortcuts: wallet, five minigames, exchange, shop, quests, lobby;
- multiple sponsored placements;
- later hero copy: `a small, solid economy we build together` and Discord-connected community virtual economy;
- pre-signup preview messaging exists, but no single authored-interest path dominates before the broad feature inventory.

Conclusion: brand/category clarity is testable and currently unproven; runtime implementation was not changed.

## Security/privacy/abuse review
Recorded:
- HIGH real-finance misunderstanding/impersonation;
- HIGH acquisition-link/creator phishing and ATO;
- HIGH public artifact/SEO private-state leakage;
- HIGH referral/creator/bot acquisition abuse;
- MEDIUM acquisition analytics overcollection.

Minimum planning conditions preserve canonical branding/domain, game-only financial boundaries, private-by-default sensitive state, public-safe sharing, no raw signup/share WLD/WDX rewards, purpose-limited analytics and separate QA/legal review for finance-adjacent campaigns/deep links/public personalized pages.

## Files added
- `docs/planning/BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.md`
- `docs/planning/BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-brand-promise-discovery-positioning-v2026.09.14.87.md`
- `docs/changelog/2026-09-14-brand-promise-discovery-positioning-v2026.09.14.87.ko.md`
- this worklog and Korean counterpart.

## Scope and validation
- Documentation only.
- No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code changes.
- Mid-pass `main` recheck remained `610c89d3deac535ace3246b428f9312761e3a6cf` before document construction.
- Final `main` must be rechecked immediately before ref update; non-fast-forward update is prohibited.
