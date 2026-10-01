# 🔌 Woldeok Moneyverse Official Master REST API Catalog (v2026.10.01.499)

<!-- CORE-AUTHORITY-V499 -->
## App/Site/Economy Core authority overlay — v2026.10.01.499 (2026-10-01)

- **Superseding authority:** this maintained-document overlay supersedes any conflicting older planning text below. Historical passages remain evidence of prior decisions, not current product authority.
- **Channel boundary:** the target canonical public contracts are **App Core** at `/app-api/v2/**` and **Site Core** at `/site-api/v1/**`. **App API v1** remains compatibility/runtime evidence until measured retirement; this documentation cycle does not claim those target routes are already implemented in Test or Production.
- **Single economic authority:** App/Site BFFs never own independent balance, tax, banking, treasury, market, job-reward or monetary-policy rules. One **Economy Core** owns economic command/read authority and delegates final WLD mutation to the append-only ledger and reviewed PostgreSQL `SECURITY DEFINER` functions.
- **Fiscal conservation:** every `TAX_*` posts **100% to TREASURY_MAIN** net of explicit reversal. Tax may not target burn/sink. Treasury purposes are logical budget commitments/envelopes, not independently spendable cash vaults.
- **AI boundary:** one **Economy Policy Registry** and one policy executor own numeric policy application. AI/model/work/stock modules are **proposal-only** unless a specific low-risk key is registered `BOUNDED_AUTO`. **direct member balance write = 0 (prohibited)**, **direct absolute stock-price write = 0**, historical-ledger rewrite = 0, and AI cannot widen its own limits.
- **Identity boundary:** internal **workload identity** and user/admin/automation actor identity are validated independently. Shared `INTERNAL_API_TOKEN` / `x-internal-token` is legacy compatibility, not the final multi-core service-identity design.
- **Rollout truth:** the transition is expand → shadow/observe → switch → reconcile → contract. Runtime/Test/Production completion requires exact-SHA evidence and is not implied by this planning authority update.

**English canonical** | [한국어](API_CATALOG_MASTER.ko.md)

> **Version**: `v2026.10.01.499`
> **Target public contracts**: App Core `https://easy-scraping.com/app-api/v2`; Site Core `https://easy-scraping.com/site-api/v1`. The current App API v1 remains compatibility during migration. Private Nest/API `/api/v1` is an internal implementation surface, not the final public client contract.
> **Protocols**: HTTP/2, TLS 1.3, JSON (UTF-8)  
> **Error Standard**: RFC 7807 Problem Details for HTTP APIs  
> **Multi-Layer Security Headers**: `x-session-id`, `x-csrf-token`, `x-internal-token`, `x-totp-code` (Step-Up 2FA)

---

