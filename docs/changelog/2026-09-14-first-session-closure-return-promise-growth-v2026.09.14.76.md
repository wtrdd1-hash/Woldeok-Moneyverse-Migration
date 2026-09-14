# Changelog — v2026.09.14.76 First-Session Closure & Return-Promise Growth

Date: 2026-09-14
Change type: documentation only
Runtime/code change: none

## Added
- Added `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md` and Korean counterpart.
- Defined the gap between first meaningful value and a user-authored reason to return.
- Added the loop `first result → choose one continuation → clean session end → D1 exact-thread recognition → D7 resolve/renew → D30 durable history`.
- Added first-30-second, first-3-minute and first-session closure principles without adding DB/API/scheduler implementation detail.
- Added D1/D3/D7/D14/D30 lifecycle behavior, quick/meaningful/deep session roles, social/share and LiveOps connections.
- Added experiments and KPI for return-promise selection, exact-thread return, D7 resolution/renewal, D30 durable history, retained CAC/LTV and trust guardrails.
- Protected the first-session closure moment from interruptive ads/subscription gates.

## Security / privacy / abuse
- HIGH: fake unfinished-task/pending-reward phishing and account takeover.
- HIGH: private WLD/WDX/debt/casino/social/security leakage through personalized continuation.
- HIGH: multi-account/reward farming if save/return events receive economic rewards.
- HIGH: finance-like loss/debt/casino comeback manipulation.
- MEDIUM: analytics overcollection.
- Preserved existing OAuth/session/RBAC/admin/ledger/privacy/community boundaries; no security code changed.

## Runtime evidence
- Production guide currently ends its first-day checklist with depositing remaining WLD rather than an explicit user-authored next-return promise.
- Home maintains clear game-only disclosure, Monthly Notes is still preparing reviewed public updates, and the lobby/announcements quiet states remain visible.

## External evidence
- Supercell, 2026-05-13: clearer progression and visibility of the next goal.
- Xbox, 2026-04-30: user-pinned Jump back in items remain prominent until removed.
- Clash Royale, 2026-09-07: concrete current-season activity packaging.
- Google Search current people-first content guidance.
- FTC May/June 2026 subscription enforcement; September 2026 personalized-pricing proposal treated only as a policy signal.

## Integration
- Start and mid-work `main`: `00d4468b4ea499f9e273a70d431bae1ca0c3d026` (v2026.09.14.75).
- Final `main` is rechecked immediately before direct integration.
- No PR for this documentation-only pass.