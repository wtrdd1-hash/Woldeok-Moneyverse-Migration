# Woldeok Moneyverse Mobile App — Complete API Implementation Specification

**English canonical** | [한국어](mobile-api-complete-spec.ko.md)

> Version: v2026.09.13.51
> Date: 2026-09-13
> Production origin: `https://easy-scraping.com`
> App API prefix: `/app-api/v1`
> Audience: Android/iOS clients, code-generation tools such as Gemini, QA and store-review preparation

## 0. Contract authority

This file is the single integration contract for the native app. User-facing native code MUST use `https://easy-scraping.com/app-api/v1/*`; it must not guess web-page URLs or call the private NestJS origin.

Non-negotiable rules:

1. Never embed `INTERNAL_API_TOKEN`, database credentials, OAuth client secrets or SMTP secrets in an APK/AAB/IPA.
2. Use one persistent secure CookieJar for all Moneyverse requests.
3. Treat login as complete only after `/auth/viewer` returns `signedIn:true`.
4. Send the current `x-csrf-token` on state-changing calls where required.
5. Native Google/Discord OAuth MUST include `?client=mobile`.
6. The external browser/Custom Tab is expected for provider authentication; the final redirect must return to `woldeok-moneyverse://oauth/callback`.
7. Do not expose admin, worker, Discord webhook or database access to the ordinary app.
8. Handle 401, 403, 409, 422, 429 and 5xx as distinct states.

## 1. Architecture

`Native UI -> HTTPS BFF (/app-api/v1) -> Next.js server -> private NestJS API -> PostgreSQL`

The BFF attaches the server-only internal credential and forwards only reviewed member-facing routes. The native client must not construct `/api/v1/*` backend URLs or send `x-internal-token`. Read state is authoritative from the server. For balance, orders, settlements, rewards and inventory, never finalize optimistic state before the server confirms it.

## 2. Shared HTTP client

Use `https://easy-scraping.com` as the base origin, JSON for ordinary requests, bounded timeouts, one CookieJar and a CSRF store. Store every `Set-Cookie`, send matching cookies automatically, and replace the CSRF token whenever the server returns a fresh value. Never log passwords, session cookies, CSRF values, email verification tokens, provider codes/state or mobile handoff codes.

Recommended state machine:

```text
SignedOut -> Prelogin -> (LocalRegister | LocalLogin | OAuthBrowser)
OAuthBrowser -> HandoffPending -> SignedIn
SignedIn -> ConsentRequired when the server reports stale consent
```

On app launch, load the CookieJar and call `/app-api/v1/auth/viewer`; never infer an authenticated state merely because a cookie exists locally.

## 3. First-party registration

Exact order: `prelogin -> policy -> consent -> local/register -> email verification -> local/verify-email -> viewer`.

- `POST /auth/prelogin-session`: create pre-auth session, save cookie and `csrfToken`.
- `GET /auth/policy`: fetch current terms/privacy versions; do not hard-code them.
- `PUT /auth/consent`: send current cookie, CSRF and the server-provided policy versions.
- `POST /auth/local/register`: send email/password/displayName. Password is non-empty, maximum 128 code points, with obvious common-password rejection possible.
- `POST /auth/local/verify-email`: same prelogin cookie/CSRF plus the verification token received through email. Save the new login cookie and CSRF.
- `GET /auth/viewer`: require `signedIn:true`.

Production does not return the raw verification token in the registration JSON response.

## 4. First-party login

Exact order: `prelogin -> local/login -> viewer`. Use the prelogin cookie and CSRF on `/auth/local/login`, persist the replacement session cookie and new CSRF, then call viewer. Unknown email and wrong password intentionally collapse to the same authentication-failure class.

## 5. Native Google/Discord OAuth

### 5.1 Correct start URLs

- `GET /app-api/v1/auth/google/authorize?client=mobile`
- `GET /app-api/v1/auth/discord/authorize?client=mobile`

Omitting `client=mobile` selects the web-login flow and therefore ends on the website. Do not start native auth by directly calling `/auth/{provider}/authorize`.

The BFF returns:

```json
{"authorizationUrl":"https://easy-scraping.com/auth/google/authorize?client=mobile"}
```

Open only the returned `authorizationUrl` in a system browser or secure Custom Tab. Do not collect Google/Discord passwords in the app.

### 5.2 Server logic

The browser route establishes a prelogin browser session, then redirects to the provider. The backend validates state, PKCE, nonce/provider response and identity. For a mobile challenge, the resulting browser session is revoked and the server creates a five-minute single-use opaque handoff. Only its SHA-256 hash is persisted.

