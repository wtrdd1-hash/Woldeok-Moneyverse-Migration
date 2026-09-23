# 가상 주식 & 사업체 공급망 API (Stocks & Businesses)

> 가상 주식 시장 시세/차트, 매수/매도 호가 주문, 포트폴리오 분석, 증시 뉴스 피드, 가상 사업체 창업/인수, 일일 정산 및 원자재 공급망 조달(2% 소각) 엔드포인트

## 📋 목차 (Table of Contents)

- [GET /business-equity](#get--business-equity) - The own capital the caller can put behind a purchase (`businesses`)
- [GET /business-types](#get--business-types) - Business types available to buy, excluding types already owned (`businesses`)
- [POST /business-types/{id}/purchases](#post--business-types--id--purchases) - Buy a business of this type (`businesses`)
- [GET /businesses](#get--businesses) - Businesses the caller owns (`businesses`)
- [POST /businesses/{id}/boost](#post--businesses--id--boost) - Equip a boost item from inventory to business (`businesses`)
- [POST /businesses/{id}/procure](#post--businesses--id--procure) - Procure raw materials for business with WLD payment (`businesses`)
- [POST /businesses/{id}/settle-v2](#post--businesses--id--settle-v2) - Settle a day of revenue with active boosts and double-entry ledger sink (`businesses`)
- [POST /businesses/{id}/settlements](#post--businesses--id--settlements) - Settle a day of revenue (`businesses`)
- [POST /businesses/{id}/storage/upgrade](#post--businesses--id--storage-upgrade) - Upgrade business storage capacity (`businesses`)
- [GET /businesses/{id}/supply-chain](#get--businesses--id--supply-chain) - Get supply chain inventory, storage capacity and demand factors (`businesses`)
- [POST /businesses/activate-license](#post--businesses-activate-license) - Activate a business using a purchased license item from inventory (`businesses`)
- [GET /businesses/catalog](#get--businesses-catalog) - App API alias: business types available to buy, excluding owned types (`businesses`)
- [POST /businesses/catalog/{id}/purchases](#post--businesses-catalog--id--purchases) - App API alias: buy a business from the catalogue (`businesses`)
- [GET /businesses/equity](#get--businesses-equity) - App API alias: own capital available for a business purchase (`businesses`)
- [GET /businesses/my-v2](#get--businesses-my-v2) - Enhanced businesses the caller owns with boosts and settlement status (`businesses`)
- [GET /newspaper/lore](#get--newspaper-lore) - 주간 금융 개념 배움터 아티클 목록 조회 (`newspaper`)
- [GET /newspaper/poll](#get--newspaper-poll) - 주간 독자 여론조사 현황 조회 (`newspaper`)
- [POST /newspaper/poll/vote](#post--newspaper-poll-vote) - 주간 독자 여론조사 투표 참여 (`newspaper`)
- [GET /newspaper/pulse](#get--newspaper-pulse) - 실시간 월드 펄스 및 시장 심리 조회 (`newspaper`)
- [GET /stocks](#get--stocks) - Listed stocks and their current prices (`stocks`)
- [GET /stocks/{id}/candles](#get--stocks--id--candles) - Open/high/low/close for one stock at a given interval (`stocks`)
- [POST /stocks/{id}/orders](#post--stocks--id--orders) - Buy or sell a stock (`stocks`)
- [GET /stocks/{id}/prices](#get--stocks--id--prices) - Recorded price history for one stock (`stocks`)
- [POST /stocks/{id}/watchlist](#post--stocks--id--watchlist) - Add or remove a stock from the caller watchlist (`stocks`)
- [GET /stocks/alerts](#get--stocks-alerts) - Conditional virtual-stock alerts belonging to the caller (`stocks`)
- [POST /stocks/alerts](#post--stocks-alerts) - Create a server-evaluated virtual-stock alert (`stocks`)
- [DELETE /stocks/alerts/{id}](#delete--stocks-alerts--id-) - Delete one virtual-stock alert belonging to the caller (`stocks`)
- [GET /stocks/alerts/events](#get--stocks-alerts-events) - Recent virtual-stock alert events belonging to the caller (`stocks`)
- [GET /stocks/halt-receipts](#get--stocks-halt-receipts) - Stock halt cost-basis settlement receipts for caller (`stocks`)
- [GET /stocks/history](#get--stocks-history) - Trades made by the caller (`stocks`)
- [GET /stocks/market-events](#get--stocks-market-events) - Market events currently in effect (`stocks`)
- [GET /stocks/portfolio](#get--stocks-portfolio) - Holdings of the caller (`stocks`)
- [GET /stocks/sparklines](#get--stocks-sparklines) - Recent prices for every listed stock (`stocks`)
- [GET /stocks/watchlist](#get--stocks-watchlist) - Stocks watched by the caller (`stocks`)

---

## 🛠️ 엔드포인트 상세 규격

### GET `/business-equity`

**설명:** The own capital the caller can put behind a purchase

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_equity`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/business-equity" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/business-types`

**설명:** Business types available to buy, excluding types already owned

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_catalog`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/business-types" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/business-types/{id}/purchases`

**설명:** Buy a business of this type

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_purchase`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/business-types/{id}/purchases" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/businesses`

**설명:** Businesses the caller owns

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_mine`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/businesses" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/businesses/{id}/boost`

**설명:** Equip a boost item from inventory to business

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_applyBoost`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `boostCode` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/businesses/{id}/boost" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/businesses/{id}/procure`

**설명:** Procure raw materials for business with WLD payment

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_procureMaterials`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/businesses/{id}/procure" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/businesses/{id}/settle-v2`

**설명:** Settle a day of revenue with active boosts and double-entry ledger sink

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_settleV2`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/businesses/{id}/settle-v2" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/businesses/{id}/settlements`

**설명:** Settle a day of revenue

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_settle`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/businesses/{id}/settlements" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/businesses/{id}/storage/upgrade`

**설명:** Upgrade business storage capacity

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_upgradeStorage`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/businesses/{id}/storage/upgrade" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/businesses/{id}/supply-chain`

**설명:** Get supply chain inventory, storage capacity and demand factors

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_supplyChainOverview`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/businesses/{id}/supply-chain" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/businesses/activate-license`

**설명:** Activate a business using a purchased license item from inventory

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_activateLicense`
#### 📦 요청 본문 (Request Body)

  - `catalogCode` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/businesses/activate-license" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/businesses/catalog`

**설명:** App API alias: business types available to buy, excluding owned types

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_catalogForApp`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/businesses/catalog" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/businesses/catalog/{id}/purchases`

**설명:** App API alias: buy a business from the catalogue

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_purchaseForApp`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/businesses/catalog/{id}/purchases" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/businesses/equity`

**설명:** App API alias: own capital available for a business purchase

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_equityForApp`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/businesses/equity" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/businesses/my-v2`

**설명:** Enhanced businesses the caller owns with boosts and settlement status

- **분류 태그 (Tag):** `businesses`
- **엔드포인트 ID:** `BusinessController_mineV2`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/businesses/my-v2" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/newspaper/lore`

**설명:** 주간 금융 개념 배움터 아티클 목록 조회

- **분류 태그 (Tag):** `newspaper`
- **엔드포인트 ID:** `NewspaperController_getFinancialLore`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/newspaper/lore" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/newspaper/poll`

**설명:** 주간 독자 여론조사 현황 조회

- **분류 태그 (Tag):** `newspaper`
- **엔드포인트 ID:** `NewspaperController_getWeeklyPoll`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/newspaper/poll" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/newspaper/poll/vote`

**설명:** 주간 독자 여론조사 투표 참여

- **분류 태그 (Tag):** `newspaper`
- **엔드포인트 ID:** `NewspaperController_voteWeeklyPoll`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/newspaper/poll/vote" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/newspaper/pulse`

**설명:** 실시간 월드 펄스 및 시장 심리 조회

- **분류 태그 (Tag):** `newspaper`
- **엔드포인트 ID:** `NewspaperController_getMarketPulse`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/newspaper/pulse" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/stocks`

**설명:** Listed stocks and their current prices

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_list`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/stocks/{id}/candles`

**설명:** Open/high/low/close for one stock at a given interval

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_candles`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |
| `query` | `interval` | `string` | **필수** | - |
| `query` | `limit` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/{id}/candles" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/stocks/{id}/orders`

**설명:** Buy or sell a stock

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_order`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `side` (`string`) **(필수)**
  - `quantity` (`number`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/stocks/{id}/orders" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/stocks/{id}/prices`

**설명:** Recorded price history for one stock

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_prices`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |
| `query` | `limit` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/{id}/prices" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/stocks/{id}/watchlist`

**설명:** Add or remove a stock from the caller watchlist

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_setWatchlist`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `watching` (`boolean`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/stocks/{id}/watchlist" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/stocks/alerts`

**설명:** Conditional virtual-stock alerts belonging to the caller

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockAlertController_list`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/alerts" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/stocks/alerts`

**설명:** Create a server-evaluated virtual-stock alert

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockAlertController_create`
#### 📦 요청 본문 (Request Body)

  - `stockId` (`string`) **(필수)**
  - `conditionKind` (`string`) **(필수)**
  - `thresholdAmount` (`string`) *(선택)* - Integer WLD threshold for price conditions
  - `thresholdBps` (`number`) *(선택)*
  - `cooldownSeconds` (`number`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/stocks/alerts" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/stocks/alerts/{id}`

**설명:** Delete one virtual-stock alert belonging to the caller

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockAlertController_remove`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/stocks/alerts/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/stocks/alerts/events`

**설명:** Recent virtual-stock alert events belonging to the caller

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockAlertController_events`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `limit` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/alerts/events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/stocks/halt-receipts`

**설명:** Stock halt cost-basis settlement receipts for caller

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_haltReceipts`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/halt-receipts" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/stocks/history`

**설명:** Trades made by the caller

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_history`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/history" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/stocks/market-events`

**설명:** Market events currently in effect

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_marketEvents`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/market-events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/stocks/portfolio`

**설명:** Holdings of the caller

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_portfolio`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/portfolio" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/stocks/sparklines`

**설명:** Recent prices for every listed stock

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_sparklines`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `limit` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/sparklines" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/stocks/watchlist`

**설명:** Stocks watched by the caller

- **분류 태그 (Tag):** `stocks`
- **엔드포인트 ID:** `StockController_watchlist`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/stocks/watchlist" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

