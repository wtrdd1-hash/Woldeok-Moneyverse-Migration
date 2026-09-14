# Changelog — v2026.09.14.69 World Pulse & Freshness Retention

Date: 2026-09-14
Change type: documentation only
Runtime/code change: none

## Added
- `WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md` and Korean counterpart.
- Consumer definition of credible liveness: real world/season/community/content change instead of fabricated urgency or feed volume.
- First-30-second and first-3-minute `pulse → preview → authored choice` path.
- D0/D1/D3/D7/D14/D30 freshness and weekly-world-recap contract.
- Truthful quiet-state behavior when nothing material changed.
- Public-content/SEO rules prioritizing original, timely, substantial stories over thin event-page scale.
- Social/share rules centered on outcomes and stories rather than private activity or raw wealth.
- Retention-safe monetization placement rules around current-world content.
- Experiments and KPIs for World Pulse comprehension, relevant-change continuation, weekly recap, durable history and retained contribution.
- Security review covering phishing/ATO, private-state leakage, finance-like manipulation/market abuse, fake social proof, UGC harm and tracking overcollection.

## Research incorporated
- Discord game-discovery update, 2026-08-20.
- Google February 2026 Discover core update and current Discover guidance.
- Supercell Clash Royale September 2026 What's New.
- Xbox Tokyo Game Show announcement, 2026-09-09.
- KISA spam-prevention guidance v7, 2026-03-04.
- PIPC TikTok/Apple enforcement, 2026-07-23/27.
- FTC 2026 subscription enforcement as a monetization guardrail.

## Runtime verification
Unavailable for this pass. The repository identifies `https://easy-scraping.com` as Production, but the web verification path did not return a verifiable Moneyverse runtime, so no live-state claim was made.

## Decision
Validate one narrow loop before expanding feed volume: `real change → concise pulse → chosen-priority relevance → meaningful action → D7 recap → D30 history`.
