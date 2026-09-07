# Virtual Casino

The casino is a **virtual entertainment feature using in-service WLD only**. It is not a real-money gambling service and has no cash-out mechanism.

## Authority model

The browser submits a game choice and virtual stake. The server/database decides the outcome, applies policy/limits, records the ledger effect and returns a receipt.

The browser must never manufacture a win or infer settlement from an animation.

## Core disclosed game math

Current baseline core terms:

| Game | Win probability | Payout multiplier | Baseline RTP |
| --- | ---: | ---: | ---: |
| Coin | 50% | 1.9× | 95% |
| Dice parity | 50% | 1.9× | 95% |
| Dice number | 1/6 | 5.7× | 95% |

Distribution trials are used to validate the RNG/distribution contract independently of a small live-play sample.

## Exposure policy

Current platform baseline:

- minimum stake: **10 WLD**;
- maximum stake per play: **200 WLD**;
- daily total stake: **2,000 WLD**;
- daily realized loss: **1,000 WLD**.

A member's self-limit can be stricter than these platform limits.

## Self-limits / self-exclusion

A zero value for a self-limit means that particular self-limit is not set. A time lock is effectively self-exclusion: while locked, play and limit changes are blocked until the lock expires.

The UI should say this plainly instead of describing it as a harmless settings lock.

## Theme games

Slots, high/low, wheel, treasure and gem views are themed interfaces over server-authoritative game results. Final visuals are derived from the receipt's actual outcome.

A previous UI bug could show `777` after a losing server result. The theme mapping was changed so final animation state can no longer contradict the stored outcome.

## Money type safety

Casino receipts carry WLD as canonical integer strings. The frontend accepts only exact integer representations; it must not call string methods on an unexpected number or silently round an unsafe JavaScript double.

## Member history

Casino history uses a dedicated actor-scoped read model rather than filtering a small generic wallet feed. This ensures recent game history remains visible even when many unrelated wallet transactions occurred.

## UX states

A processed request is not automatically a win. UI tone distinguishes:

- win;
- loss;
- even/neutral;
- request/system error.

## Related routes

- `/casino`
- member casino terms/history API
- wallet ledger surfaces
