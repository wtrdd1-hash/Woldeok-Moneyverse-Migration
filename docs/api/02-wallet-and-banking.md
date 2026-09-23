# 통화 금융 & 지갑·은행 API (Wallet & Banking)

> WLD 지갑 잔고 조회, P2P 송금, 입출금 내역, 일일 보상 수령, 은행 예적금 상품 가입/해지, 대출 신청/상환 및 포켓 계좌 관리 엔드포인트

## 📋 목차 (Table of Contents)

- [GET /bank/loans](#get--bank-loans) - Outstanding loans for the caller (`wallet`)
- [POST /bank/loans](#post--bank-loans) - Borrow from the virtual bank (`wallet`)
- [POST /bank/loans/{id}/repayments](#post--bank-loans--id--repayments) - Repay part or all of a loan (`wallet`)
- [POST /bank/movements](#post--bank-movements) - Move balance between cash and bank (`wallet`)
- [POST /banking/bonds/{id}/redeem](#post--banking-bonds--id--redeem) - Redeem matured virtual bond and payout principal with yield (`banking`)
- [POST /banking/bonds/purchase](#post--banking-bonds-purchase) - Purchase 7-day or 30-day virtual government bonds (`banking`)
- [POST /banking/borrow](#post--banking-borrow) - Borrow smart credit loan evaluated by job level and business value (`banking`)
- [POST /banking/claim-interest](#post--banking-claim-interest) - Claim accrued compound deposit interest into bank balance (`banking`)
- [POST /banking/deposit](#post--banking-deposit) - Deposit WLD cash into bank compound interest deposit account (`banking`)
- [GET /banking/pockets](#get--banking-pockets) - List all saving pockets for current user (`banking`)
- [POST /banking/pockets](#post--banking-pockets) - Create a new saving pocket (`banking`)
- [PUT /banking/pockets/{id}](#put--banking-pockets--id-) - Customize saving pocket appearance and theme (`banking`)
- [POST /banking/pockets/{id}/archive](#post--banking-pockets--id--archive) - Archive saving pocket and recover all funds to cash balance (`banking`)
- [POST /banking/pockets/{id}/transfer](#post--banking-pockets--id--transfer) - Transfer funds between main bank balance and saving pocket (`banking`)
- [POST /banking/repay](#post--banking-repay) - Repay active bank loan (`banking`)
- [GET /banking/standing](#get--banking-standing) - Bank overview: cash, deposit balance, compound interest, loans, bonds (`banking`)
- [POST /banking/withdraw](#post--banking-withdraw) - Withdraw WLD from bank deposit account to cash (`banking`)
- [GET /game-clock](#get--game-clock) - Read the authoritative accelerated Moneyverse server day/week (`game-clock`)
- [GET /rewards/availability](#get--rewards-availability) - Next eligible times for the caller reward controls (`wallet`)
- [POST /rewards/daily/claims](#post--rewards-daily-claims) - Claim the daily reward (`wallet`)
- [POST /rewards/work/claims](#post--rewards-work-claims) - Retired legacy work faucet; use professional work tasks (`wallet`)
- [GET /wallet](#get--wallet) - Balances and recent ledger entries for the caller (`wallet`)
- [POST /wallet/transfers](#post--wallet-transfers) - Send WLD to another member (`wallet`)

---

## 🛠️ 엔드포인트 상세 규격

### GET `/bank/loans`

**설명:** Outstanding loans for the caller

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_loans`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/bank/loans" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/bank/loans`

**설명:** Borrow from the virtual bank

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_borrow`
#### 📦 요청 본문 (Request Body)

  - `principalAmount` (`any`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/bank/loans" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/bank/loans/{id}/repayments`

**설명:** Repay part or all of a loan

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_repay`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `amount` (`any`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/bank/loans/{id}/repayments" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/bank/movements`

**설명:** Move balance between cash and bank

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_bankMovement`
#### 📦 요청 본문 (Request Body)

  - `direction` (`string`) **(필수)**
  - `amount` (`any`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/bank/movements" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/banking/bonds/{id}/redeem`

**설명:** Redeem matured virtual bond and payout principal with yield

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `BankController_redeemBond`

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
curl -X POST "https://easy-scraping.com/banking/bonds/{id}/redeem" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/banking/bonds/purchase`

**설명:** Purchase 7-day or 30-day virtual government bonds

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `BankController_purchaseBond`
#### 📦 요청 본문 (Request Body)

  - `bondCode` (`string`) **(필수)**
  - `amount` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/bonds/purchase" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/banking/borrow`

**설명:** Borrow smart credit loan evaluated by job level and business value

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `BankController_borrow`
#### 📦 요청 본문 (Request Body)

  - `amount` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/borrow" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/banking/claim-interest`

**설명:** Claim accrued compound deposit interest into bank balance

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `BankController_claimInterest`
#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/claim-interest" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/banking/deposit`

**설명:** Deposit WLD cash into bank compound interest deposit account

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `BankController_deposit`
#### 📦 요청 본문 (Request Body)

  - `amount` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/deposit" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/banking/pockets`

**설명:** List all saving pockets for current user

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `PocketController_listPockets`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/banking/pockets" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/banking/pockets`

**설명:** Create a new saving pocket

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `PocketController_createPocket`
#### 📦 요청 본문 (Request Body)

  - `name` (`string`) **(필수)** - 저금통 이름
  - `targetAmount` (`string`) **(필수)** - 목표 저축 금액 (WLD)
  - `targetDate` (`string`) *(선택)* - 목표 달성 예정일 (YYYY-MM-DD)
  - `themeColor` (`string`) *(선택)* - 테마 색상 코드
  - `iconCode` (`string`) *(선택)* - 아이콘 코드
  - `idempotencyKey` (`string`) **(필수)** - 멱등성 키 (UUID)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/pockets" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/banking/pockets/{id}`

**설명:** Customize saving pocket appearance and theme

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `PocketController_customizePocket`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `name` (`string`) *(선택)* - 저금통 이름
  - `targetAmount` (`string`) *(선택)* - 목표 저축 금액 (WLD)
  - `targetDate` (`string`) *(선택)* - 목표 달성 예정일 (YYYY-MM-DD)
  - `themeColor` (`string`) *(선택)* - 테마 색상 코드
  - `iconCode` (`string`) *(선택)* - 아이콘 코드

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/banking/pockets/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/banking/pockets/{id}/archive`

**설명:** Archive saving pocket and recover all funds to cash balance

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `PocketController_archivePocket`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)** - 멱등성 키 (UUID)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/pockets/{id}/archive" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/banking/pockets/{id}/transfer`

**설명:** Transfer funds between main bank balance and saving pocket

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `PocketController_transferPocket`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `direction` (`string`) **(필수)** - 이체 방향 (deposit: 본계좌->저금통, withdraw: 저금통->본계좌)
  - `amount` (`string`) **(필수)** - 이체 금액 (WLD)
  - `idempotencyKey` (`string`) **(필수)** - 멱등성 키 (UUID)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/pockets/{id}/transfer" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/banking/repay`

**설명:** Repay active bank loan

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `BankController_repay`
#### 📦 요청 본문 (Request Body)

  - `loanId` (`string`) **(필수)**
  - `amount` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/repay" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/banking/standing`

**설명:** Bank overview: cash, deposit balance, compound interest, loans, bonds

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `BankController_standing`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/banking/standing" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/banking/withdraw`

**설명:** Withdraw WLD from bank deposit account to cash

- **분류 태그 (Tag):** `banking`
- **엔드포인트 ID:** `BankController_withdraw`
#### 📦 요청 본문 (Request Body)

  - `amount` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/banking/withdraw" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/game-clock`

**설명:** Read the authoritative accelerated Moneyverse server day/week

- **분류 태그 (Tag):** `game-clock`
- **엔드포인트 ID:** `GameClockController_current`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/game-clock" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/rewards/availability`

**설명:** Next eligible times for the caller reward controls

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_rewardAvailability`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/rewards/availability" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/rewards/daily/claims`

**설명:** Claim the daily reward

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_claimDaily`
#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/rewards/daily/claims" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/rewards/work/claims`

**설명:** Retired legacy work faucet; use professional work tasks

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_claimWork`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/rewards/work/claims" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/wallet`

**설명:** Balances and recent ledger entries for the caller

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_overview`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `recent` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/wallet" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/wallet/transfers`

**설명:** Send WLD to another member

- **분류 태그 (Tag):** `wallet`
- **엔드포인트 ID:** `WalletController_transfer`
#### 📦 요청 본문 (Request Body)

  - `recipientUserId` (`string`) **(필수)** - Recipient user id
  - `amount` (`any`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)** - Client-generated idempotency key

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/wallet/transfers" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

