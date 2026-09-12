# Woldeok Moneyverse Mobile App UI/UX Implementation Specification

> Version: v2026.09.12.34
> Date: 2026-09-12
> Status: Implementation specification
> Korean: [mobile-app-ui-ux-spec.ko.md](mobile-app-ui-ux-spec.ko.md)
> API contract: [mobile-api-all-features.md](mobile-api-all-features.md)

## 1. Purpose

This document defines the mobile application screen architecture, navigation, UI states, API bindings, permissions, and implementation rules for Woldeok Moneyverse.

The goal is not to reproduce the website pixel-for-pixel. The app should expose the same member-facing product capabilities through a mobile-first information architecture while preserving the existing server-side security model.

Architecture:

`Mobile App -> HTTPS -> /app-api/v1/* BFF -> NestJS /api/v1/* -> PostgreSQL`

The app must never embed `INTERNAL_API_TOKEN`, database credentials, service secrets, or privileged internal endpoints.

## 2. Product navigation model

### 2.1 Primary bottom navigation

Use five primary tabs:

1. **Home** — dashboard, balance summary, daily status, shortcuts
2. **Economy** — wallet, bank, stocks, businesses, shop
3. **Play** — work, progression, rewards, seasons, casino where legally/operationally enabled
4. **Community** — board, profiles, media, activity
5. **My** — account, privacy, security, settings

Deep features should open inside each tab stack rather than becoming additional bottom tabs.

### 2.2 Global top-level surfaces

- Notification center
- Global search where supported
- Service-status banner
- Session-expired sheet
- Reauthentication modal
- Generic confirmation sheet
- Network/offline banner

### 2.3 Navigation persistence

Each bottom tab should preserve its own navigation stack. Switching tabs must not discard in-progress read state. Forms may retain safe draft data locally, but passwords, auth tokens, payment/security secrets, CSRF tokens, and session material must never be persisted as drafts.

## 3. Common screen states

Every data-driven screen must support these states:

- `initial_loading`
- `refreshing`
- `content`
- `empty`
- `recoverable_error`
- `permission_denied`
- `reauth_required`
- `session_expired`
- `offline`

Do not use a blank white screen while an API request is pending.

### 3.1 Loading

- Use skeletons for lists/cards.
- Use a blocking spinner only for atomic user-triggered operations such as login or final purchase confirmation.
- Pull-to-refresh should refresh only the current logical screen.

### 3.2 Error handling

Errors should be mapped into user-safe categories:

- Validation error: inline field error
- Authentication/session error: session-expired sheet -> login flow
- Authorization error: permission explanation
- Conflict/idempotency error: show latest server state and avoid duplicate action
- Rate limit: show retry guidance without leaking account existence
- Server/network error: retry action

Do not display raw SQL, stack traces, internal exception messages, internal IDs, or secret-bearing headers.

## 4. Authentication and onboarding screens

### AUTH-001 — Welcome

Purpose: first launch and signed-out entry.

UI:
- Product logo/title
- `Create account`
- `Sign in`
- `Continue with Google`
- `Continue with Discord`
- Terms/privacy links
- Service-status indicator

API:
- `POST /app-api/v1/auth/prelogin-session`
- `GET /app-api/v1/auth/policy`
- `GET /app-api/v1/auth/providers`

Rules:
- Pre-login session should be created before sensitive auth operations.
- Provider availability comes from the server rather than hard-coded assumptions.

### AUTH-002 — Policy consent

UI:
- Required terms version
- Privacy policy version
- Optional consent items separated from required items
- `Agree and continue`

API:
- `GET /app-api/v1/auth/policy`
- `PUT /app-api/v1/auth/consent`

Rules:
- Do not pre-check optional consent.
- Persist only server-confirmed consent state.

### AUTH-003 — Local registration

Fields:
- Email
- Password
- Password confirmation
- Display name only if required by current product contract

UX:
- Password length guidance
- Allow paste/password managers
- Do not require arbitrary symbol/uppercase composition rules
- Generic account-existence handling

API:
- `POST /app-api/v1/auth/local/register`

