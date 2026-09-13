# Woldeok Moneyverse Mobile/App API — Complete Usage Reference

> Version: v2026.09.13.49
> Date: 2026-09-13  
> Baseline main before this change: `a57fc851c2800d77c8bb284cb1c168cfb3638bc2`
> Korean: [mobile-api-reference.ko.md](mobile-api-reference.ko.md)

## 1. Purpose and architecture

This is the normative integration guide for native/mobile clients. All ordinary member features use the public BFF boundary:

`Mobile App -> HTTPS https://easy-scraping.com/app-api/v1/* -> Next.js BFF -> private NestJS API -> PostgreSQL`

Never place `INTERNAL_API_TOKEN`, database credentials, OAuth client secrets, SMTP secrets or administrator credentials in the app. The BFF injects the internal token server-side and relays only approved headers/cookies.

## 2. Transport contract

- Base URL: `https://easy-scraping.com`
- App API prefix: `/app-api/v1`
- JSON: send `Content-Type: application/json`.
- Binary image upload: send the raw image body and its real image content type.
- Session: HTTP-only secure cookie issued by the server. Native clients must retain and resend cookies for subsequent requests.
- Mutations: obtain a fresh CSRF token and send it as `x-csrf-token`.
- Do not follow redirects blindly for OAuth; use the returned provider authorization URL in the platform browser/custom tab.
- Treat `401` as unauthenticated/invalid credentials, `403` as authenticated but not allowed/consent missing, `409` as state/version conflict, `422/400` as invalid input, and `5xx` as server failure.

## 3. First-party email/password sign-up

Detailed authentication integration guide: [app-auth-api-guide.md](app-auth-api-guide.md).

1. `POST /app-api/v1/auth/prelogin-session` with an empty JSON body. Save the `Set-Cookie` value and returned `csrfToken`.
2. `GET /app-api/v1/auth/policy` and read `termsVersion` / `privacyVersion`.
3. `PUT /app-api/v1/auth/consent` with the cookie, `x-csrf-token`, and JSON:
   `{"termsCompleted":true,"privacyCompleted":true,"ageConfirmed":true,"termsVersion":"...","privacyVersion":"..."}`
4. `POST /app-api/v1/auth/local/register` with the same cookie/CSRF and JSON:
   `{"email":"member@example.com","password":"my-password","displayName":"Name"}`
   There is no numeric minimum password length. Empty passwords are rejected, the technical maximum is 128 code points, and obvious common passwords are rejected.
5. The server sends a verification email. Submit its token to `POST /app-api/v1/auth/local/verify-email` with the same prelogin cookie and CSRF token.
6. Save the new session cookie from `Set-Cookie`. The response includes a new CSRF token and `consentCurrent`.

## 4. First-party login

1. Create/reuse a prelogin session with `POST /app-api/v1/auth/prelogin-session`.
2. `POST /app-api/v1/auth/local/login` with cookie + `x-csrf-token` and `{"email":"...","password":"..."}`.
3. Save the new session cookie and returned CSRF token.
4. Use `GET /app-api/v1/auth/viewer` to confirm `signedIn:true`.

The login API deliberately returns the same authentication failure for an unknown email and a wrong password.

## 5. Google/Discord OAuth — native app return

The native app calls `GET /app-api/v1/auth/google/authorize?client=mobile` (or Discord). The BFF returns a browser start URL such as `https://easy-scraping.com/auth/google/authorize?client=mobile`; open that URL in the system browser or Custom Tab.

After the provider callback, the web browser session is **not** copied into the app. The server creates a five-minute, single-use handoff code and redirects to the configured fixed app URI, defaulting to `woldeok-moneyverse://oauth/callback?code=...&provider=google|discord`. The app must register that scheme/host/path. Deployments may set `MOBILE_OAUTH_RETURN_URI` to another fixed app/universal-link URI; callers cannot supply arbitrary return URIs.

When the app receives the deep link it immediately sends `POST /app-api/v1/auth/mobile/handoff` with `{"code":"..."}`. Persist the returned `Set-Cookie`, `csrfToken`, and `consentCurrent`. The handoff code is one-time; replay returns 401. Never write the code to logs, analytics, or crash reports.

