# Mobile / External App API & Developer Portal Guide

[English](mobile-api.md) | [한국어](mobile-api.ko.md) | [Document Index](INDEX.md) | [Developer Portal](/developer)

The Moneyverse backend exposes full-domain RESTful APIs (52 controllers, 163 endpoints) under `/api/v1`. The production service is intentionally private and accepts requests only from the Next.js frontend App Gateway (`/app-api/v1/*`) over the internal network with `x-internal-token`.

A native/mobile application or external client must **not** embed `INTERNAL_API_TOKEN`. Treat that secret as server-to-server only. The safe integration pattern is:

1. The app communicates with the App Gateway (`https://easy-scraping.com/app-api/v1/*`) over HTTPS.
2. The gateway is the only component that holds `INTERNAL_API_TOKEN`.
3. The gateway forwards the caller's Moneyverse session cookie and CSRF token to the NestJS API, appending `x-internal-token`.
4. OAuth login remains Authorization Code + PKCE through the existing `/auth/:provider/authorize` and `/auth/:provider/callback` endpoints.
5. Mutating requests use the session's CSRF token in `x-csrf-token`.

This preserves the existing session, consent, reauthentication, and database security model without creating fragmented secondary authentication systems.

## 🧭 Interactive Developer Portal (`/developer`) & Spec Discovery

- **Interactive Developer Portal**: Access [`/developer`](/developer) via web browser for a real-time API catalog across 7 categories, multi-language code snippets (cURL, TypeScript, Python), and a live sandbox tester measuring real-time latency and status codes.
- **Machine-Readable Contract**: [`docs/mobile-api-contract.json`](mobile-api-contract.json) provides the OpenAPI 3.0 specification covering all 163 full-domain endpoints.
- **Swagger UI**: Non-production environments publish Swagger UI at `/docs` and raw OpenAPI JSON at `/docs-json`.

## 📦 Client-Visible API Groups

Based on OpenAPI 3.0 tags and App Gateway route groups. Standard application clients use the following public and member domain groups:

| Domain Group | Key Endpoints & Capabilities |
| :--- | :--- |
| **`auth` / `account`** | Email auth, Google/Discord OAuth, verification, session/device management, deletion |
| **`wallet` / `bank` / `banking`** | WLD balance, P2P transfer, bank deposit/withdrawal, loan issuance/repayment, bond investment |
| **`stocks`** | Stock quotes, OHLC candlestick charts, buy/sell orders, portfolio, price alerts |
| **`newspaper`** | Live market sentiment (`pulse`), weekly market outlook poll (`poll`), financial lore articles (`lore`) |
| **`shop` / `inventory`** | Item catalog, consumable/cosmetic purchases, item equipment/usage, upkeep settlement |
| **`businesses`** | Virtual business acquisition, business boosts, daily settlement (V2), license activation |
| **`casino`** | Coin flip, dice parity/number games, provable fairness verification, self-exclusion limits |
| **`board` / `photos`** | Community posts and comments CRUD, photo gallery uploads and feed |
| **`profile` / `progression` / `work`** | User profile/title customization, level/credit scoring, daily job tasks and reward claims |
| **`engagement` / `seasons` / `early-game`** | Daily quests, seasonal event resource consumption & leaderboards, onboarding claims |
| **`privacy` / `content` / `activity`** | Data Subject Requests (DSR), public announcements, system status, telemetry |

> ⚠️ The `admin` and `discord` groups are not public app-client APIs and remain strictly protected for authorized administrators.