Success -> `AUTH-004 Email verification pending`.

### AUTH-004 — Email verification pending

UI:
- Masked destination email
- Verification instructions
- `I have verified`
- Resend control only when server API supports it
- Change account / restart

API:
- `POST /app-api/v1/auth/local/verify-email`

Production rule: never expect a raw verification token to be returned by the registration API.

### AUTH-005 — Local sign in

Fields:
- Email
- Password

Actions:
- Sign in
- Forgot password when backend support is complete
- Switch to Google/Discord

API:
- `POST /app-api/v1/auth/prelogin-session`
- `POST /app-api/v1/auth/local/login`

UX:
- Same visible error family for unknown account and wrong password.
- Disable repeated submission while the request is in flight.

### AUTH-006 — OAuth launch

Providers: Google, Discord.

API:
- `GET /app-api/v1/auth/google/authorize`
- `GET /app-api/v1/auth/discord/authorize`

Behavior:
- Open system browser or secure auth session.
- Use PKCE/state supplied by server flow.
- Return to app using approved callback/deep link.
- After callback, refresh session/bootstrap state.

### AUTH-007 — Reauthentication

Used for high-risk operations:
- Identity unlink
- Security changes
- Privacy export/delete
- Other server-marked sensitive actions

This should be a reusable modal/sheet, not a duplicated page for every feature.

## 5. Home

### HOME-001 — Dashboard

Purpose: single at-a-glance member home.

Sections:
- Greeting/profile summary
- Wallet available balance
- Bank balance/loan summary
- Daily reward status
- Work availability/current job
- Progression/level card
- Business summary
- Stock portfolio summary
- Season/event card
- Latest announcement
- Quick actions

Recommended quick actions:
- Work
- Deposit/withdraw
- Transfer
- Claim reward
- Buy/sell stock
- Business settlement

APIs may aggregate from:
- `/app-api/v1/profile/*`
- `/app-api/v1/wallet/*`
- `/app-api/v1/banking/*`
- `/app-api/v1/rewards/*`
- `/app-api/v1/work/*`
- `/app-api/v1/progression/*`
- `/app-api/v1/businesses/*`
- `/app-api/v1/stocks/*`
- `/app-api/v1/content/announcements`

Implementation note: if no dedicated dashboard aggregation endpoint exists, initially request independent cards concurrently with per-card failure isolation. A later optimized dashboard endpoint may reduce request count.

## 6. Economy screens

### ECO-001 — Economy hub

Cards:
- Wallet
- Bank
- Stocks
- Businesses
- Shop

Each card shows a compact server-derived summary and opens its feature stack.

### WAL-001 — Wallet

UI:
- Current spendable balance
- Pending/locked amounts if applicable
- Recent ledger entries
- Transfer action

API root: `/app-api/v1/wallet/*`

Mutation rules:
- Amount uses server-supported precision.
- Confirm recipient and amount before submit.
- Never optimistically alter authoritative balance before server confirmation.

### WAL-002 — Transfer

Fields:
- Recipient identifier supported by API
- Amount
- Optional memo if supported

Flow:
`Input -> review -> submit -> server receipt -> updated balance`

Show a stable server transaction/receipt reference when available.

### BNK-001 — Banking dashboard

UI:
- Deposit balance
- Available cash
- Active loans
- Interest/repayment information
- Recent bank activity

API roots:
- `/app-api/v1/bank/*`
- `/app-api/v1/banking/*`

### BNK-002 — Deposit / withdraw

Use a segmented action screen:
- Deposit
- Withdraw

Always show source and destination balances before confirmation.

### BNK-003 — Loans

UI:
- Eligible products
- Principal
- Rate/fee terms returned by server
- Outstanding amount
- Next repayment information
- Repay action

Never calculate eligibility or authoritative interest entirely on-device.

### STK-001 — Stock market

UI:
- Market summary
- Search/filter
- Symbol list
- Price/change
- Trading status

API root: `/app-api/v1/stocks/*`

### STK-002 — Stock detail

UI:
- Symbol/name
- Current server price
- Historical chart if API supports history
- Holdings
- Buy/Sell buttons
- Market rules/limits