Web OAuth remains unchanged and returns to the website. Google Play reviewers should receive a dedicated first-party email/password review account instead of a developer's personal Google/Discord account.

## 6. CSRF/session pattern for writes

For an authenticated session call `GET /app-api/v1/auth/session` to rotate and receive a fresh CSRF token. Send that token in `x-csrf-token` on `POST`, `PUT`, `PATCH`, and `DELETE` operations that require CSRF. Preserve the session cookie across calls.

## 7. File and image APIs

- Gallery: raw upload `POST /app-api/v1/photos/uploads`, then create submission `POST /app-api/v1/photos` with returned storage key.
- Board image: `POST /app-api/v1/board/images/uploads`.
- Profile image: `POST /app-api/v1/profile/image`.
- Media reads: `/app-api/v1/media/*` now maps to the backend's version-neutral `/media/*` routes instead of the nonexistent `/api/v1/media/*` path.
- Respect backend size/type limits; do not base64-wrap binary uploads unless an endpoint explicitly says so.

## 8. Security boundaries

The app gateway intentionally rejects `/admin/*`, `/integrations/*`, `/health`, scheduler/worker internals, path traversal and arbitrary top-level routes. This is not missing functionality. Administrative controls stay outside the member app.

## 9. Google Play review readiness checks

Before each submission verify: production build SHA, public catalog, auth providers, first-party reviewer login, viewer endpoint, at least one authenticated read, logout/relogin, privacy/terms pages, account deletion/privacy request entry points, and that no app screen links to a 404 API. Features that are not implemented must be hidden/disabled in the app rather than presenting a dead control.

## 10. Known future/partial product areas

The current product plan still treats password recovery/change and login-email change, unified notifications/push preferences, global member search, and future member MFA/passkeys as planned/partial. They must not be advertised as available app features until their backend contract and runtime validation are complete.

## 11. v2026.09.13.49 authentication changes

- Removed the numeric minimum password length from first-party registration. Empty passwords remain invalid and the 128-code-point technical maximum remains.
- Added a dedicated end-to-end authentication API integration guide with cookie/CSRF handling, examples, responses and error handling.
- Kept common-password blocking, Argon2id storage and authentication abuse controls.

## 12. v2026.09.13.49 fixes

- Added migration `183-local-email-auth-registration-conflict-fix.sql` to remove PostgreSQL SQLSTATE 42702 from verified local registration.
- Added a real-PostgreSQL regression test for the full first-party registration completion path.
- Fixed app BFF mapping for version-neutral `/media/*` and OAuth `/auth/:provider/(authorize|callback)` routes.
- Re-audited the live backend route map and documented the concrete app mapping below.

## Full audited member route inventory

Runtime source: production NestJS route map after restart on 2026-09-13. Total backend routes observed: **239**. Member/app mappings listed below: **143**. Admin, Discord webhook, health probe and worker/control-plane routes are intentionally excluded.

