# Quests

Quests are the structured activity layer above repeatable work. They include daily events, early-game steps and progression objectives.

## Design goal

A quest should describe only an effect that the system can actually perform. The UI must not promise future mechanics as if they were already live rewards.

## Daily events

Daily event claims are database-backed and should be idempotent. Claiming an event may grant WLD, EXP, items or an implemented temporary effect.

The September gameplay audit removed placeholder `pending_effect` descriptions whose underlying mechanics did not exist. Real WLD/EXP/item rewards were preserved.

Examples of effects that must not be advertised before implementation include durability systems or bonus systems that have no corresponding database/runtime contract.

## Market sale event

The market-sale event is an example of a complete effect contract:

1. member claims the event;
2. the claim is recorded for the current Seoul date;
3. eligible starter-tool catalog prices are discounted by 10%;
4. the shop read model and purchase function use the same effective-price rule;
5. the effect ends at the date boundary.

This avoids the classic mismatch where the shop displays one price and charges another.

## Early-game progression

Early-game steps are meant to teach the product loops rather than invent separate reward systems. Progress can link to wallet, profile, shop, work and collection activity.

## UX rules

- distinguish claimed, available and unavailable states;
- refresh immediately after a successful claim;
- explain when an effect ends;
- never leave a spinner implying a reward was not claimed when the ledger says it was;
- do not use placeholder copy that reads like a real implemented benefit.

## Related surfaces

- `/quests`
- `/progression`
- `/shop/catalog`
- `/wallet`
