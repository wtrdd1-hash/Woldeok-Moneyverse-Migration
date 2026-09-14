# Woldeok Moneyverse Mobile App — Complete API Implementation Specification

**English canonical** | [한국어](mobile-api-complete-spec.ko.md)

> Version: v2026.09.14.2
> Date: 2026-09-14
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

## How to read the API dictionary

This table is an implementation dictionary, not only a route list. Read **Function** first to understand which screen/action owns the endpoint, then check **Auth / CSRF** before calling it. GET reads authoritative server state; POST/PUT/DELETE mutate it. Disable duplicate taps, follow CSRF and idempotency rules, and re-fetch authoritative economy state after successful writes.


## 31. Native implementation playbook

Use one production origin (`https://easy-scraping.com`), one persistent secure CookieJar, and one CSRF store for every Moneyverse request. Never construct private `/api/*` URLs in the app. Persist every `Set-Cookie`; replace the CSRF token whenever the server returns a new one.

For idempotent writes, generate one UUID v4 per user action and reuse the same UUID when safely retrying the same ambiguous action. Do not create a new UUID for each network retry. Automatically retry only read-only GETs in a bounded way; writes require explicit idempotency/state reasoning.

App launch: restore CookieJar -> GET `/app-api/v1/auth/viewer` -> enter authenticated UI only when `signedIn === true`. Network failure is an unknown/offline state, not proof of logout.

Local registration: prelogin -> policy -> consent -> local/register -> email token -> local/verify-email -> viewer. Local login: prelogin -> local/login -> viewer.

Native Google/Discord: GET `/app-api/v1/auth/{provider}/authorize?client=mobile`, open returned `authorizationUrl` externally, receive `woldeok-moneyverse://oauth/callback?code=...`, POST the code to `/auth/mobile/handoff`, persist the returned cookie/CSRF, then verify viewer. Omitting `client=mobile` intentionally selects the web flow.

Android must register a browsable deep link for scheme `woldeok-moneyverse`, host `oauth`, path `/callback`. If the browser reaches the custom URI but the app does not open, fix the Android manifest before changing the server.

## 32. Important request-body contracts

Wallet transfer uses JSON integer amount: `{"recipientUserId":"<uuid>","amount":1000,"idempotencyKey":"<uuid>"}`. Bank movement uses `direction: deposit|withdraw`, integer `amount`, and UUID idempotency key. Some `/banking/*` operations intentionally use decimal integer **strings** such as `"1000"`; do not normalize every monetary field to JSON number.

Stock orders: `{"side":"buy|sell","quantity":3,"idempotencyKey":"<uuid>"}`. Watchlist: `{"watching":true}`. Business license activation: `{"catalogCode":"...","idempotencyKey":"<uuid>"}`. Business boost: `{"boostCode":"..."}`.

Shop ordinary purchase bodies contain the idempotency key, not a client-supplied price. Catalog purchase optionally adds integer `quantity` from 1 through 100. Work assignment creation uses `taskId` + idempotency key; completion uses idempotency key and optional evidence. Board post creation uses title/body/idempotencyKey and optional uploaded image storage key/alt text. Board update is replacement PUT, not partial PATCH.

Profile PUT is replacement-oriented; omitted optional fields may become null, so the client must distinguish “unchanged” from “clear”. Casino outcomes are server-authoritative; never generate or finalize payout client-side.

## 33. Response/error handling

200/201/202: parse body and cookies. 204: success with no JSON body. 401: auth/expiry/handoff failure. 403: consent/CSRF/authorization/reauth requirement. 404 on a documented app route is a release defect unless the resource id itself is absent. 409: re-fetch authoritative state. 422: payload/type/enum mismatch. 429: back off. 5xx: service failure; do not expose internals.

After economy writes (wallet/bank/stocks/business/shop/reward/casino), re-fetch the related read model. Do not calculate authoritative balance, fill price, settlement, reward, inventory or payout locally.


## 29. Response contract for crash-free native clients

`GET /app-api/v1/wallet` returns WLD monetary values as decimal strings, not JSON numbers. Native models MUST decode `balances.cash.availableAmount`, `balances.bank.availableAmount`, `balances.totalAvailableAmount`, and `recentTransactions[].netAmount` as strings. A newly registered user may have an empty `recentTransactions` array and this is a valid success response. Registration completion provisions USER_CASH and USER_BANK accounts before the authenticated wallet read. After email verification, verify `/auth/viewer` first, then call `/wallet` with the same CookieJar. A single card/API failure must never terminate the application process; isolate request failures and render per-feature error state.

