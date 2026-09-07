# Woldeok Moneyverse

Community virtual-economy platform built with Next.js, NestJS and PostgreSQL.
Production: **https://easy-scraping.com** · Test: **https://test.easy-scraping.com**

> All WLD, stocks, casino plays, jobs and rewards are virtual in-service data. They are not real money, securities or gambling products.

## Languages

[한국어](README/README.ko.md) · [English](README/README.en.md) · [简体中文](README/README.zh-CN.md) · [繁體中文](README/README.zh-TW.md) · [日本語](README/README.ja.md) · [Español](README/README.es.md)

## Architecture at a glance

```text
Browser
  │
  ▼
Cloudflare Tunnel / proxy
  │
  ▼
nginx edge
  │
  ├──▶ Next.js frontend
  │       │
  │       ▼
  │    NestJS API
  │       │
  │       ▼
  └──▶ PostgreSQL SECURITY DEFINER functions
              │
              ▼
        ledger / game / member tables
```

The application role is intentionally unable to mutate economy tables directly. Money-moving and identity-sensitive writes go through PostgreSQL `SECURITY DEFINER` functions, with idempotency keys and ledger receipts where appropriate.

## Main workspaces

| Path | Purpose |
| --- | --- |
| `frontend/` | Next.js App Router site and member UI |
| `backend/` | NestJS internal API |
| `packages/database/` | Ordered SQL migrations and DB policy |
| `packages/contract/` | Shared route/types contract |
| `deploy/` | Compose, nginx and host deployment scripts |
| `ops/` | Infrastructure helper scripts |
| `README/` | Localized project documentation |

## Current gameplay areas

Jobs and proficiency, quests and progression, wallet/ledger, catalog shop, inventory/collections, virtual stocks, businesses, banking/credit/bonds, and virtual casino minigames with server-side outcomes and member self-limits.

See a localized README above for setup, security and deployment details.
