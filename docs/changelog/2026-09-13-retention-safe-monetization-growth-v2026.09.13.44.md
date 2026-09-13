# Changelog — Retention-Safe Monetization Growth v2026.09.13.44

Date: 2026-09-13
Change type: documentation only
Runtime/Test deployment: not required for this documentation change
Canonical spec: `docs/planning/RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md`
Korean counterpart: `docs/changelog/2026-09-13-retention-safe-monetization-growth-v2026.09.13.44.ko.md`

## Why this changed

Reviewed public-content advertising became default-enabled in Production in v2026.09.13.42. Existing growth plans already required monetization to follow demonstrated value, but there was no single consumer-growth contract distinguishing “technically eligible for ads” from “healthy moment to monetize.”

The public runtime is reachable. Home has substantive first-visit value, while the announcements surface still has no published first-party notice content. This made empty-page monetization and first-value protection the highest current monetization/retention gap.

## Changes

- Added four consumer monetization states: value-not-delivered, first-value-delivered, continuation-intent and sensitive/economic action.
- Preserved existing ad-free sensitive/economy surfaces.
- Added value-first placement hierarchy and explicit empty/loading/error rules.
- Added retention-sensitive ad-load evaluation rather than a global impression target.
- Added `retention-adjusted contribution` alongside ARPU/ARPDAU/eCPM.
- Added experiments for after-value placement, empty-page suppression, ad density, subscription timing and reviewed personalization.
- Added High-risk reviews for accidental/deceptive navigation, sensitive-context ad leakage and consent/profile overreach, plus Medium ad/referral fraud.
- Kept WLD/WDX virtual/simulated/game-only and separate legal/privacy review for personalized advertising, minors and materially expanded tracking.

## Runtime Product Reality Audit

- `https://easy-scraping.com/`: reachable; first-visit explanation and newcomer guidance present.
- `/announcements`: reachable; no published notice content yet.
- Text retrieval cannot prove a visual ad's rendered state because consent, fill and geography can vary; this pass evaluates public-page value readiness instead.

## Research used

Directly adopted: Deloitte + Google AdMob (2025-06-10), current Google AdSense Program Policies, and Google AdSense Privacy & messaging update (2026-09-11).

Reference/compliance guardrails: FTC Native Advertising guidance and FTC Shutterstock settlement (2026-05).

## Version concurrency

The draft began as v2026.09.13.43. A mandatory mid-work `main` recheck found a concurrent user-app API coverage workstream had already consumed v2026.09.13.43. This growth change was renumbered to **v2026.09.13.44** before completion.

## Test/deployment

Documentation-only. No Test deployment is required. Later runtime ad-placement, consent, subscription or analytics changes require separate development/QA/deployment.

## Next priority

Turn the empty public-news surface into a small weekly return product and test `world update → contextual continuation → D7` before increasing ad inventory.