## 34. v2026.09.14.2 runtime stability contract

Native API failures must never terminate the app process. Parallel startup reads need independent failure boundaries (`SupervisorJob`/`supervisorScope` or per-request `Result` in Kotlin). One failed wallet/profile/card request becomes that surface's recoverable error state, not a global coroutine failure.

Preserve JSON types exactly. Economy decimal values may be JSON strings such as `"1000"`; deserialize them as `String` and explicitly convert to `BigDecimal` in the domain layer. Empty arrays are valid. Optional fields must not be forced with `!!`. Handle 401/403/404/409/422/429/5xx, timeout and decode errors distinctly and without process termination.

Production read traffic uses a high read-only request budget so normal native startup bursts should not hit 429. Sensitive writes, login, registration and OAuth remain abuse-protected. A 429 is recoverable: honor `Retry-After` when present and use bounded backoff.

## 35. Registration email delivery

Production registration is fail-closed: `POST /auth/local/register` may return 503 when verification-email delivery is unavailable. The app must display a recoverable delivery error rather than retrying indefinitely or crashing. Production may use an unauthenticated SMTP relay only when the relay host is loopback (`127.0.0.1`, `::1`, `localhost`); remote SMTP still requires username and password.

Registration is complete only after verification, saving the new session cookie/CSRF, and `/auth/viewer` returning `signedIn:true`. A newly activated account receives `USER_CASH` and `USER_BANK`; an empty transaction array is valid.

## 36. Native OAuth browser completion

The exact mobile flow is: `authorize?client=mobile` → external provider → stored `mobile_client=true` challenge → server-generated one-time handoff → browser completion page attempts `woldeok-moneyverse://oauth/callback` and provides an **Open Woldeok Moneyverse app** tap fallback → app POSTs the opaque code to `/auth/mobile/handoff` → stores Set-Cookie/CSRF → verifies `/auth/viewer`.

Provider authorization `code/state` is not the mobile handoff code. Fake, expired or replayed handoff codes correctly return 401.

## 37. Google Play account/data deletion

Public URLs that must return 200 without login:

- `https://easy-scraping.com/account-deletion`
- `https://easy-scraping.com/data-deletion`

Account deletion uses `DELETE /app-api/v1/account` and requires an authenticated/current-consent session, CSRF and recent step-up reauthentication. Success is 202 and begins account deletion/session revocation. When that reauthentication path is unavailable, the public page provides the documented verified-email fallback request path.

Data deletion while keeping the account is requested through `POST /app-api/v1/privacy/requests`:

```json
{"requestType":"deletion","detail":"minimal scope description","idempotencyKey":"UUID"}
```

Supported request types are `access`, `correction`, `restriction`, `withdrawal`, and `deletion`. This records a data-subject request; the client must not pretend all data was synchronously erased. Re-read `GET /privacy/requests` for server status.

The published retention schedule states: OAuth/profile identifiers within 30 days after withdrawal; profile/gallery files within 30 days after request; de-identified economy reconciliation records up to one year; consent evidence three years; ordinary access/authentication logs 90 days; admin/economy audit records up to one year; legally required/dispute/security records only for the documented necessary period.

## 38. Policy-version re-consent

Never hard-code policy versions. Read server policy/session/viewer state. When a published server change makes `consentCurrent:false`, keep the session, show the re-consent UI, PUT the server-provided `termsVersion` and `privacyVersion` to `/auth/consent`, then re-read viewer. Do not force logout solely because policy versions changed.

## 39. Release QA matrix

Test signed-out, prelogin, fresh registration, existing local login, Google/Discord handoff, stale-consent re-consent, wallet/profile and every main feature group, malformed/empty responses, 401/403/404/409/422/429/5xx/timeouts, and both Play deletion URLs. Native code must not call obsolete `/early-game/tasks` or `/activity/logs`; use `/early-game/today` and `POST /activity/events` where applicable.

## Audited user-facing app API route inventory

Basis: actual NestJS route map captured after the 2026-09-13 production restart. Total backend routes: **239**. User-facing app mappings below include the added mobile handoff route. Admin, Discord webhook, health probe, worker and control-plane routes are intentionally excluded.