### 5.3 App return and handoff

The browser redirects to:

`woldeok-moneyverse://oauth/callback?code=<opaque>&provider=<google|discord>`

The Android activity must register VIEW + DEFAULT + BROWSABLE for scheme `woldeok-moneyverse`, host `oauth`, path `/callback`. If the deep link is absent or mismatched, no server change can force Android to open the app.

Exchange immediately:

```http
POST /app-api/v1/auth/mobile/handoff
Content-Type: application/json

{"code":"<opaque>"}
```

Persist the returned app session cookie and CSRF, then verify with `/auth/viewer`. The handoff is single-use; reuse, expiration or mutation returns 401.

## 6. Authenticated session and CSRF

Use `GET /app-api/v1/auth/session` when a fresh CSRF is required. Use `POST /app-api/v1/auth/logout` to revoke the server session and clear local auth state only after processing the response cookie invalidation. Identity linking and step-up reauthentication may require current consent and CSRF.

## 7. Status handling

| Status | Client behavior |
|---|---|
| 200/201/202 | parse body, cookies and CSRF |
| 204 | success without body |
| 400 | invalid request/flow |
| 401 | authentication/expiry/handoff failure; restart auth when appropriate |
| 403 | consent, CSRF, authorization or state requirement failed |
| 404 | route mismatch or unimplemented surface; never silently ignore in release builds |
| 409 | concurrency/state/version conflict; re-fetch authoritative state |
| 422 | DTO/input validation error |
| 429 | rate limited; do not hammer retry |
| 5xx | service failure; keep internals hidden and show retry UI |

## 8. Feature behavior

Wallet/transfers, banking, stocks, businesses, work, progression, rewards, shop, seasons and casino operations are server-authoritative. Disable duplicate action buttons while writes are in flight. After a successful write, use the response and/or re-fetch the relevant resource; do not calculate final balance, settlement, fill price, reward, inventory or payout locally. GET failures may be retried in a bounded way, but money/economy writes must not be blindly retried after an ambiguous network failure.

Board/profile/photo uploads send actual image bytes with the correct content type. The flow is upload -> receive storage key -> create/update the resource with that key. Do not wrap image bytes in arbitrary base64 JSON.

Privacy requests live under `/privacy/*`; account lifecycle uses `DELETE /account` and must honor any session/CSRF/reauthentication requirement returned by the server.

## 9. App launch and screen loading

```text
launch
 -> restore CookieJar
 -> GET /auth/viewer
 -> signedIn ? authenticated shell : signed-out shell
 -> fetch fresh /auth/session when CSRF is required
 -> each screen fetches only its own feature GETs
```

Model each screen with loading/error/empty/success states. Never use stale local data as proof that a server-side action succeeded.

## 10. Forbidden native surfaces

The ordinary app must not use `/api/v1/admin/*`, `/api/v1/integrations/discord/*`, `/health`, scheduler/worker routes, direct database connectivity, private backend origins or internal credentials. Their absence from the native BFF is intentional security isolation.

## 11. Store-review QA

Before submission verify: production build SHA, public catalog 200, full local registration, review-account login + viewer, Google and Discord mobile OAuth on a real device, deep-link return, single-use handoff, authenticated core reads/writes, image upload, privacy/terms/account deletion entry points, no 404/5xx from exposed buttons, no unfinished feature exposed as a dead button, and no secrets in the binary.

## 12. Gemini implementation directive

Use this verbatim when generating the app: `Use only https://easy-scraping.com/app-api/v1/* with one persistent secure CookieJar and CSRF store. Native Google/Discord OAuth is GET /auth/{provider}/authorize?client=mobile through the BFF; open the returned authorizationUrl externally; receive woldeok-moneyverse://oauth/callback?code=...; POST the code to /auth/mobile/handoff; persist Set-Cookie; call /auth/viewer; accept login only when signedIn===true. Never call the private backend, never embed internal tokens/secrets, and re-sync authoritative server state after economy writes.`

## Audited user-facing app API route inventory

Basis: actual NestJS route map captured after the 2026-09-13 production restart. Total backend routes: **239**. User-facing app mappings below include the added mobile handoff route. Admin, Discord webhook, health probe, worker and control-plane routes are intentionally excluded.

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
| `POST` | `/app-api/v1/auth/mobile/handoff` | `/api/auth/mobile/handoff` |
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


