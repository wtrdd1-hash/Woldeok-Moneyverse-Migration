# Mobile App API Runtime Contract

**English** | [한국어](mobile-api-runtime-contract.ko.md) | [Complete mobile API specification](mobile-api-complete-spec.md)

Update version: **v2026.09.14.76**

This document fixes the runtime contract that Android/iOS clients must implement. It covers session cookies, CSRF, nullability, profile data, board data, gallery data, and concrete JSON shapes rather than merely listing endpoints.

## 1. Single app API origin

The app calls only `https://easy-scraping.com/app-api/v1/*`. `/api/v1/*` is not the native-app contract. Never embed a private backend address or `INTERNAL_API_TOKEN` in the app.

Use one persistent secure CookieJar after login. Persist every `Set-Cookie` response and automatically send the same session cookie on subsequent requests. Send the latest `csrfToken` as `X-CSRF-Token` on state-changing requests.

## 2. Authentication state machine

At launch call `GET /app-api/v1/auth/viewer`. Treat login as complete only when the server returns `signedIn === true`.

```json
{"signedIn":true,"consentCurrent":true,"adminRoles":[]}
```

A network failure is an unknown/offline state, not proof of logout.

Email registration: create/reuse a prelogin session, POST registration, verify the email, persist the returned cookie/CSRF token, then verify `auth/viewer`. Known mail-domain typos are rejected with 400 instead of silently attempting delivery.

Native Google/Discord: request `/auth/{provider}/authorize?client=mobile`, open `authorizationUrl` externally, receive `woldeok-moneyverse://oauth/callback?code=...`, exchange that opaque code once at `/auth/mobile/handoff`, persist cookie/CSRF, then verify viewer. Never log a handoff code.

## 3. Own-profile contract and null handling

`GET /app-api/v1/profile` returns the authenticated member. Since v2026.09.14.76 it explicitly includes app-facing camelCase fields while retaining the legacy snake_case fields inside `profile` for web compatibility.

```json
{
  "displayName":"Woldeok",
  "imageUrl":null,
  "joinedAt":"2026-09-14T03:00:00.000Z",
  "jobType":null,
  "jobLevel":0,
  "workCompletions":"0",
  "visibility":"members",
  "featuredTitle":null,
  "email":"member@example.com",
  "profile":{
    "display_name":"Woldeok",
    "image_url":null,
    "joined_at":"2026-09-14T03:00:00.000Z",
    "job_type":null,
    "job_level":null,
    "work_completions":"0",
    "visibility":"members",
    "featured_title":null,
    "displayName":"Woldeok",
    "imageUrl":null,
    "joinedAt":"2026-09-14T03:00:00.000Z",
    "jobType":null,
    "jobLevel":0,
    "workCompletions":"0",
    "featuredTitle":null,
    "email":"member@example.com"
  }
}
```

New app code should consume the top-level camelCase fields. Do not guess `name`, `username`, or another key.

Nullability is semantic: `jobType` may be null before a job exists; `jobLevel` is normalized to 0; `workCompletions` is a decimal string to preserve bigint precision; `featuredTitle` may be null when no representative title is selected; `imageUrl` may be null; `email` is populated only for the member's verified local-email credential. OAuth-only accounts currently have no stored email, so `email:null` is valid. Never render a nullable value as the literal string `null`.

`displayName` is backed by the profile name or first linked identity display name. `joinedAt` is the account creation timestamp and is non-null for an active member.

## 4. Profile writes

`PUT /app-api/v1/profile` is a full replacement, not PATCH. Send the complete current state when preserving existing fields.

```json
{
  "visibility":"members",
  "displayName":"Woldeok",
  "imageUrl":null,
  "fieldVisibility":{"imageUrl":"public","jobType":"members","workCompletions":"members","featuredTitle":"public"},
  "featuredTitle":null
}
```

Writes require `X-CSRF-Token`. Re-fetch `GET /profile` after success and replace local UI state with the authoritative response.

`GET /profile/:userId` remains a privacy-filtered public/member profile and never exposes email or private account identifiers.

## 5. Board

Authenticated list: `GET /app-api/v1/board/posts` → `{ "posts": [...] }` where each summary uses `postId`, `title`, `authorName`, `createdAt`, nullable `updatedAt`, `commentCount`, `mine`, and `hasImage`.

Detail: `GET /board/posts/:id` → `{ "post": {...} }`.
Comments: `GET /board/posts/:id/comments` → `{ "comments": [...] }`.
Writes require a CSRF token and UUID idempotency key. Public anonymous reads use `/board/public/posts*`.

## 6. Gallery

Public gallery: `GET /app-api/v1/content/photos` → `{ "photos": [...] }` using `photoId`, `imageUrl`, `altText`, and `publishedAt`.

Member upload is two-step: POST raw image bytes to `/photos/uploads`, then POST the returned `storageKey` plus `altText` and an `idempotencyKey` to `/photos`. Read the caller's submissions at `/photos/mine`. The public gallery and member submission queue are intentionally different resources.

## 7. HTTP behavior

200/201/204 are success. 400 is invalid input, 401 missing/expired auth or invalid handoff, 403 authorization/CSRF refusal, 404 missing or privacy-hidden resource, 409 state conflict, 428 consent required, 429 rate limiting, and 503 unavailable required dependency.

Never deserialize a non-2xx response as an empty success model. Do not overwrite a previously valid screen model with nulls after an HTTP error.

## 8. Client checklist

- One persistent CookieJar for login and every API call.
- Persist `Set-Cookie`; do not manually parse it into ad-hoc strings.
- Keep CSRF in secure storage and send it on writes.
- Use `auth/viewer.signedIn` as the login truth value.
- Respect JSON wrappers exactly (`profile`, `posts`, `comments`, `photos`).
- Use camelCase app fields; snake_case fields are compatibility data.
- Render placeholders for nullable values instead of `null`.
- Re-fetch authoritative GET state after writes.
- Do not turn 401/428/429/5xx into empty data.
- Never log handoff codes, session cookies, CSRF tokens, or internal tokens.

## 9. Release verification

Before Production, isolated Test must serve the exact release SHA, `/app-api/v1/shop/public-catalog` must prove the backend/DB route, authenticated viewer/profile probes must pass, local-email must be owner-only, public profile must not expose email, board/gallery wrappers must match this contract, and Test must retain `X-Robots-Tag: noindex`. Production promotion uses that same exact SHA through GitOps.
