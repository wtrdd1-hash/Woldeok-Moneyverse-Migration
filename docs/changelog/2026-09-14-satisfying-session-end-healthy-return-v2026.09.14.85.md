# Changelog — Satisfying Session End & Healthy Return Growth v2026.09.14.85

## Added
- `docs/planning/SATISFYING_SESSION_END_HEALTHY_RETURN_GROWTH_SPEC.md`
- Korean counterpart.

## Consumer planning
- Added a natural session-end contract covering what changed, what is preserved, and whether the user continues or stops.
- Defined `finish for today` as a valid successful outcome without retention penalties.
- Added D1/D3/D7/D14/D30 healthy-return logic and quick/meaningful/deep session boundaries.
- Added experiments for natural closure, neutral return copy, monetization timing, notification timing and weekly resolution.
- Added KPIs for natural-boundary reach, voluntary finish, satisfaction, D7 healthy resolution and D30 durable history.

## Trust and policy
- Added guardrails for impersonation messages, private-state exposure, automated reward abuse, overly pressuring return messages and analytics overcollection.
- Existing authentication, authorization, ledger, privacy and market-integrity boundaries remain unchanged.
- Raw exit, return, open, notification opt-in or share events should not carry meaningful WLD/WDX rewards.
- Added current Discord/Roblox wellbeing, KISA messaging guidance, Naver Search Advisor and FTC subscription references.

## Runtime reality
Public home, guide and announcements were reachable. The current runtime exposes many continuation surfaces, while an explicit cross-product `enough for today / progress preserved / return when you want` contract was not visible. The proposed loop remains an unverified growth hypothesis.

## Scope
Documentation only. No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code change.