### STK-003 — Order ticket

Flow:
`Buy/Sell -> quantity/value -> review -> submit -> server result`

Rules:
- Display quote expiry if the server provides one.
- On conflict or changed price, return to review with refreshed values.
- Do not fake guaranteed execution using stale cached price.

### STK-004 — Portfolio

UI:
- Total portfolio value
- Cash vs holdings
- Holdings list
- Realized/unrealized values only when supplied or derivable from authoritative data
- Order/history link

### BUS-001 — Business portfolio

UI:
- Owned businesses
- Status/license state
- Income/settlement readiness
- Boosts
- Equity/capital summary

API:
- `/app-api/v1/businesses/*`
- `GET /app-api/v1/businesses/equity`

### BUS-002 — Business catalog

API:
- `GET /app-api/v1/businesses/catalog`

UI per item:
- Business name/type
- Purchase requirement
- Yield/risk/requirements only from current server contract
- Locked reason
- Purchase button

### BUS-003 — Business purchase

API:
- `POST /app-api/v1/businesses/catalog/{id}/purchases`

Flow:
`Detail -> requirement check -> confirmation -> submit -> receipt -> portfolio`

### BUS-004 — Business detail / operations

UI:
- Ownership details
- Settlement state
- License
- Boost state
- Historical settlements if supported

All settlement calculations remain server-authoritative.

### SHP-001 — Shop

API root: `/app-api/v1/shop/*`

UI:
- Categories
- Item cards
- Owned state
- Price/currency
- Item detail
- Purchase confirmation

Do not mark an item owned until the purchase response succeeds.

## 7. Play and progression

### PLY-001 — Play hub

Cards:
- Work
- Daily rewards
- Progression
- Early-game missions
- Season/event
- Casino, only when enabled by policy/configuration

### WRK-001 — Work

API root: `/app-api/v1/work/*`

UI:
- Current job
- Work availability/cooldown
- Expected server-described reward/range
- `Work` action
- Recent work results

After action, refresh wallet/reward/progression dependent cards.

### PRG-001 — Progression

API root: `/app-api/v1/progression/*`

UI:
- Level
- XP/progress bar
- Skills/mastery
- Unlocks
- Next milestone

### ERY-001 — New-user progression

API root: `/app-api/v1/early-game/*`

UI:
- Checklist
- Current step
- Completion reward
- Direct deep links to required feature screens

### RWD-001 — Rewards

API root: `/app-api/v1/rewards/*`

UI:
- Available rewards
- Claimed state
- Cooldown/reset time from server
- Claim button

Claim must be idempotent from the user's perspective: repeated taps should not create duplicate rewards.

### SEA-001 — Season hub

API root: `/app-api/v1/seasons/*`

UI:
- Active season
- Time remaining
- Progress
- Missions/events
- Reward track
- Leaderboard when available

### CAS-001 — Casino/minigame hub

API root: `/app-api/v1/casino/*`

This surface must be feature-gated. The app must obey jurisdiction, age, product-policy, and server enablement rules. Random outcomes, limits, balances, and settlement are server-authoritative.

## 8. Community and content

### COM-001 — Community hub

Sections:
- Board feed
- Recent activity
- Public gallery/media
- Announcements

### BRD-001 — Board feed

API root: `/app-api/v1/board/*`

UI:
- Sort/filter supported by API
- Post cards
- Author summary
- Time
- Media preview
- Pagination/infinite list

### BRD-002 — Post detail

UI:
- Full post
- Author profile link
- Media
- Interaction controls supported by current API
- Edit/delete only when server permissions allow

### BRD-003 — Create/edit post

UI:
- Text editor
- Media attachment using approved media flow
- Character/file limits shown before upload
- Submit state and retry

Never trust client-side owner checks as the final authorization decision.

### PRF-001 — My profile

API root: `/app-api/v1/profile/*`

UI:
- Avatar
- Display name
- Public stats/summary
- Edit button
- Activity link

### PRF-002 — Public profile

Only fields approved by the backend/public profile contract are displayed. Never infer or expose email, identity provider IDs, exact IP/location, security status, or private account metadata.

