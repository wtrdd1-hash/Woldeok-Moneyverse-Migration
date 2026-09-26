# Woldeok Moneyverse Authoritative API Catalog Master Specification

> **Version**: v2026.09.26.460  
> **Status**: Production Authoritative API Specification (100% Verified)  
> **Effective Date**: 2026-09-26  
> **Base Runtime**: NestJS 10.x REST API BFF / Next.js 16.3.4 BFF Proxy (`/app-api/v1/*`)  
> **Compliance**: Full Decommissioning of Casino APIs & 100% Fair Virtual Economy Gamification

---

## 🏛️ 1. Architecture & Security Standards

1. **Base URLs**:
   - Internal Backend Service: `http://127.0.0.1:3001/api/v1`
   - Frontend BFF Proxy: `/app-api/v1/*` or `/api/v1/*`
2. **Session & Security Invariants**:
   - Authenticated endpoints enforce `HttpOnly; SameSite=Lax; Secure` cookie (`session_id`).
   - Guard chain: `SessionGuard` -> `AuthenticatedGuard` -> `ConsentGuard` -> `CsrfGuard`.
3. **Idempotency Invariants**:
   - Financial and ledger mutations require UUID v4 in `X-Idempotency-Key` or body payload.

---

## 📋 2. Core API Catalog Across 14 Domains

### 1. Authentication & Sessions
- `GET /auth/bootstrap`: Global bootstrap configuration
- `POST /auth/local/register`: Local email/password registration
- `POST /auth/local/login`: Local login & session issuance
- `POST /auth/logout`: Session termination
- `POST /auth/signout-all`: Remote global signout across all devices
- `GET /auth/session`: Active session status
- `PUT /auth/consent`: Terms of service Step-Up consent
- `GET /auth/discord/authorize`: Discord OAuth2 entrypoint
- `GET /auth/discord/callback`: Discord OAuth2 callback

### 2. Account & Security Center
- `GET /account`: Profile & consolidated net worth summary
- `PUT /account/password`: Password modification
- `GET /account/security/sessions`: Active device sessions
- `DELETE /account/security/sessions/:id`: Revoke specific device session
- `GET /account/identities`: Connected social identities
- `DELETE /account`: Account deletion & GDPR data erasure
- `GET /privacy/data-export`: GDPR data export

### 3. Wallet & Ledger
- `GET /wallet/balance`: Real-time WLD balance & lockups
- `POST /wallet/transfer`: P2P idempotent WLD transfer (0 WLD fee)
- `GET /wallet/transactions`: 24-hour transaction ledger
- `GET /activity/stream`: Real-time economic event stream

### 4. Virtual Banking & Treasury Bonds
- `GET /bank/summary`: Central bank deposits & compound interest accrued
- `POST /bank/deposit`: Deposit WLD into compounding account
- `POST /bank/withdraw`: Withdraw WLD principal and interest
- `POST /bank/claim-interest`: Claim accrued daily compound interest
- `GET /bank/bonds`: Virtual treasury bond catalog
- `POST /bank/bonds/purchase`: Purchase fixed-maturity bonds
- `POST /bank/bonds/redeem`: Redeem matured treasury bonds
- `GET /bank/pockets`: Multi-pocket savings goals
- `POST /bank/pockets`: Create new custom savings pocket

### 5. Work & Career Mastery
- `GET /work/status`: Current profession, mastery EXP, daily cap
- `GET /work/careers`: 5 core profession catalogs
- `POST /work/change-career`: Career switch
- `POST /work/tasks/complete`: Complete work assignment & claim WLD
- `GET /game-clock`: 10-min day / 70-min week server clock

### 6. Virtual Stock Exchange
- `GET /stocks`: 10 listed stocks market overview
- `GET /stocks/:symbol`: 10-Depth orderbook & live candle chart
- `POST /stocks/orders`: Limit / Market buy & sell orders
- `GET /stocks/portfolio`: User stock portfolio & profit/loss
- `GET /stocks/alerts`: Target price alert rules
- `POST /stocks/alerts`: Create price alert rule
- `DELETE /stocks/alerts/:id`: Remove alert rule
- `GET /newspaper/daily`: AI Council daily economic briefing

### 7. Businesses & Commercial Units
- `GET /businesses`: Business catalog & user enterprises
- `POST /businesses/acquire`: Acquire commercial enterprise
- `POST /businesses/:id/settle`: Settle daily enterprise revenues
- `POST /businesses/:id/boost`: Apply productivity boost license

### 8. P2P Marketplace & Crafting
- `GET /marketplace/listings`: Active P2P marketplace listings
- `POST /marketplace/listings`: List item for sale
- `POST /marketplace/listings/:id/buy`: Instant buy (2% tax burned)
- `POST /marketplace/listings/:id/cancel`: Cancel active listing
- `GET /crafting/recipes`: Crafting table recipes
- `POST /crafting/craft`: Craft higher-tier artifacts

### 9. Shop & Engagement
- `GET /shop/items`: Item shop catalog & cosmetic skins
- `POST /shop/purchases`: Purchase shop items
- `GET /inventory`: User inventory & equipped slots
- `POST /early-game/starter-pack`: Claim beginner starter pack
- `POST /engagement/dopamine/claim`: Claim fever / fortune cookie rewards

### 10. Progression & Seasons
- `GET /progression/summary`: Player credit rating & achievements
- `POST /progression/prestige`: Prestige asset sacrifice & permanent multiplier
- `GET /season/current`: Active season pass level & milestones
- `POST /season/claim-reward`: Claim season pass level-up rewards

### 11. Community & Media
- `GET /board/posts`: Community board post feed
- `POST /board/posts`: Create new board post
- `GET /board/posts/:id`: Post details & comment thread
- `POST /board/posts/:id/comments`: Post comment / reply
- `POST /content/photos/upload`: Secure image upload

### 12. Direct Messaging & Safety
- `GET /chat/threads`: 1:1 conversation inbox & unread counts
- `GET /chat/threads/:id/messages`: Message history
- `POST /chat/threads/:id/messages`: Send 1:1 message
- `POST /chat/block`: Block / unblock abusive user
- `POST /safety/takedown/request`: Emergency takedown request

### 13. Clubs & Personal Spaces
- `GET /club`: Clubs directory & weekly rankings
- `POST /club/create`: Create club (10,000 WLD burn)
- `POST /club/:id/join`: Join or leave club
- `GET /space/my-space`: Personal office customization status

### 14. Admin Control Tower & Treasury
- `GET /admin/economy/overview`: Macro M0, inflation, reserve ratio
- `GET /admin/treasury/vaults`: 3 system reserve vaults status
- `POST /admin/treasury/inject`: Step-Up treasury injection
- `POST /admin/stocks/:symbol/halt`: Stock halt & 100% cost-basis settlement
- `GET /admin/audit/logs`: Real-time system audit logs

---

## 🚫 3. Decommissioned APIs
- **All Casino Endpoints (`/api/v1/casino/*`) Permanently Removed**:
  - Removed to comply with legal compliance, eliminating all gambling elements in favor of transparent gamified rewards.
