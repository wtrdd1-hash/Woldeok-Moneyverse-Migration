# User App API Coverage Audit

> Version: v2026.09.13.43
> Date: 2026-09-13
> Status: implementation audit
> Korean: [USER_APP_API_COVERAGE_AUDIT.ko.md](USER_APP_API_COVERAGE_AUDIT.ko.md)
> Primary API guide: [../mobile-api-all-features.md](../mobile-api-all-features.md)
> Mobile UI/UX specification: [../mobile-app-ui-ux-spec.md](../mobile-app-ui-ux-spec.md)

## 1. Audit question

Verify that every ordinary member-facing product capability is designed to be consumable through an application API, and distinguish:

1. current user functionality that is already reachable through the app API gateway;
2. functionality that is documented but still planned/partial;
3. privileged or machine-to-machine surfaces that must remain outside the normal user app API.

The required architecture remains:

`Mobile App -> HTTPS -> /app-api/v1/* BFF -> NestJS /api/v1/* -> PostgreSQL`

All ordinary member functionality must use `/app-api/v1/*`. Native clients must never embed `INTERNAL_API_TOKEN`, database credentials, administrator credentials, or service secrets.

## 2. Sources re-checked

The audit re-read the current `main` implementation and documentation, including:

- `docs/planning/PROJECT_PLAN.md` — Living specification, re-checked before and during this audit.
- `docs/mobile-api-all-features.md` — complete app API guide, v2026.09.12.33.
- `docs/mobile-app-ui-ux-spec.md` — mobile implementation specification, v2026.09.12.34.
- `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.md` — authentication/security implementation priorities.
- `backend/src/app.module.ts` — registered backend feature modules.
- `frontend/src/app/app-api/v1/[...path]/route.ts` — app BFF proxy.
- `frontend/src/lib/app-gateway.ts` — app API allowlist.
- representative member controllers for authentication, wallet/rewards, banking, account security, board/media, gallery upload, profile, stock, business, shop, season, casino, progression, engagement and early-game functions.

## 3. Gateway coverage

The app BFF currently allows these member-facing roots:

`account`, `activity`, `auth`, `bank`, `banking`, `board`, `businesses`, `casino`, `content`, `early-game`, `engagement`, `media`, `photos`, `privacy`, `profile`, `progression`, `rewards`, `seasons`, `shop`, `stocks`, `wallet`, `work`.

The catch-all gateway supports `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`; forwards approved cookies, content type and CSRF metadata; and supplies the server-only internal token at the BFF boundary. Request bodies are forwarded as raw bytes when present, so member image upload APIs can also pass through the same application boundary.

## 4. Current member feature coverage

| Product capability | App API status | Audit result |
| --- | --- | --- |
| Session/bootstrap/consent | `/app-api/v1/auth/*` | Covered |
| First-party registration/login/email verification | `/app-api/v1/auth/local/*` | Covered |
| Discord and Google OAuth/OIDC launch/linking | `/app-api/v1/auth/*`, `/app-api/v1/account/*` | Covered |
| Account identity/lifecycle | `/app-api/v1/account/*` | Covered |
| Account security / active-session review and other-session termination | `/app-api/v1/account/security/*` | Covered |
| Profile and profile image | `/app-api/v1/profile/*` | Covered |
| Wallet/balance/transfer | `/app-api/v1/wallet/*` | Covered |
| Daily reward availability/claim | `/app-api/v1/rewards/*` | Covered; backend reward routes are implemented by the wallet service/controller |
| Professional work/jobs | `/app-api/v1/work/*` | Covered |
| Banking, deposits, withdrawals, interest, smart loan/repayment, bonds | `/app-api/v1/bank/*`, `/app-api/v1/banking/*` | Covered |
| Shop/purchases | `/app-api/v1/shop/*` | Covered |
| Stocks, portfolio, prices, orders, watchlist/alerts where implemented | `/app-api/v1/stocks/*` | Covered by the stock group |
| Businesses, catalog/purchase, settlements, equity and related operations | `/app-api/v1/businesses/*` | Covered; app-safe aliases keep backend catalog/equity roots behind the approved group |
| Seasons/events/leaderboards/reward flows | `/app-api/v1/seasons/*` | Covered |
| Casino/minigames | `/app-api/v1/casino/*` | Covered, subject to feature/legal/policy gates |
| Progression | `/app-api/v1/progression/*` | Covered |
| Early-game/onboarding | `/app-api/v1/early-game/*` | Covered |
| Engagement loops | `/app-api/v1/engagement/*` | Covered |
| Board/community posts and images | `/app-api/v1/board/*` | Covered |
| Public announcements/status/gallery reads | `/app-api/v1/content/*` | Covered through app-safe aliases |
| Gallery member image upload/submission | `POST /app-api/v1/photos/uploads`, `POST /app-api/v1/photos` | Covered; raw-image upload is supported through the BFF |
| Media delivery | `/app-api/v1/media/*`, `/app-api/v1/photos/*` | Covered |
| Activity surfaces | `/app-api/v1/activity/*` | Covered |
| Privacy requests/lifecycle | `/app-api/v1/privacy/*` | Covered for currently implemented privacy-module operations |