### CNT-001 — Announcements

API:
- `GET /app-api/v1/content/announcements`

UI:
- Pinned/current notices
- Date
- Title
- Body/detail

### CNT-002 — Gallery

API:
- `GET /app-api/v1/content/photos`

UI:
- Grid/list
- Full-screen viewer
- Pagination

### CNT-003 — Service status

API:
- `GET /app-api/v1/content/status`

Use this data for both a dedicated status page and a global service-impact banner.

## 9. My / account / privacy

### MY-001 — My page

Sections:
- Profile
- Linked login methods
- Security
- Privacy
- App settings
- Legal documents
- Logout

### ACC-001 — Linked identities

API roots:
- `/app-api/v1/account/*`
- `/app-api/v1/auth/*`

UI:
- Local email status
- Google linked/unlinked
- Discord linked/unlinked
- Link action
- Unlink action

Rules:
- Reauthentication for sensitive changes.
- Do not allow the final usable login method to be removed unless server explicitly permits it.

### SEC-001 — Security center

Target UX:
- Active sessions
- Revoke one session
- Revoke all other sessions
- Recent security events
- Reauthentication entry

If backend endpoints are not yet complete, display only implemented controls and mark the rest as planned in development builds, not as fake functional UI.

### PRV-001 — Privacy center

API root: `/app-api/v1/privacy/*`

UI:
- Data export request/status
- Account deletion request/status
- Consent review
- Privacy policy

High-risk privacy actions require explicit confirmation and reauthentication when required by backend.

### SET-001 — App settings

Client-side settings may include:
- Language
- Theme
- Push-notification preferences when implemented
- Haptic/sound preferences
- Accessibility preferences

Security-sensitive preferences must remain server-controlled where applicable.

## 10. Notification model

Use a common in-app notification object where available:
- `id`
- `category`
- `title`
- `body`
- `createdAt`
- `readAt`
- `deepLink`

Potential categories:
- account/security
- transaction
- bank/loan
- business settlement
- stock order
- reward
- season/event
- community
- announcement

Push notifications should contain minimal sensitive data and deep-link into an authenticated screen that reloads authoritative state.

## 11. API client rules

### 11.1 Base path

All ordinary member functionality must use `/app-api/v1/*`.

Do not call:
- `/api/v1/admin/*`
- Discord webhook/interaction endpoints
- health/scheduler/worker internals
- direct database APIs

### 11.2 Session and CSRF

- Use the server session model.
- Mutating operations must send the required CSRF value.
- The app must not invent authentication state locally.
- On server session invalidation, clear local user cache and return to signed-out state.

### 11.3 Request behavior

Recommended client behavior:
- Safe GET retry on transient network failure
- No blind automatic retry for money/economy mutations unless the API contract guarantees idempotency
- Attach a client request correlation identifier when supported
- Cancel obsolete list/detail requests when navigation changes

### 11.4 Caching

Cache only non-sensitive display data that improves UX. Treat wallet balances, orders, settlement state, account/security state, and permissions as short-lived and refresh after mutations.

## 12. Design system requirements

### 12.1 Components

Minimum reusable component set:
- App bar
- Bottom navigation
- Balance card
- Stat card
- Action card
- List row
- Empty state
- Skeleton
- Error state
- Bottom sheet
- Confirmation dialog
- Form field
- Password field
- Amount input
- Search field
- Filter chips
- Status badge
- Transaction row
- Avatar
- Media tile
- Toast/snackbar

### 12.2 Accessibility

- Dynamic text scaling
- Screen-reader labels
- Minimum touch target appropriate for mobile platforms
- Do not encode profit/loss/status by color alone
- Meaningful focus order
- Error messages associated with fields
- Charts require textual summaries

### 12.3 Localization

Primary documentation language is English and second language is Korean. The app should be localization-ready from the first implementation. UI strings must not be scattered as hard-coded literals throughout screens.

Recommended keys:
`auth.login.title`, `wallet.balance.available`, `business.purchase.confirm`, etc.

## 13. Security-specific UI rules

