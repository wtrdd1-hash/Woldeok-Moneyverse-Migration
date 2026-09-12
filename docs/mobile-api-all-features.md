# Complete App API Guide

> Version: v2026.09.12.33
> Date: 2026-09-12
> Korean: [mobile-api-all-features.ko.md](mobile-api-all-features.ko.md)

## Purpose

This document defines the complete app-facing API surface for Woldeok Moneyverse. Native/mobile clients call the Next.js BFF under `/app-api/v1/*`; they never receive or embed `INTERNAL_API_TOKEN`. The BFF forwards session cookies, CSRF tokens and approved request metadata to the private NestJS API.

## Authentication

Supported app authentication methods:
- first-party email/password registration and login (`local_email`);
- Discord OAuth Authorization Code + PKCE;
- Google OAuth/OIDC Authorization Code + PKCE;
- server-side session cookie + CSRF for mutations;
- account identity linking and step-up reauthentication.

Canonical app paths include:
- `POST /app-api/v1/auth/prelogin-session`
- `GET /app-api/v1/auth/policy`
- `PUT /app-api/v1/auth/consent`
- `GET /app-api/v1/auth/providers`
- `GET /app-api/v1/auth/discord/authorize`
- `GET /app-api/v1/auth/google/authorize`
- provider callbacks through the existing OAuth flow
- `POST /app-api/v1/auth/local/register`
- `POST /app-api/v1/auth/local/verify-email`
- `POST /app-api/v1/auth/local/login`
- `POST /app-api/v1/auth/logout`

## App feature coverage

| Feature | App API root / examples | Coverage |
| --- | --- | --- |
| Account | `/app-api/v1/account/*` | identities, linking/unlinking, lifecycle |
| Activity | `/app-api/v1/activity/*` | member activity surfaces |
| Authentication | `/app-api/v1/auth/*` | local, Discord, Google, session, consent |
| Wallet | `/app-api/v1/wallet/*` | balance, transfers, ledger-backed member operations |
| Banking | `/app-api/v1/bank/*`, `/app-api/v1/banking/*` | deposits, withdrawals/movements, loans, repayments, banking features |
| Rewards | `/app-api/v1/rewards/*` | daily/work reward claims |
| Work | `/app-api/v1/work/*` | jobs and work actions |
| Progression | `/app-api/v1/progression/*` | level/mastery/progression data |
| Early game | `/app-api/v1/early-game/*` | onboarding and early-game flows |
| Engagement | `/app-api/v1/engagement/*` | engagement/member loops |
| Stocks | `/app-api/v1/stocks/*` | market, portfolio, prices, orders/history |
| Businesses | `/app-api/v1/businesses/*` | holdings, V2 settlement, license activation, boosts, catalog aliases |
| Business catalog | `/app-api/v1/businesses/catalog`, `/app-api/v1/businesses/catalog/{id}/purchases` | app-safe aliases for backend `business-types` routes |
| Business equity | `/app-api/v1/businesses/equity` | app-safe alias for backend `business-equity` |
| Shop | `/app-api/v1/shop/*` | items, purchases, inventory-related flows exposed by the shop module |
| Seasons | `/app-api/v1/seasons/*` | events, consumption, leaderboard/reward flows |
| Casino | `/app-api/v1/casino/*` | server-authoritative virtual minigames and member limits/history |
| Board | `/app-api/v1/board/*` | posts, images, member board operations |
| Profile | `/app-api/v1/profile/*` | profile/member data and profile image flows |
| Content | `/app-api/v1/content/announcements`, `/app-api/v1/content/photos`, `/app-api/v1/content/status` | app-safe public content/status aliases |
| Media | `/app-api/v1/media/*`, `/app-api/v1/photos/*` | media and member photo surfaces |
| Privacy | `/app-api/v1/privacy/*` | privacy requests/export/lifecycle surfaces implemented by the privacy module |

## Newly closed gaps in v2026.09.12.33

The existing BFF already covered most member feature roots, but four backend roots were outside its allowlist: `announcements`, `status`, `business-types`, and `business-equity`. Instead of widening the BFF security allowlist, this release adds canonical app-safe aliases under already approved feature groups:

- backend `GET /api/v1/announcements` -> app `GET /app-api/v1/content/announcements`
- backend `GET /api/v1/photos` -> app `GET /app-api/v1/content/photos`
- backend `GET /api/v1/status` -> app `GET /app-api/v1/content/status`
- backend `GET /api/v1/business-types` -> app `GET /app-api/v1/businesses/catalog`
- backend `POST /api/v1/business-types/{id}/purchases` -> app `POST /app-api/v1/businesses/catalog/{id}/purchases`
- backend `GET /api/v1/business-equity` -> app `GET /app-api/v1/businesses/equity`

## Deliberately not part of the normal user app API

The following remain separate control-plane/integration surfaces rather than normal app features:
- `/api/v1/admin/*` — administrator console boundary with stronger authorization/session/reauthentication controls;
- `/api/v1/integrations/discord/*` — Discord webhook/interactions surface;
- `/health` — infrastructure health probe;
- scheduler/background worker internals.

This separation does not remove product functionality. It prevents a normal app client from becoming a generic proxy into privileged or machine-to-machine control surfaces.

## Security contract

- Native apps never embed `INTERNAL_API_TOKEN`.
- Mutations continue to require the server session and CSRF token where the backend requires them.
- Backend guards remain authoritative for authentication, consent, ownership, reauthentication and admin boundaries.
- Economy writes remain server-authoritative and database invariant protected.
- The app BFF does not bypass route validation or database authorization.

## Merge exception

Per explicit user instruction on 2026-09-12, v2026.09.12.33 is merged without the normal Test-server validation step. This is a one-release exception and does not change the default staging-first release policy.