### Gallery clarification

The gallery upload API is present. A member first sends image bytes to `POST /app-api/v1/photos/uploads`, receives a storage key, and then submits the gallery record through `POST /app-api/v1/photos`. The backend keeps unpublished submissions private until the operator publication flow allows them.

## 5. Planned or incomplete member API gaps

The repository must **not** be described as “every planned user feature is already API-complete.” The following are still planned, conditional, or incomplete according to the current specifications and implementation review.

### 5.1 Password recovery and credential lifecycle

`AUTHENTICATION_SECURITY_PRIORITY_SPEC.md` specifies password recovery/change and login-email change capabilities, including password-forgot/reset/change and email-change flows. The current local authentication controller implements registration, email verification, and login, but not the full recovery/change lifecycle.

The mobile UI specification also explicitly says “Forgot password when backend support is complete.”

**Status: API gap / planned P0 security work.**

### 5.2 Member notification center and push preferences

The mobile UI specification defines a notification model and notification-center UX only “where available”, and push notification preferences are described as future/conditional. No dedicated ordinary-member notification controller/API was found in the current backend module/controller audit.

**Status: planned / not yet a complete ordinary-member API surface.**

### 5.3 Global member search

The mobile UI specification lists global search only “where supported”. No dedicated general member-facing global-search API was identified in the current implementation audit.

Feature-local search/filter behavior may exist inside individual APIs; this finding concerns a unified global search capability.

**Status: planned/conditional, not a current complete API.**

### 5.4 Future authentication expansion

Passkeys/WebAuthn and broader member MFA/recovery functionality remain future or staged work in the authentication security specification. Administrator TOTP controls do not imply that ordinary-member passkey/MFA APIs are complete.

**Status: future expansion; not counted as a regression in current member API coverage.**

### 5.5 Optional dashboard aggregation

The mobile UI specification permits the Home dashboard to compose existing feature APIs concurrently when no dedicated aggregation endpoint exists. Therefore absence of a single `/dashboard` endpoint is **not** an API coverage gap as long as every displayed card is backed by approved member APIs.

## 6. Deliberate exclusions

These surfaces must remain outside the normal user app API:

- `/api/v1/admin/*` — privileged administrator/control-plane boundary;
- `/api/v1/integrations/discord/*` — Discord webhook/interactions integration;
- `/health` — infrastructure probe;
- scheduler/background-worker internals;
- direct database access.

Excluding these is a security property, not missing user functionality.

## 7. Required rule going forward

Effective with v2026.09.13.43:

1. Every newly implemented ordinary member-facing feature must expose an approved `/app-api/v1/*` contract in the same workstream.
2. A web-only server action is not sufficient when the capability is intended to exist in the native/mobile app.
3. New backend top-level member routes must either be added to the reviewed app-gateway allowlist or receive an app-safe alias under an already approved group.
4. File/image upload features must be verified through the BFF with their binary-body and size/type constraints, not only through the website UI.
5. API documentation and the mobile UI binding document must be updated together with the implementation.
6. Planned features must be marked `planned`/`partial`; documentation must not call them complete before backend contract and validation exist.
7. Administrator, webhook, worker and health endpoints remain intentionally excluded from the normal member gateway.

## 8. Audit conclusion

**Current implemented ordinary-member product functionality is broadly API-enabled through `/app-api/v1/*`, including gallery image upload.** The gateway architecture and feature-group allowlist support the present member modules.

However, **the whole future product plan is not 100% API-complete**. Password recovery/change and login-email-change flows, a unified member notification/push surface, global search, and future member MFA/passkey expansion remain planned or incomplete.

Accordingly, the project status is:

- Current implemented member functions: **API coverage substantially complete**.
- Planned/future member functions: **not fully complete; gaps recorded above**.
- Policy requirement: **all ordinary member functionality must be API-first/app-API reachable when implemented**.

## 9. Validation / deployment note

This work is documentation/audit-only. No runtime code, database schema, deployment manifest, or production behavior was changed by v2026.09.13.43. Test-server and Production promotion are therefore not required for this audit record itself.