| Method | App API | Backend route |
|---|---|---|
| `DELETE` | `/app-api/v1/account` | `/api/account` |
| `GET` | `/app-api/v1/account/identities` | `/api/account/identities` |
| `DELETE` | `/app-api/v1/account/identities/:id` | `/api/account/identities/:id` |
| `POST` | `/app-api/v1/account/identities/:provider/link` | `/api/account/identities/:provider/link` |
| `GET` | `/app-api/v1/account/security/sessions` | `/api/account/security/sessions` |
| `DELETE` | `/app-api/v1/account/security/sessions/:id` | `/api/account/security/sessions/:id` |
| `POST` | `/app-api/v1/account/security/sessions/revoke-others` | `/api/account/security/sessions/revoke-others` |
| `POST` | `/app-api/v1/activity/events` | `/api/activity/events` |
| `GET` | `/app-api/v1/content/announcements` | `/api/announcements` |
| `POST` | `/app-api/v1/auth/:provider/reauthentication` | `/api/auth/:provider/reauthentication` |
| `PUT` | `/app-api/v1/auth/consent` | `/api/auth/consent` |
| `POST` | `/app-api/v1/auth/local/login` | `/api/auth/local/login` |
| `POST` | `/app-api/v1/auth/local/register` | `/api/auth/local/register` |
| `POST` | `/app-api/v1/auth/local/verify-email` | `/api/auth/local/verify-email` |
| `POST` | `/app-api/v1/auth/logout` | `/api/auth/logout` |
| `GET` | `/app-api/v1/auth/policy` | `/api/auth/policy` |
| `POST` | `/app-api/v1/auth/prelogin-session` | `/api/auth/prelogin-session` |
| `GET` | `/app-api/v1/auth/providers` | `/api/auth/providers` |
| `GET` | `/app-api/v1/auth/session` | `/api/auth/session` |
| `GET` | `/app-api/v1/auth/viewer` | `/api/auth/viewer` |
| `GET` | `/app-api/v1/bank/loans` | `/api/bank/loans` |
| `POST` | `/app-api/v1/bank/loans` | `/api/bank/loans` |
| `POST` | `/app-api/v1/bank/loans/:id/repayments` | `/api/bank/loans/:id/repayments` |
| `POST` | `/app-api/v1/bank/movements` | `/api/bank/movements` |
| `POST` | `/app-api/v1/banking/bonds/:id/redeem` | `/api/banking/bonds/:id/redeem` |
| `POST` | `/app-api/v1/banking/bonds/purchase` | `/api/banking/bonds/purchase` |
| `POST` | `/app-api/v1/banking/borrow` | `/api/banking/borrow` |
| `POST` | `/app-api/v1/banking/claim-interest` | `/api/banking/claim-interest` |
| `POST` | `/app-api/v1/banking/deposit` | `/api/banking/deposit` |
| `POST` | `/app-api/v1/banking/repay` | `/api/banking/repay` |
| `GET` | `/app-api/v1/banking/standing` | `/api/banking/standing` |
| `POST` | `/app-api/v1/banking/withdraw` | `/api/banking/withdraw` |
| `GET` | `/app-api/v1/board/images/:key` | `/api/board/images/:key` |
| `POST` | `/app-api/v1/board/images/uploads` | `/api/board/images/uploads` |
| `GET` | `/app-api/v1/board/posts` | `/api/board/posts` |
| `POST` | `/app-api/v1/board/posts` | `/api/board/posts` |
| `DELETE` | `/app-api/v1/board/posts/:id` | `/api/board/posts/:id` |
| `GET` | `/app-api/v1/board/posts/:id` | `/api/board/posts/:id` |
| `PUT` | `/app-api/v1/board/posts/:id` | `/api/board/posts/:id` |
| `GET` | `/app-api/v1/board/posts/:id/comments` | `/api/board/posts/:id/comments` |
| `POST` | `/app-api/v1/board/posts/:id/comments` | `/api/board/posts/:id/comments` |
| `DELETE` | `/app-api/v1/board/posts/:id/comments/:commentId` | `/api/board/posts/:id/comments/:commentId` |
| `GET` | `/app-api/v1/board/public/images/:key` | `/api/board/public/images/:key` |
| `GET` | `/app-api/v1/board/public/posts` | `/api/board/public/posts` |
| `GET` | `/app-api/v1/board/public/posts/:id` | `/api/board/public/posts/:id` |
| `GET` | `/app-api/v1/board/public/posts/:id/comments` | `/api/board/public/posts/:id/comments` |
| `GET` | `/app-api/v1/board/public/stock-posts` | `/api/board/public/stock-posts` |
| `POST` | `/app-api/v1/board/stock-posts` | `/api/board/stock-posts` |
| `GET` | `/app-api/v1/businesses/equity` | `/api/business-equity` |
| `GET` | `/app-api/v1/businesses/catalog` | `/api/business-types` |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | `/api/business-types/:id/purchases` |
| `GET` | `/app-api/v1/businesses` | `/api/businesses` |
| `POST` | `/app-api/v1/businesses/:id/boost` | `/api/businesses/:id/boost` |
| `POST` | `/app-api/v1/businesses/:id/settle-v2` | `/api/businesses/:id/settle-v2` |
| `POST` | `/app-api/v1/businesses/:id/settlements` | `/api/businesses/:id/settlements` |
| `POST` | `/app-api/v1/businesses/activate-license` | `/api/businesses/activate-license` |
| `GET` | `/app-api/v1/businesses/catalog` | `/api/businesses/catalog` |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | `/api/businesses/catalog/:id/purchases` |
| `GET` | `/app-api/v1/businesses/equity` | `/api/businesses/equity` |
| `GET` | `/app-api/v1/businesses/my-v2` | `/api/businesses/my-v2` |
| `GET` | `/app-api/v1/casino/coin/fairness` | `/api/casino/coin/fairness` |
| `POST` | `/app-api/v1/casino/coin/plays` | `/api/casino/coin/plays` |
| `GET` | `/app-api/v1/casino/coin/terms` | `/api/casino/coin/terms` |
| `GET` | `/app-api/v1/casino/dice/fairness` | `/api/casino/dice/fairness` |
| `POST` | `/app-api/v1/casino/dice/plays` | `/api/casino/dice/plays` |
| `GET` | `/app-api/v1/casino/games/terms` | `/api/casino/games/terms` |
| `GET` | `/app-api/v1/casino/history` | `/api/casino/history` |
| `GET` | `/app-api/v1/casino/self-limit` | `/api/casino/self-limit` |
| `PUT` | `/app-api/v1/casino/self-limit` | `/api/casino/self-limit` |
| `GET` | `/app-api/v1/content/announcements` | `/api/content/announcements` |
| `GET` | `/app-api/v1/content/photos` | `/api/content/photos` |
| `GET` | `/app-api/v1/content/status` | `/api/content/status` |
| `POST` | `/app-api/v1/early-game/claims` | `/api/early-game/claims` |
| `GET` | `/app-api/v1/early-game/first-day` | `/api/early-game/first-day` |
| `GET` | `/app-api/v1/early-game/today` | `/api/early-game/today` |
| `GET` | `/app-api/v1/engagement` | `/api/engagement` |
| `GET` | `/app-api/v1/engagement/early-game` | `/api/engagement/early-game` |
| `POST` | `/app-api/v1/engagement/npcs/:code/orders` | `/api/engagement/npcs/:code/orders` |
| `PUT` | `/app-api/v1/engagement/preferences` | `/api/engagement/preferences` |
| `GET` | `/app-api/v1/photos` | `/api/photos` |
| `POST` | `/app-api/v1/photos` | `/api/photos` |
| `GET` | `/app-api/v1/photos/mine` | `/api/photos/mine` |
| `POST` | `/app-api/v1/photos/uploads` | `/api/photos/uploads` |
| `GET` | `/app-api/v1/privacy/requests` | `/api/privacy/requests` |
| `POST` | `/app-api/v1/privacy/requests` | `/api/privacy/requests` |
| `GET` | `/app-api/v1/profile` | `/api/profile` |
| `PUT` | `/app-api/v1/profile` | `/api/profile` |
| `GET` | `/app-api/v1/profile/:userId` | `/api/profile/:userId` |
| `DELETE` | `/app-api/v1/profile/image` | `/api/profile/image` |
| `POST` | `/app-api/v1/profile/image` | `/api/profile/image` |
| `GET` | `/app-api/v1/profile/settings` | `/api/profile/settings` |
| `GET` | `/app-api/v1/progression` | `/api/progression` |
| `GET` | `/app-api/v1/progression/credit` | `/api/progression/credit` |
| `GET` | `/app-api/v1/progression/early-game` | `/api/progression/early-game` |
| `POST` | `/app-api/v1/progression/refreshes` | `/api/progression/refreshes` |
| `GET` | `/app-api/v1/rewards/availability` | `/api/rewards/availability` |
| `POST` | `/app-api/v1/rewards/daily/claims` | `/api/rewards/daily/claims` |
| `POST` | `/app-api/v1/rewards/work/claims` | `/api/rewards/work/claims` |
| `GET` | `/app-api/v1/seasons/events` | `/api/seasons/events` |
| `POST` | `/app-api/v1/seasons/events/:id/consumptions` | `/api/seasons/events/:id/consumptions` |
| `GET` | `/app-api/v1/seasons/events/:id/leaderboard` | `/api/seasons/events/:id/leaderboard` |
| `GET` | `/app-api/v1/shop/catalog` | `/api/shop/catalog` |
| `POST` | `/app-api/v1/shop/catalog/:id/purchases` | `/api/shop/catalog/:id/purchases` |
| `GET` | `/app-api/v1/shop/cosmetics/:userId` | `/api/shop/cosmetics/:userId` |
| `GET` | `/app-api/v1/shop/holdings` | `/api/shop/holdings` |
| `POST` | `/app-api/v1/shop/holdings/:id/consumptions` | `/api/shop/holdings/:id/consumptions` |
| `POST` | `/app-api/v1/shop/holdings/:id/equip` | `/api/shop/holdings/:id/equip` |
| `POST` | `/app-api/v1/shop/holdings/:id/upkeep-settlements` | `/api/shop/holdings/:id/upkeep-settlements` |
| `GET` | `/app-api/v1/shop/items` | `/api/shop/items` |
| `POST` | `/app-api/v1/shop/items/:id/purchases` | `/api/shop/items/:id/purchases` |
| `GET` | `/app-api/v1/shop/public-catalog` | `/api/shop/public-catalog` |
| `GET` | `/app-api/v1/shop/purchases` | `/api/shop/purchases` |
| `GET` | `/app-api/v1/content/status` | `/api/status` |
| `GET` | `/app-api/v1/stocks` | `/api/stocks` |
| `GET` | `/app-api/v1/stocks/:id/candles` | `/api/stocks/:id/candles` |
| `POST` | `/app-api/v1/stocks/:id/orders` | `/api/stocks/:id/orders` |
| `GET` | `/app-api/v1/stocks/:id/prices` | `/api/stocks/:id/prices` |
| `POST` | `/app-api/v1/stocks/:id/watchlist` | `/api/stocks/:id/watchlist` |
| `GET` | `/app-api/v1/stocks/alerts` | `/api/stocks/alerts` |
| `POST` | `/app-api/v1/stocks/alerts` | `/api/stocks/alerts` |
| `DELETE` | `/app-api/v1/stocks/alerts/:id` | `/api/stocks/alerts/:id` |
| `GET` | `/app-api/v1/stocks/alerts/events` | `/api/stocks/alerts/events` |
| `GET` | `/app-api/v1/stocks/history` | `/api/stocks/history` |
| `GET` | `/app-api/v1/stocks/market-events` | `/api/stocks/market-events` |
| `GET` | `/app-api/v1/stocks/portfolio` | `/api/stocks/portfolio` |
| `GET` | `/app-api/v1/stocks/sparklines` | `/api/stocks/sparklines` |
| `GET` | `/app-api/v1/stocks/watchlist` | `/api/stocks/watchlist` |
| `GET` | `/app-api/v1/wallet` | `/api/wallet` |
| `POST` | `/app-api/v1/wallet/transfers` | `/api/wallet/transfers` |
| `GET` | `/app-api/v1/work` | `/api/work` |
| `POST` | `/app-api/v1/work/active-job` | `/api/work/active-job` |
| `GET` | `/app-api/v1/work/assignments` | `/api/work/assignments` |
| `POST` | `/app-api/v1/work/assignments` | `/api/work/assignments` |
| `POST` | `/app-api/v1/work/assignments/:id/completions` | `/api/work/assignments/:id/completions` |
| `POST` | `/app-api/v1/work/assignments/:id/verify` | `/api/work/assignments/:id/verify` |
| `GET` | `/app-api/v1/work/profile` | `/api/work/profile` |
| `GET` | `/app-api/v1/work/receipts` | `/api/work/receipts` |
| `GET` | `/app-api/v1/work/tasks` | `/api/work/tasks` |
| `POST` | `/app-api/v1/work/tasks/:id/complete` | `/api/work/tasks/:id/complete` |
| `GET` | `/app-api/v1/auth/:provider/authorize` | `/auth/:provider/authorize` |
| `GET` | `/app-api/v1/auth/:provider/callback` | `/auth/:provider/callback` |
| `GET` | `/app-api/v1/media/:key` | `/media/:key` |
| `GET` | `/app-api/v1/media/profile/:key` | `/media/profile/:key` |