- Never show raw access/session/verification tokens.
- Never log password fields.
- Never persist passwords.
- Do not screenshot-protect every screen blindly; apply platform protection to genuinely sensitive screens where justified.
- Mask sensitive identifiers where practical.
- Confirmation dialogs do not replace server authorization.
- Any client-side eligibility check is advisory only.
- Deep links must validate route parameters and authentication state.
- Remote content should be rendered safely; no arbitrary script execution.

## 14. Screen/API implementation matrix

| Screen group | Main API root | Auth | Mutation | Priority |
| --- | --- | --- | --- | --- |
| Welcome/login/register | `/auth/*` | pre-auth/member | Yes | P0 |
| Home dashboard | multiple member roots | member | No | P1 |
| Wallet/transfer | `/wallet/*` | member | Yes | P1 |
| Banking/loans | `/bank/*`, `/banking/*` | member | Yes | P1 |
| Stocks | `/stocks/*` | member | Yes | P1 |
| Businesses | `/businesses/*` | member | Yes | P1 |
| Shop | `/shop/*` | member | Yes | P1 |
| Work/rewards/progression | `/work/*`, `/rewards/*`, `/progression/*` | member | Yes | P1 |
| Season/engagement | `/seasons/*`, `/engagement/*` | member | Mixed | P1 |
| Community/profile | `/board/*`, `/profile/*`, `/activity/*` | mixed/member | Mixed | P1 |
| Announcements/gallery/status | `/content/*` | public/mixed | No | P1 |
| Privacy/account/security | `/privacy/*`, `/account/*`, `/auth/*` | member + reauth | Yes | P0/P1 |
| Casino | `/casino/*` | member + feature gate | Yes | gated |

## 15. Recommended implementation sequence

### Phase A — App shell and authentication

1. App shell/router
2. API client + cookie/session + CSRF handling
3. Welcome
4. Consent
5. Local registration/login
6. Google/Discord OAuth
7. Session expiry and reauth UX

Exit criteria: a real user can create/sign into an account and reach an authenticated shell without secrets embedded in the app.

### Phase B — Core economy

1. Home dashboard
2. Wallet
3. Bank
4. Work/rewards/progression
5. Stocks
6. Businesses
7. Shop

Exit criteria: core economy loops work entirely through server-authoritative APIs.

### Phase C — Community/content

1. Board
2. Profile
3. Media/gallery
4. Activity
5. Announcements/status

### Phase D — Account/security/privacy

1. Linked identities
2. Security center
3. Privacy export/delete flows
4. Settings

### Phase E — Events and gated features

1. Seasons/engagement
2. Early-game improvements
3. Casino only after required policy/legal/product gates

## 16. Definition of Done for each screen

A screen is not complete merely because it renders. Completion requires:

- API wired to real BFF endpoint
- Loading state
- Empty state
- Error state
- Offline/network handling
- Permission/session handling
- Mutation double-submit protection
- Accessibility labels
- Localization keys
- Analytics event only if approved and privacy-safe
- No secrets in logs
- Unit/component tests where appropriate
- Integration test for critical mutation flows
- Test-server verification before production under normal release policy

## 17. Current known product gaps

The API surface is available for member features, but app implementation must account for backend/product items that may still be incomplete. In particular:

- Production local-email registration still requires a real outbound verification-email sender and domain authentication configuration.
- Security-center endpoints should only be surfaced once their backend contracts are implemented.
- Password recovery should not be shown as functional until the full reset-token lifecycle exists.
- Push notifications require a separate device-token/notification delivery design.
- Some dashboard cards may initially need multiple requests until an aggregation endpoint is introduced.

The UI must never simulate completion of an unavailable backend capability.

## 18. Version record

### v2026.09.12.34

- Added full mobile application information architecture.
- Defined screen IDs and screen-level API bindings.
- Added signed-out, onboarding, economy, gameplay, community, account, privacy, and security flows.
- Added loading/error/offline/session/reauth state requirements.
- Added design-system, accessibility, localization, caching, API-client, and security rules.
- Added phased implementation order and per-screen Definition of Done.
