# Product Planning Worklog — v2026.09.12.21

Date: 2026-09-12

## Goal

Close the planning gap between community/club participation and WDX market integrity without reintroducing arbitrary participation caps.

## Repository review

Reviewed the latest Living Project Plan, Default Limit Policy, Economy Sinks direction and the open Clubs & Cooperative Economy v2026.09.12.20 planning branch. Confirmed that the repository already planned stock-tagged community discussion but did not yet define an implementation-grade moderation + manipulation-detection contract.

## External research reviewed

- Discord Community Guidelines and platform-manipulation/AutoMod guidance: graduated enforcement, reports, anti-spam and anti-raid controls.
- TradingView reporting flow and 2026 Paper Trading competition account/rate-protection patterns.
- FINRA pump-and-dump guidance concerning social-media promotion.
- SEC 2025 enforcement releases involving social-media/group-chat and investment-club fraud patterns.

## Design decisions

- Normal posts/comments remain unlimited by default; only documented security/platform-integrity throttles may limit bursts.
- Reports are signals, never popularity votes that automatically ban users or halt stocks.
- Community moderation and market-integrity restrictions use separate capability states.
- WDX prices cannot directly consume reactions, follower counts, views, sentiment or report counts.
- Detection focuses on explainable signals: circular counterparties, coordinated posting/trading, fake liquidity, engagement rings and malicious report clusters.
- Already-settled ledger history is immutable; corrections use compensating actions.
- WLD cannot purchase favorable moderation or appeal acceleration.

## Files

- `docs/planning/COMMUNITY_MARKET_INTEGRITY_SPEC.md`
- `docs/planning/COMMUNITY_MARKET_INTEGRITY_SPEC.ko.md`
- matching changelogs/worklogs
- documentation index

## Validation

Documentation-only. No runtime code, schema, migration or deployment was changed. Runtime implementation requires its own development branch and Test validation.