| Method | App API | Function | When to call | Auth / CSRF | Client action after success | Backend route |
|---|---|---|---|---|---|---|
| `DELETE` | `/app-api/v1/account` | Delete the signed-in account | After explicit user delete/unlink confirmation | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/account` |
| `GET` | `/app-api/v1/account/identities` | List linked login identities | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/account/identities` |
| `DELETE` | `/app-api/v1/account/identities/:id` | Unlink a login identity | After explicit user delete/unlink confirmation | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/account/identities/:id` |
| `POST` | `/app-api/v1/account/identities/:provider/link` | Start linking a login provider | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/account/identities/:provider/link` |
| `GET` | `/app-api/v1/account/security/sessions` | List login sessions/devices | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/account/security/sessions` |
| `DELETE` | `/app-api/v1/account/security/sessions/:id` | Revoke a selected login session | After explicit user delete/unlink confirmation | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/account/security/sessions/:id` |
| `POST` | `/app-api/v1/account/security/sessions/revoke-others` | Revoke all other login sessions | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/account/security/sessions/revoke-others` |
| `POST` | `/app-api/v1/activity/events` | Record app activity event | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/activity/events` |
| `POST` | `/app-api/v1/auth/:provider/reauthentication` | Create/execute auth / :provider / reauthentication | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/auth/:provider/reauthentication` |
| `PUT` | `/app-api/v1/auth/consent` | Save terms/privacy/age consent | When the user confirms consent | Prelogin or signed-in session + CSRF | Re-fetch related reads and resync server state | `/api/auth/consent` |
| `POST` | `/app-api/v1/auth/local/login` | Sign in with email and password | When email-login is submitted | Auth flow only; follow state machine | Persist cookie/CSRF then verify /auth/viewer | `/api/auth/local/login` |
| `POST` | `/app-api/v1/auth/local/register` | Start email/password registration | When registration is submitted | Auth flow only; follow state machine | Re-fetch related reads and resync server state | `/api/auth/local/register` |
| `POST` | `/app-api/v1/auth/local/verify-email` | Verify email and activate the account | After receiving verification token | Auth flow only; follow state machine | Persist cookie/CSRF then verify /auth/viewer | `/api/auth/local/verify-email` |
| `POST` | `/app-api/v1/auth/logout` | Sign out and revoke current session | When the user submits/executes the feature | Signed in + current consent + CSRF | Apply cookie invalidation and clear local user state | `/api/auth/logout` |
| `POST` | `/app-api/v1/auth/mobile/handoff` | Exchange one-time mobile OAuth handoff code for an app session | Immediately after OAuth deep-link code | Auth flow only; follow state machine | Persist cookie/CSRF then verify /auth/viewer | `/api/auth/mobile/handoff` |
| `GET` | `/app-api/v1/auth/policy` | Read current policy versions | When opening consent/registration | Public/prelogin | Replace UI with authoritative server response | `/api/auth/policy` |
| `POST` | `/app-api/v1/auth/prelogin-session` | Create prelogin session and CSRF token | Before login/registration/OAuth | Auth flow only; follow state machine | Persist CookieJar and csrfToken | `/api/auth/prelogin-session` |
| `GET` | `/app-api/v1/auth/providers` | List enabled sign-in providers | Screen load/refresh/after related write | Public/prelogin | Replace UI with authoritative server response | `/api/auth/providers` |
| `GET` | `/app-api/v1/auth/session` | Read/refresh current auth session and CSRF | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/auth/session` |
| `GET` | `/app-api/v1/auth/viewer` | Read the current signed-in viewer | App launch and after login completion | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/auth/viewer` |
| `GET` | `/app-api/v1/bank/loans` | Read or create loans | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch wallet/bank reads | `/api/bank/loans` |
| `POST` | `/app-api/v1/bank/loans` | Read or create loans | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/bank/loans` |
| `POST` | `/app-api/v1/bank/loans/:id/repayments` | Read or create loans | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/bank/loans/:id/repayments` |
| `POST` | `/app-api/v1/bank/movements` | Move funds between cash and bank accounts | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/bank/movements` |
| `POST` | `/app-api/v1/banking/bonds/:id/redeem` | Create/execute banking / bonds / selected item / redeem | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/banking/bonds/:id/redeem` |
| `POST` | `/app-api/v1/banking/bonds/purchase` | Create/execute banking / bonds / purchase | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/banking/bonds/purchase` |
| `POST` | `/app-api/v1/banking/borrow` | Create/execute banking / borrow | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/banking/borrow` |
| `POST` | `/app-api/v1/banking/claim-interest` | Create/execute banking / claim-interest | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/banking/claim-interest` |
| `POST` | `/app-api/v1/banking/deposit` | Create/execute banking / deposit | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/banking/deposit` |
| `POST` | `/app-api/v1/banking/repay` | Create/execute banking / repay | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/banking/repay` |
| `GET` | `/app-api/v1/banking/standing` | Read banking/credit standing | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch wallet/bank reads | `/api/banking/standing` |
| `POST` | `/app-api/v1/banking/withdraw` | Create/execute banking / withdraw | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/banking/withdraw` |
| `GET` | `/app-api/v1/board/images/:key` | Read board image | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch post/comment list or detail | `/api/board/images/:key` |
| `POST` | `/app-api/v1/board/images/uploads` | Upload board image | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch post/comment list or detail | `/api/board/images/uploads` |
| `GET` | `/app-api/v1/board/posts` | Read/create posts | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch post/comment list or detail | `/api/board/posts` |
| `POST` | `/app-api/v1/board/posts` | Read/create posts | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch post/comment list or detail | `/api/board/posts` |
| `DELETE` | `/app-api/v1/board/posts/:id` | Read/update/delete post detail | After explicit user delete/unlink confirmation | Signed in + current consent + CSRF | Re-fetch post/comment list or detail | `/api/board/posts/:id` |
| `GET` | `/app-api/v1/board/posts/:id` | Read/update/delete post detail | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch post/comment list or detail | `/api/board/posts/:id` |
| `PUT` | `/app-api/v1/board/posts/:id` | Read/update/delete post detail | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch post/comment list or detail | `/api/board/posts/:id` |
| `GET` | `/app-api/v1/board/posts/:id/comments` | Read/create post comments | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch post/comment list or detail | `/api/board/posts/:id/comments` |
| `POST` | `/app-api/v1/board/posts/:id/comments` | Read/create post comments | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch post/comment list or detail | `/api/board/posts/:id/comments` |
| `DELETE` | `/app-api/v1/board/posts/:id/comments/:commentId` | Delete post comment | After explicit user delete/unlink confirmation | Signed in + current consent + CSRF | Re-fetch post/comment list or detail | `/api/board/posts/:id/comments/:commentId` |
| `GET` | `/app-api/v1/board/public/images/:key` | Read board / public / images / :key | Screen load/refresh/after related write | Public; no login required | Re-fetch post/comment list or detail | `/api/board/public/images/:key` |
| `GET` | `/app-api/v1/board/public/posts` | Read public post list | Screen load/refresh/after related write | Public; no login required | Re-fetch post/comment list or detail | `/api/board/public/posts` |
| `GET` | `/app-api/v1/board/public/posts/:id` | Read public post detail | Screen load/refresh/after related write | Public; no login required | Re-fetch post/comment list or detail | `/api/board/public/posts/:id` |
| `GET` | `/app-api/v1/board/public/posts/:id/comments` | Read public post comments | Screen load/refresh/after related write | Public; no login required | Re-fetch post/comment list or detail | `/api/board/public/posts/:id/comments` |
| `GET` | `/app-api/v1/board/public/stock-posts` | Read public stock posts | Screen load/refresh/after related write | Public; no login required | Re-fetch post/comment list or detail | `/api/board/public/stock-posts` |
| `POST` | `/app-api/v1/board/stock-posts` | Create stock-related post | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch post/comment list or detail | `/api/board/stock-posts` |
| `GET` | `/app-api/v1/businesses` | Read owned businesses | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch businesses/equity/catalog as relevant | `/api/businesses` |
| `POST` | `/app-api/v1/businesses/:id/boost` | Boost an owned business | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch businesses/equity/catalog as relevant | `/api/businesses/:id/boost` |
| `POST` | `/app-api/v1/businesses/:id/settle-v2` | Run V2 business settlement | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch businesses/equity/catalog as relevant | `/api/businesses/:id/settle-v2` |
| `POST` | `/app-api/v1/businesses/:id/settlements` | Run business settlement | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch businesses/equity/catalog as relevant | `/api/businesses/:id/settlements` |
| `POST` | `/app-api/v1/businesses/activate-license` | Activate a business license | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch businesses/equity/catalog as relevant | `/api/businesses/activate-license` |
| `GET` | `/app-api/v1/businesses/catalog` | Read business catalog | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch businesses/equity/catalog as relevant | `/api/businesses/catalog` |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | Purchase a business type | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch businesses/equity/catalog as relevant | `/api/businesses/catalog/:id/purchases` |
| `GET` | `/app-api/v1/businesses/equity` | Read capital available for business purchase | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch businesses/equity/catalog as relevant | `/api/businesses/equity` |
| `GET` | `/app-api/v1/businesses/my-v2` | Read owned-business V2 state | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch businesses/equity/catalog as relevant | `/api/businesses/my-v2` |
| `GET` | `/app-api/v1/casino/coin/fairness` | Read coin-game fairness proof | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/casino/coin/fairness` |
| `POST` | `/app-api/v1/casino/coin/plays` | Play coin game | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/casino/coin/plays` |
| `GET` | `/app-api/v1/casino/coin/terms` | Read coin-game rules | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/casino/coin/terms` |
| `GET` | `/app-api/v1/casino/dice/fairness` | Read dice-game fairness proof | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/casino/dice/fairness` |
| `POST` | `/app-api/v1/casino/dice/plays` | Play dice game | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/casino/dice/plays` |
| `GET` | `/app-api/v1/casino/games/terms` | Read casino game rules | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/casino/games/terms` |
| `GET` | `/app-api/v1/casino/history` | Read casino play history | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/casino/history` |
| `GET` | `/app-api/v1/casino/self-limit` | Read/update casino self-limits | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/casino/self-limit` |
| `PUT` | `/app-api/v1/casino/self-limit` | Read/update casino self-limits | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/casino/self-limit` |
| `GET` | `/app-api/v1/content/announcements` | Read announcements | Screen load/refresh/after related write | Public; no login required | Replace UI with authoritative server response | `/api/content/announcements` |
| `GET` | `/app-api/v1/content/photos` | Read/register gallery photos | Screen load/refresh/after related write | Public; no login required | Replace UI with authoritative server response | `/api/content/photos` |
| `GET` | `/app-api/v1/content/status` | Read service status | Screen load/refresh/after related write | Public; no login required | Replace UI with authoritative server response | `/api/content/status` |
| `POST` | `/app-api/v1/early-game/claims` | Claim early-game event reward | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/early-game/claims` |
| `GET` | `/app-api/v1/early-game/first-day` | Read first-day onboarding state | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/early-game/first-day` |
| `GET` | `/app-api/v1/early-game/today` | Read today early-game event | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/early-game/today` |
| `GET` | `/app-api/v1/engagement` | Read engagement progress | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/engagement` |
| `GET` | `/app-api/v1/engagement/early-game` | Read early-game engagement goals | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/engagement/early-game` |
| `POST` | `/app-api/v1/engagement/npcs/:code/orders` | Execute NPC order/interaction | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/engagement/npcs/:code/orders` |
| `PUT` | `/app-api/v1/engagement/preferences` | Update engagement preferences | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/engagement/preferences` |
| `GET` | `/app-api/v1/photos` | Read/register gallery photos | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/photos` |
| `POST` | `/app-api/v1/photos` | Read/register gallery photos | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/photos` |
| `GET` | `/app-api/v1/photos/mine` | Read own gallery photos | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/photos/mine` |
| `POST` | `/app-api/v1/photos/uploads` | Upload gallery image bytes | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/photos/uploads` |
| `GET` | `/app-api/v1/privacy/requests` | Read/create privacy requests | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch privacy request list | `/api/privacy/requests` |
| `POST` | `/app-api/v1/privacy/requests` | Read/create privacy requests | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch privacy request list | `/api/privacy/requests` |
| `GET` | `/app-api/v1/profile` | Read/update own profile | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch profile and replace UI state | `/api/profile` |
| `PUT` | `/app-api/v1/profile` | Read/update own profile | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch profile and replace UI state | `/api/profile` |
| `GET` | `/app-api/v1/profile/:userId` | Read another user public profile | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch profile and replace UI state | `/api/profile/:userId` |
| `DELETE` | `/app-api/v1/profile/image` | Create/delete profile image | After explicit user delete/unlink confirmation | Signed in + current consent + CSRF | Re-fetch profile and replace UI state | `/api/profile/image` |
| `POST` | `/app-api/v1/profile/image` | Create/delete profile image | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch profile and replace UI state | `/api/profile/image` |
| `GET` | `/app-api/v1/profile/settings` | Read profile settings | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch profile and replace UI state | `/api/profile/settings` |
| `GET` | `/app-api/v1/progression` | Read overall progression | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/progression` |
| `GET` | `/app-api/v1/progression/credit` | Read credit/progression score | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/progression/credit` |
| `GET` | `/app-api/v1/progression/early-game` | Read early-game progression | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/progression/early-game` |
| `POST` | `/app-api/v1/progression/refreshes` | Refresh/recalculate progression | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/progression/refreshes` |
| `GET` | `/app-api/v1/rewards/availability` | Read available rewards | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/rewards/availability` |
| `POST` | `/app-api/v1/rewards/daily/claims` | Claim daily reward | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/rewards/daily/claims` |
| `POST` | `/app-api/v1/rewards/work/claims` | Read work/job dashboard | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant work/profile/tasks/receipts | `/api/rewards/work/claims` |
| `GET` | `/app-api/v1/seasons/events` | Read active season events | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/seasons/events` |
| `POST` | `/app-api/v1/seasons/events/:id/consumptions` | Consume season-event resource/item | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch related reads and resync server state | `/api/seasons/events/:id/consumptions` |
| `GET` | `/app-api/v1/seasons/events/:id/leaderboard` | Read season-event leaderboard | Screen load/refresh/after related write | Signed in; current consent may be required | Replace UI with authoritative server response | `/api/seasons/events/:id/leaderboard` |
| `GET` | `/app-api/v1/shop/catalog` | Read shop catalog | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch holdings/purchases/balance | `/api/shop/catalog` |
| `POST` | `/app-api/v1/shop/catalog/:id/purchases` | Purchase catalog item | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch holdings/purchases/balance | `/api/shop/catalog/:id/purchases` |
| `GET` | `/app-api/v1/shop/cosmetics/:userId` | Read shop / cosmetics / :userId | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch holdings/purchases/balance | `/api/shop/cosmetics/:userId` |
| `GET` | `/app-api/v1/shop/holdings` | Read owned items | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch holdings/purchases/balance | `/api/shop/holdings` |
| `POST` | `/app-api/v1/shop/holdings/:id/consumptions` | Consume an owned item | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch holdings/purchases/balance | `/api/shop/holdings/:id/consumptions` |
| `POST` | `/app-api/v1/shop/holdings/:id/equip` | Equip an owned cosmetic | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch holdings/purchases/balance | `/api/shop/holdings/:id/equip` |
| `POST` | `/app-api/v1/shop/holdings/:id/upkeep-settlements` | Settle upkeep for an owned item | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch holdings/purchases/balance | `/api/shop/holdings/:id/upkeep-settlements` |
| `GET` | `/app-api/v1/shop/items` | Read shop items | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch holdings/purchases/balance | `/api/shop/items` |
| `POST` | `/app-api/v1/shop/items/:id/purchases` | Purchase a shop item | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch holdings/purchases/balance | `/api/shop/items/:id/purchases` |
| `GET` | `/app-api/v1/shop/public-catalog` | Read public shop catalog | Screen load/refresh/after related write | Public; no login required | Re-fetch holdings/purchases/balance | `/api/shop/public-catalog` |
| `GET` | `/app-api/v1/shop/purchases` | Read purchase history | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch holdings/purchases/balance | `/api/shop/purchases` |
| `GET` | `/app-api/v1/stocks` | List tradable stocks | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks` |
| `GET` | `/app-api/v1/stocks/:id/candles` | Read OHLC candles for a stock | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/:id/candles` |
| `POST` | `/app-api/v1/stocks/:id/orders` | Create a buy/sell order for a stock | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant stock/portfolio/history state | `/api/stocks/:id/orders` |
| `GET` | `/app-api/v1/stocks/:id/prices` | Read stock prices | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/:id/prices` |
| `POST` | `/app-api/v1/stocks/:id/watchlist` | Add/update a stock in the watchlist | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant stock/portfolio/history state | `/api/stocks/:id/watchlist` |
| `GET` | `/app-api/v1/stocks/alerts` | Read/create stock alerts | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/alerts` |
| `POST` | `/app-api/v1/stocks/alerts` | Read/create stock alerts | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant stock/portfolio/history state | `/api/stocks/alerts` |
| `DELETE` | `/app-api/v1/stocks/alerts/:id` | Read/create stock alerts | After explicit user delete/unlink confirmation | Signed in + current consent + CSRF | Re-fetch relevant stock/portfolio/history state | `/api/stocks/alerts/:id` |
| `GET` | `/app-api/v1/stocks/alerts/events` | Read triggered stock alert events | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/alerts/events` |
| `GET` | `/app-api/v1/stocks/history` | Read stock trade history | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/history` |
| `GET` | `/app-api/v1/stocks/market-events` | Read market events | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/market-events` |
| `GET` | `/app-api/v1/stocks/portfolio` | Read stock portfolio | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/portfolio` |
| `GET` | `/app-api/v1/stocks/sparklines` | Read compact chart price series | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/sparklines` |
| `GET` | `/app-api/v1/stocks/watchlist` | Read stock watchlist | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant stock/portfolio/history state | `/api/stocks/watchlist` |
| `GET` | `/app-api/v1/wallet` | Read wallet and account balances | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch wallet/bank reads | `/api/wallet` |
| `POST` | `/app-api/v1/wallet/transfers` | Transfer WLD to another user | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch wallet/bank reads | `/api/wallet/transfers` |
| `GET` | `/app-api/v1/work` | Read work/job dashboard | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant work/profile/tasks/receipts | `/api/work` |
| `POST` | `/app-api/v1/work/active-job` | Change active job | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant work/profile/tasks/receipts | `/api/work/active-job` |
| `GET` | `/app-api/v1/work/assignments` | Read/create work assignments | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant work/profile/tasks/receipts | `/api/work/assignments` |
| `POST` | `/app-api/v1/work/assignments` | Read/create work assignments | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant work/profile/tasks/receipts | `/api/work/assignments` |
| `POST` | `/app-api/v1/work/assignments/:id/completions` | Submit work assignment completion | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant work/profile/tasks/receipts | `/api/work/assignments/:id/completions` |
| `POST` | `/app-api/v1/work/assignments/:id/verify` | Verify work assignment completion | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant work/profile/tasks/receipts | `/api/work/assignments/:id/verify` |
| `GET` | `/app-api/v1/work/profile` | Read/update own profile | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant work/profile/tasks/receipts | `/api/work/profile` |
| `GET` | `/app-api/v1/work/receipts` | Read work reward receipts | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant work/profile/tasks/receipts | `/api/work/receipts` |
| `GET` | `/app-api/v1/work/tasks` | Read available work tasks | Screen load/refresh/after related write | Signed in; current consent may be required | Re-fetch relevant work/profile/tasks/receipts | `/api/work/tasks` |
| `POST` | `/app-api/v1/work/tasks/:id/complete` | Complete a work task | When the user submits/executes the feature | Signed in + current consent + CSRF | Re-fetch relevant work/profile/tasks/receipts | `/api/work/tasks/:id/complete` |
| `GET` | `/app-api/v1/auth/:provider/authorize` | Read auth / :provider / authorize | Screen load/refresh/after related write | Auth flow only; follow state machine | Replace UI with authoritative server response | `/auth/:provider/authorize` |
| `GET` | `/app-api/v1/auth/:provider/callback` | Read auth / :provider / callback | Screen load/refresh/after related write | Auth flow only; follow state machine | Replace UI with authoritative server response | `/auth/:provider/callback` |
| `GET` | `/app-api/v1/media/:key` | Read media file | Screen load/refresh/after related write | Public; no login required | Replace UI with authoritative server response | `/media/:key` |
| `GET` | `/app-api/v1/media/profile/:key` | Read/update own profile | Screen load/refresh/after related write | Public; no login required | Re-fetch profile and replace UI state | `/media/profile/:key` |




## v2026.09.14.71 — Native OAuth browser-session isolation

Native Google/Discord login must not reuse an already-authenticated website session that happens to exist in the external browser. For every `client=mobile` authorization, the API creates a dedicated anonymous pre-login session and binds the OAuth challenge to it. At callback time, ordinary web challenges remain bound to the browser session, while mobile challenges may be recovered by their high-entropy single-use `state + provider`. The server then verifies the provider code, completes OAuth login against the dedicated pre-login session, creates a one-time `mobileHandoff`, returns through `woldeok-moneyverse://oauth/callback`, and the app exchanges the handoff at `POST /app-api/v1/auth/mobile/handoff` before confirming `/auth/viewer` returns `signedIn:true`.

This isolation is required because Android system browsers and Custom Tabs can share existing website cookies. Passing a browser session that already has a `user_id` into the OAuth login completer is invalid and is rejected as `active pre-login session required`; the native client must not attempt to work around that server invariant.