## 📑 Table of Contents
1. [Architecture & Security Standards](#1-architecture--security-standards)
2. [Domain 01: Auth, Sessions & Accounts](#domain-01-auth-sessions--accounts)
3. [Domain 02: Wallet & Ledger](#domain-02-wallet--ledger)
4. [Domain 03: Virtual Banking, Deposits & Loans](#domain-03-virtual-banking-deposits--loans)
5. [Domain 04: Work, Jobs & Certifications](#domain-04-work-jobs--certifications)
6. [Domain 05: Virtual Stocks & Market Orderbook](#domain-05-virtual-stocks--market-orderbook)
7. [Domain 06: Virtual Derivatives & 10x Leverage Futures](#domain-06-virtual-derivatives--10x-leverage-futures)
8. [Domain 07: Shop, Inventory & Economic Privileges](#domain-07-shop-inventory--economic-privileges)
9. [Domain 08: Web Casino, Minigames & Self-Exclusion](#domain-08-web-casino-minigames--self-exclusion)
10. [Domain 09: Virtual Businesses & Management](#domain-09-virtual-businesses--management)
11. [Domain 10: Virtual Startup VC Angel Investment & Crowdfunding](#domain-10-virtual-startup-vc-angel-investment--crowdfunding)
12. [Domain 11: Virtual Real Estate & Metaverse Lands](#domain-11-virtual-real-estate--metaverse-lands)
13. [Domain 12: Discord Clubs & Guild Territory Siege Warfare](#domain-12-discord-clubs--guild-territory-siege-warfare)
14. [Domain 13: No-Code Quant Bot Studio & Backtesting](#domain-13-no-code-quant-bot-studio--backtesting)
15. [Domain 14: Customer Support, Privacy & Safety](#domain-14-customer-support-privacy--safety)
16. [Domain 15: Admin Control Tower & Macroeconomy Governance](#domain-15-admin-control-tower--macroeconomy-governance)
17. [RFC 7807 Problem Details Standard](#17-rfc-7807-problem-details-standard)
18. [Client SDK & cURL Integration Examples](#18-client-sdk--curl-integration-examples)

---

## 1. Architecture & Security Standards

### Multi-Layer Security Headers

| Header | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `x-session-id` | Conditional | User session cookie or token | `sess_9f8a7c6b5d4e...` |
| `x-csrf-token` | State-changing | Anti-CSRF protection token | `csrf_3a1b2c...` |
| `x-internal-token` | Internal | Next.js Server Actions to NestJS hop token | `sec_internal_token_32bytes...` |
| `x-totp-code` | High-risk admin | 6-digit TOTP Step-Up 2FA token | `582910` |

---

## Domain 01: Auth, Sessions & Accounts

### `POST /api/v1/auth/login`
- **Summary**: User login via email/password or OAuth
- **Auth**: Public

### `POST /api/v1/auth/logout`
- **Summary**: Invalidate active session
- **Auth**: Authenticated User

### `GET /api/v1/accounts/me`
- **Summary**: Get account profile, assets, and level progression
- **Auth**: Authenticated User

---

## Domain 02: Wallet & Ledger

### `GET /api/v1/wallet/balance`
- **Summary**: Fetch available WLD balance, locked collaterals, and net worth
- **Auth**: Authenticated User

### `POST /api/v1/wallet/transfer`
- **Summary**: P2P WLD transfer with 1% burn fee
- **Auth**: Authenticated User

---

## Domain 03: Virtual Banking, Deposits & Loans

### `GET /api/v1/bank/products`
- **Summary**: List savings/deposit products with compounding yields

### `POST /api/v1/bank/deposits/subscribe`
- **Summary**: Subscribe to compounding deposit product

---

## Domain 04: Work, Jobs & Certifications

### `GET /api/v1/work/jobs`
- **Summary**: List 5 career professions and daily quota limits

### `POST /api/v1/work/execute`
- **Summary**: Perform labor action and earn WLD wages

---

## Domain 05: Virtual Stocks & Market Orderbook

### `GET /api/v1/stocks`
- **Summary**: Real-time ticker prices, 24h volume, and percentage changes

### `GET /api/v1/stocks/:ticker/orderbook`
- **Summary**: 10-Depth bid/ask orderbook

### `POST /api/v1/stocks/orders`
- **Summary**: Place limit/market order

---

## Domain 06: Virtual Derivatives & 10x Leverage Futures

### `GET /api/v1/stocks/derivatives/markets`
- **Summary**: List futures markets (Samsung 10x, NAVER 5x, Index100 10x) & 8h funding rates

### `GET /api/v1/stocks/derivatives/positions`
- **Summary**: List active long/short leveraged positions with real-time unrealized PnL

### `POST /api/v1/stocks/derivatives/open`
- **Summary**: Open leveraged futures position with collateral lock

### `POST /api/v1/stocks/derivatives/:id/close`
- **Summary**: Market settlement and payout of collateral + realized PnL

---

## Domain 07: Shop, Inventory & Economic Privileges

### `GET /api/v1/shop/items`
- **Summary**: List consumable buffs, titles, and interior items

### `POST /api/v1/shop/purchase`
- **Summary**: Purchase item with 100% WLD burn

---

## Domain 08: Web Casino, Minigames & Self-Exclusion

### `POST /api/v1/casino/roulette/spin`
- **Summary**: Spin daily attendance or WLD roulette wheel

### `POST /api/v1/safety/self-exclusion`
- **Summary**: Activate 24h~30d anti-gambling cooling off self-exclusion

---

## Domain 09: Virtual Businesses & Management

### `GET /api/v1/businesses/my`
- **Summary**: Get corporate revenue, employees, and dividend payouts

---

## Domain 10: Virtual Startup VC Angel Investment & Crowdfunding

### `GET /api/v1/businesses/ventures/pitches`
- **Summary**: List active startup pitches open for angel round

### `POST /api/v1/businesses/ventures/invest`
- **Summary**: Execute angel investment and obtain SAFE equity shares

### `POST /api/v1/businesses/ventures/claim-dividend`
- **Summary**: Claim quarterly profit dividend

---

## Domain 11: Virtual Real Estate & Metaverse Lands

### `GET /api/v1/spaces/real-estate/districts`
- **Summary**: List special prime districts (Teheran, Yeouido, Seongsu, Pangyo, Hannam)

### `GET /api/v1/spaces/real-estate/lands`
- **Summary**: List metaverse land plots, floor prices, and occupancy rates

### `POST /api/v1/spaces/real-estate/purchase`
- **Summary**: Buy land plot with 100% WLD burn

### `POST /api/v1/spaces/real-estate/:id/settle-rent`
- **Summary**: Settle and withdraw accumulated daily rent yields

---

## Domain 12: Discord Clubs & Guild Territory Siege Warfare

### `GET /api/v1/clubs/warfare/strongholds`
- **Summary**: List key fortresses (Central Bank, KRX Exchange, Pangyo Datacenter)

### `POST /api/v1/clubs/warfare/declare`
- **Summary**: Declare siege war on territory

### `POST /api/v1/clubs/warfare/:id/attack`
- **Summary**: Attack fortress defenses and earn guild contribution points

---

## Domain 13: No-Code Quant Bot Studio & Backtesting

### `GET /api/v1/quant/strategies`
- **Summary**: List algorithmic automated trading bots

### `POST /api/v1/quant/backtest`
- **Summary**: Run 30-day historical tick data backtest simulation

### `POST /api/v1/quant/strategies/:id/toggle`
- **Summary**: Toggle real-time automated order execution

---

## Domain 14: Customer Support, Privacy & Safety

### `POST /api/v1/support/tickets`
- **Summary**: Submit 1:1 customer support inquiry

### `POST /api/v1/safety/take-it-down`
- **Summary**: 24-hour non-member emergency illicit content takedown queue

---

## Domain 15: Admin Control Tower & Macroeconomy Governance

### `GET /api/v1/admin/dashboard/stats`
- **Summary**: Real-time M2 supply, 1,498 active sessions, and burn rate telemetry

### `POST /api/v1/admin/switches/toggle`
- **Summary**: Toggle kill switches & feature flags (**Step-Up 2FA TOTP Required**)

---

## 17. RFC 7807 Problem Details Standard

| Status Code | RFC 7807 `type` | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `https://easy-scraping.com/errors/validation-error` | DTO schema validation failed |
| `401 Unauthorized` | `https://easy-scraping.com/errors/unauthorized` | Session expired or invalid |
| `403 Forbidden` | `https://easy-scraping.com/errors/forbidden` | Insufficient role privilege |
| `409 Conflict` | `https://easy-scraping.com/errors/idempotency-conflict` | Duplicate idempotency key |
| `429 Too Many Requests` | `https://easy-scraping.com/errors/rate-limited` | Rate limit exceeded |

---

## 18. Client SDK & cURL Integration Examples

### TypeScript Next.js 16 Server Action
```typescript
export async function openDerivativePosition(params: {
  ticker: string;
  side: 'LONG' | 'SHORT';
  leverage: number;
  collateralWld: number;
  sessionId: string;
  csrfToken: string;
}) {
  const response = await fetch('https://easy-scraping.com/api/v1/stocks/derivatives/open', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': params.sessionId,
      'x-csrf-token': params.csrfToken,
    },
    body: JSON.stringify({
      ticker: params.ticker,
      side: params.side,
      leverage: params.leverage,
      collateralWld: params.collateralWld,
      idempotencyKey: crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`[API Error ${response.status}] ${err.title}: ${err.detail}`);
  }

  return response.json();
}
```
