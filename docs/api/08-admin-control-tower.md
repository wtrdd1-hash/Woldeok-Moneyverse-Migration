# 운영진 관제 타워 & 경제 국고·보안 통제 API (Admin Control Tower)

> 실시간 금융 관제 타워, 경제 시나리오 랩, 통화량 조절, 감사 로그 검색, 사용자 제재 및 권한 관리, 킬스위치/피처 플래그 토글 그리드, 2FA 스텝업 인증, 국고 자산 배분 및 콘텐츠 테이크다운 큐 엔드포인트

## 📋 목차 (Table of Contents)

- [POST /admin/ai-news/auto-generate](#post--admin-ai-news-auto-generate) - Auto-generate and optionally publish market news based on currently registered active stocks (`admin`)
- [POST /admin/ai-news/batches](#post--admin-ai-news-batches) - Start a run that asks the model for five scenarios (`admin`)
- [GET /admin/ai-news/batches/latest](#get--admin-ai-news-batches-latest) - The current batch of proposed scenarios, and the last run that asked for one (`admin`)
- [GET /admin/ai-news/models](#get--admin-ai-news-models) - What the stored key can reach, as GET {base}/models lists it (`admin`)
- [POST /admin/ai-news/scenarios/{id}/discard](#post--admin-ai-news-scenarios--id--discard) - Set a scenario aside (`admin`)
- [POST /admin/ai-news/scenarios/{id}/publish](#post--admin-ai-news-scenarios--id--publish) - Publish a scenario as a market event, with the values the operator settled on (`admin`)
- [GET /admin/ai-news/settings](#get--admin-ai-news-settings) - API address, model name and whether a key is stored (`admin`)
- [PUT /admin/ai-news/settings](#put--admin-ai-news-settings) - Store the model address, model name and, optionally, a new key (`admin`)
- [GET /admin/approvals](#get--admin-approvals) - Withdrawn: two-person approval was retired (`admin`)
- [POST /admin/approvals](#post--admin-approvals) - Withdrawn: two-person approval was retired (`admin`)
- [POST /admin/approvals/{id}/decisions](#post--admin-approvals--id--decisions) - Withdrawn: two-person approval was retired (`admin`)
- [GET /admin/audit-events](#get--admin-audit-events) - Recent audit trail entries (`admin`)
- [GET /admin/audit/dispositions](#get--admin-audit-dispositions) - What was archived, destroyed or held (`admin`)
- [POST /admin/audit/dispositions](#post--admin-audit-dispositions) - Record what was decided about a range past its retention period (`admin`)
- [GET /admin/audit/events](#get--admin-audit-events) - Search the audit trail; addresses and session hashes are masked (`admin`)
- [POST /admin/audit/events/{id}/reveal](#post--admin-audit-events--id--reveal) - Unmask one entry; the reveal is itself recorded (`admin`)
- [GET /admin/audit/retention](#get--admin-audit-retention) - Retention periods, what is past them, and the last disposition (`admin`)
- [PUT /admin/audit/retention/{category}](#put--admin-audit-retention--category-) - Append a retention policy version for one category (`admin`)
- [GET /admin/audit/verifications](#get--admin-audit-verifications) - Past chain verifications (`admin`)
- [POST /admin/audit/verify](#post--admin-audit-verify) - Recompute the hash chain over a window and record the result (`admin`)
- [GET /admin/bank](#get--admin-bank) - Deposits and the loan book, with the credit ladder behind it (`admin`)
- [GET /admin/business-types](#get--admin-business-types) - Every business type, including inactive ones (`admin`)
- [PATCH /admin/business-types/{id}](#patch--admin-business-types--id-) - Rename, redescribe or deactivate a business type (`admin`)
- [GET /admin/controls](#get--admin-controls) - Feature switches, economy policy versions and role assignments (`admin`)
- [GET /admin/controls/auto-policy](#get--admin-controls-auto-policy) - Policy knobs plus classical proposal and matching AI review evidence (`admin`)
- [PUT /admin/controls/auto-policy/knobs/{knobKey}](#put--admin-controls-auto-policy-knobs--knobkey-) - Take one knob off automatic, or move its approved range (`admin`)
- [POST /admin/controls/auto-policy/runs](#post--admin-controls-auto-policy-runs) - Run the dual-lane automatic adjustment now instead of waiting for Monday (`admin`)
- [POST /admin/controls/consent-versions](#post--admin-controls-consent-versions) - Publish a new terms and privacy policy version (Superadmin only) (`admin`)
- [GET /admin/controls/consent-versions](#get--admin-controls-consent-versions) - List recent terms and privacy policy versions (`admin`)
- [PUT /admin/controls/feature-switches/{featureKey}](#put--admin-controls-feature-switches--featurekey-) - Enable, pause, put into safe mode or disable a feature (`admin`)
- [PUT /admin/controls/feature-switches/economy_auto_policy](#put--admin-controls-feature-switches-economy-auto-policy) - Enable or pause the automatic economy policy without step-up (`admin`)
- [POST /admin/controls/policies](#post--admin-controls-policies) - Create an economy policy version, immediate or scheduled (`admin`)
- [POST /admin/controls/policies/activations](#post--admin-controls-policies-activations) - Activate every policy version whose effective time has passed (`admin`)
- [POST /admin/controls/policies/rollbacks](#post--admin-controls-policies-rollbacks) - Return the economy to the previous policy version (`admin`)
- [POST /admin/controls/role-revocations](#post--admin-controls-role-revocations) - Take back an administrative role (`admin`)
- [POST /admin/controls/roles](#post--admin-controls-roles) - Grant an administrative role, or move the superadmin designation (`admin`)
- [GET /admin/discord](#get--admin-discord) - Discord delivery: which types are routed, and what is stuck (`admin`)
- [GET /admin/discord-outbox-events](#get--admin-discord-outbox-events) - Recent Discord outbox deliveries (`admin`)
- [GET /admin/economy](#get--admin-economy) - Money supply, issuance and burn, concentration and operational health (`admin`)
- [GET /admin/economy/ai-status](#get--admin-economy-ai-status) - Economy AI feature switch, latest council review and agent scoreboard (`admin`)
- [GET /admin/economy/alerts](#get--admin-economy-alerts) - Alerts, unacknowledged first (`admin`)
- [POST /admin/economy/alerts/{id}/acknowledgements](#post--admin-economy-alerts--id--acknowledgements) - Acknowledge an alert (`admin`)
- [POST /admin/economy/bulk-payouts](#post--admin-economy-bulk-payouts) - Pay every member the filter matches (`admin`)
- [GET /admin/economy/bulk-payouts/{id}/report](#get--admin-economy-bulk-payouts--id--report) - Who was paid, who was skipped and who failed, one row each (`admin`)
- [POST /admin/economy/bulk-payouts/previews](#post--admin-economy-bulk-payouts-previews) - Count the members a payout would reach, and what it would cost (`admin`)
- [POST /admin/economy/killswitch](#post--admin-economy-killswitch) - Toggle master killswitch or module circuit breaker (`admin`)
- [POST /admin/economy/knobs-v2](#post--admin-economy-knobs-v2) - Update economic knobs (interest, bond yields, loan rates) (`admin`)
- [GET /admin/economy/macro-v2](#get--admin-economy-macro-v2) - Admin Control Center 2.0 Macro Economy statistics (`admin`)
- [GET /admin/economy/reconciliations/latest](#get--admin-economy-reconciliations-latest) - Most recent economy reconciliation health snapshot (`admin`)
- [GET /admin/economy/scenario-lab/preview](#get--admin-economy-scenario-lab-preview) - Read-only deterministic economy scenario projection (`admin`)
- [GET /admin/economy/stats](#get--admin-economy-stats) - Realtime Faucet vs Sink stats and circulation summary (`admin`)
- [POST /admin/economy/transactions/{id}/reversal](#post--admin-economy-transactions--id--reversal) - Reverse one transaction, posting its opposite back to the ledger (`admin`)
- [GET /admin/economy/users/{id}/inspect-v2](#get--admin-economy-users--id--inspect-v2) - Inspect user wallet, deposits, loans, jobs, businesses (`admin`)
- [POST /admin/economy/users/{id}/override-v2](#post--admin-economy-users--id--override-v2) - Override user cash or bank balance (grant or confiscate WLD) (`admin`)
- [GET /admin/me](#get--admin-me) - Roles held by the caller (`admin`)
- [POST /admin/photos](#post--admin-photos) - Upload image bytes to the private store (`admin`)
- [GET /admin/safety/chat-reports](#get--admin-safety-chat-reports) - 관리자 1:1 개인 채팅 신고 큐 목록 조회 (`safety`)
- [GET /admin/safety/chat-reports/{id}](#get--admin-safety-chat-reports--id-) - 관리자 1:1 개인 채팅 신고 상세 및 증거 스냅샷 열람 (`safety`)
- [POST /admin/safety/chat-reports/{id}/action](#post--admin-safety-chat-reports--id--action) - 관리자 1:1 개인 채팅 신고 조치 실행 (`safety`)
- [GET /admin/safety/takedowns](#get--admin-safety-takedowns) - 관리자 긴급 콘텐츠 삭제 큐 조회 (`safety`)
- [POST /admin/safety/takedowns/{caseId}/action](#post--admin-safety-takedowns--caseid--action) - 관리자 긴급 콘텐츠 삭제 조치 (`safety`)
- [GET /admin/season-events](#get--admin-season-events) - Every season event, including inactive ones (`admin`)
- [POST /admin/season-events](#post--admin-season-events) - Create a season event in the active season (`admin`)
- [PATCH /admin/season-events/{id}](#patch--admin-season-events--id-) - Retitle, redescribe or deactivate a season event (`admin`)
- [GET /admin/security](#get--admin-security) - Console session state and login policy (`admin`)
- [POST /admin/security/forced-logouts](#post--admin-security-forced-logouts) - End every live session a member holds (`admin`)
- [GET /admin/security/ip-blocks](#get--admin-security-ip-blocks) - List current and historical service IP blocks (`admin-security`)
- [POST /admin/security/ip-blocks](#post--admin-security-ip-blocks) - Block an IP address or CIDR until manually lifted (`admin-security`)
- [DELETE /admin/security/ip-blocks/{id}](#delete--admin-security-ip-blocks--id-) - Lift a service IP block (`admin-security`)
- [PUT /admin/security/login-policies/{userId}](#put--admin-security-login-policies--userid-) - Replace the address allowlist for an administrator (`admin`)
- [POST /admin/security/sessions](#post--admin-security-sessions) - Enter the operations console, rotating the session (`admin`)
- [DELETE /admin/security/sessions](#delete--admin-security-sessions) - Leave the operations console (`admin`)
- [POST /admin/security/users/{id}/permanent-suspension](#post--admin-security-users--id--permanent-suspension) - Permanently restrict a member and revoke all live sessions (`admin-security`)
- [GET /admin/shop/items](#get--admin-shop-items) - List all items in the catalog for admin inspection (`admin`)
- [PATCH /admin/shop/items/{id}](#patch--admin-shop-items--id-) - Update price, active status, or stock of a catalog item (`admin`)
- [GET /admin/stocks](#get--admin-stocks) - Every stock, including inactive ones (`admin`)
- [POST /admin/stocks](#post--admin-stocks) - List a new stock (`admin`)
- [PATCH /admin/stocks/{id}](#patch--admin-stocks--id-) - Rename, redescribe or deactivate a stock (`admin`)
- [DELETE /admin/stocks/{id}](#delete--admin-stocks--id-) - Delete a stock that has no history (`admin`)
- [POST /admin/stocks/{id}/corporate-actions](#post--admin-stocks--id--corporate-actions) - Apply a split or reverse split (`admin`)
- [POST /admin/stocks/{id}/halt](#post--admin-stocks--id--halt) - Halt stock trading and auto-settle all holdings into cost-basis WLD (`admin`)
- [GET /admin/stocks/{id}/halt-settlement](#get--admin-stocks--id--halt-settlement) - Get stock halt settlement progress and statistics (`admin`)
- [POST /admin/stocks/{id}/halt-settlement/retry](#post--admin-stocks--id--halt-settlement-retry) - Retry failed or quarantined stock halt settlements (`admin`)
- [POST /admin/stocks/{id}/price](#post--admin-stocks--id--price) - Set a stock price by hand (`admin`)
- [GET /admin/stocks/dynamics](#get--admin-stocks-dynamics) - Trend, volatility and fair value per stock (`admin`)
- [GET /admin/stocks/market-events](#get--admin-stocks-market-events) - Recent market events, ended and cancelled included (`admin`)
- [POST /admin/stocks/market-events](#post--admin-stocks-market-events) - Publish a market event: news that leans the market (`admin`)
- [DELETE /admin/stocks/market-events/{id}](#delete--admin-stocks-market-events--id-) - End a market event now (`admin`)
- [GET /admin/support/threads](#get--admin-support-threads) - Administrator support inbox (`admin`)
- [GET /admin/support/threads/{id}/messages](#get--admin-support-threads--id--messages) - Read a support conversation as administrator (`admin`)
- [POST /admin/support/threads/{id}/messages](#post--admin-support-threads--id--messages) - Reply to a member support conversation (`admin`)
- [PUT /admin/support/threads/{id}/status](#put--admin-support-threads--id--status) - Change support conversation status (`admin`)
- [POST /admin/treasury/drain](#post--admin-treasury-drain) - 국고 잉여 자금 영구 소각 (Step-Up/Admin) (`Admin Treasury`)
- [POST /admin/treasury/inject](#post--admin-treasury-inject) - 국고 자금 긴급 주입 (Step-Up/Admin) (`Admin Treasury`)
- [GET /admin/treasury/overview](#get--admin-treasury-overview) - 중앙 국고 및 비축금 현황 대시보드 조회 (`Admin Treasury`)
- [GET /admin/treasury/transactions](#get--admin-treasury-transactions) - 국고 원장 입출금 및 순환 감사 내역 조회 (`Admin Treasury`)
- [GET /admin/users](#get--admin-users) - Members and their status (`admin`)
- [GET /admin/users/{id}/portfolio](#get--admin-users--id--portfolio) - Detailed user asset portfolio (`admin`)
- [PUT /admin/users/{id}/restriction](#put--admin-users--id--restriction) - Restrict or unrestrict a member (`admin`)
- [GET /admin/work](#get--admin-work) - The work catalogue, the reward policy in force, and job levels (`admin`)
- [POST /admin/work/auto-tune](#post--admin-work-auto-tune) - Automatically calculate and tune daily reward cap based on economy health (`admin`)
- [PUT /admin/work/policy](#put--admin-work-policy) - Update work reward policy daily cap, weekly cap, and repeat decay (`admin`)
- [GET /admin/work/stats](#get--admin-work-stats) - Real-time 24h work ranking, daily cap usage buckets, and 7-day trend (`admin`)
- [PATCH /admin/work/tasks/{id}](#patch--admin-work-tasks--id-) - Update base reward, duration, daily limit, and active state of a work task (`admin`)
- [GET /health](#get--health) - Liveness probe (`Health`)
- [GET /privacy/requests](#get--privacy-requests) - Data subject requests the caller has made (`privacy`)
- [POST /privacy/requests](#post--privacy-requests) - Raise a data subject request (`privacy`)
- [POST /safety/takedown](#post--safety-takedown) - 비회원 공개 긴급 콘텐츠 삭제 접수 (`safety`)
- [POST /safety/takedown/status](#post--safety-takedown-status) - 비회원 접수 상태 조회 (`safety`)
- [GET /version](#get--version) - Backend runtime identity (`Version`)

---

## 🛠️ 엔드포인트 상세 규격

### POST `/admin/ai-news/auto-generate`

**설명:** Auto-generate and optionally publish market news based on currently registered active stocks

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AiNewsController_autoGenerate`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/ai-news/auto-generate" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/ai-news/batches`

**설명:** Start a run that asks the model for five scenarios

**상세:** Answers with the run, not with the batch: the model takes longer than any gateway in front of this will wait.

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AiNewsController_generate`
#### 📦 요청 본문 (Request Body)

  - `prompt` (`string`) *(선택)* - The operator's wish for this batch
  - `idempotencyKey` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/ai-news/batches" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/ai-news/batches/latest`

**설명:** The current batch of proposed scenarios, and the last run that asked for one

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AiNewsController_latest`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/ai-news/batches/latest" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/ai-news/models`

**설명:** What the stored key can reach, as GET {base}/models lists it

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AiNewsController_models`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/ai-news/models" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/ai-news/scenarios/{id}/discard`

**설명:** Set a scenario aside

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AiNewsController_discard`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/ai-news/scenarios/{id}/discard" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/ai-news/scenarios/{id}/publish`

**설명:** Publish a scenario as a market event, with the values the operator settled on

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AiNewsController_publish`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `effects` (`array`) **(필수)**
  - `hours` (`number`) **(필수)**
  - `headline` (`string`) **(필수)**
  - `body` (`string`) *(선택)*
  - `idempotencyKey` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/ai-news/scenarios/{id}/publish" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/ai-news/settings`

**설명:** API address, model name and whether a key is stored

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AiNewsController_settings`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/ai-news/settings" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/admin/ai-news/settings`

**설명:** Store the model address, model name and, optionally, a new key

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AiNewsController_saveSettings`
#### 📦 요청 본문 (Request Body)

  - `apiBaseUrl` (`string`) **(필수)** - The OpenAI-standard base: /chat/completions and /models hang off it
  - `model` (`string`) **(필수)**
  - `apiKey` (`string`) *(선택)* - Absent or empty keeps the stored key
  - `idempotencyKey` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/ai-news/settings" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/approvals`

**설명:** Withdrawn: two-person approval was retired

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_approvals`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/approvals" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/approvals`

**설명:** Withdrawn: two-person approval was retired

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_approve`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/approvals" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/approvals/{id}/decisions`

**설명:** Withdrawn: two-person approval was retired

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_decide`

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
curl -X POST "https://easy-scraping.com/admin/approvals/{id}/decisions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/audit-events`

**설명:** Recent audit trail entries

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_auditEvents`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/audit-events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/audit/dispositions`

**설명:** What was archived, destroyed or held

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminAuditController_dispositions`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/audit/dispositions" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/audit/dispositions`

**설명:** Record what was decided about a range past its retention period

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminAuditController_recordDisposition`
#### 📦 요청 본문 (Request Body)

  - `category` (`string`) **(필수)**
  - `fromSequence` (`string`) **(필수)**
  - `toSequence` (`string`) **(필수)**
  - `method` (`string`) **(필수)**
  - `note` (`string`) *(선택)*
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/audit/dispositions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/audit/events`

**설명:** Search the audit trail; addresses and session hashes are masked

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminAuditController_events`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/audit/events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/audit/events/{id}/reveal`

**설명:** Unmask one entry; the reveal is itself recorded

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminAuditController_reveal`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/audit/events/{id}/reveal" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/audit/retention`

**설명:** Retention periods, what is past them, and the last disposition

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminAuditController_retention`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/audit/retention" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/admin/audit/retention/{category}`

**설명:** Append a retention policy version for one category

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminAuditController_setRetention`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `category` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `retentionDays` (`number`) **(필수)**
  - `legalBasis` (`string`) **(필수)**
  - `description` (`string`) **(필수)**
  - `effectiveAt` (`string`) *(선택)*
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/audit/retention/{category}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/audit/verifications`

**설명:** Past chain verifications

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminAuditController_verifications`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/audit/verifications" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/audit/verify`

**설명:** Recompute the hash chain over a window and record the result

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminAuditController_verify`
#### 📦 요청 본문 (Request Body)

  - `fromSequence` (`string`) *(선택)*
  - `toSequence` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/audit/verify" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/bank`

**설명:** Deposits and the loan book, with the credit ladder behind it

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminBankOperationsController_overview`

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
curl -X GET "https://easy-scraping.com/admin/bank" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/business-types`

**설명:** Every business type, including inactive ones

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_businessTypes`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/business-types" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PATCH `/admin/business-types/{id}`

**설명:** Rename, redescribe or deactivate a business type

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_updateBusinessType`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `name` (`string`) *(선택)*
  - `description` (`string`) *(선택)*
  - `active` (`boolean`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PATCH "https://easy-scraping.com/admin/business-types/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/controls`

**설명:** Feature switches, economy policy versions and role assignments

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_overview`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/controls" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/controls/auto-policy`

**설명:** Policy knobs plus classical proposal and matching AI review evidence

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_autoPolicy`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/controls/auto-policy" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/admin/controls/auto-policy/knobs/{knobKey}`

**설명:** Take one knob off automatic, or move its approved range

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_setPolicyKnob`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `knobKey` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**
  - `autoAdjustable` (`boolean`) *(선택)*
  - `minValue` (`string`) *(선택)* - decimal string or number
  - `maxValue` (`string`) *(선택)* - decimal string or number

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/controls/auto-policy/knobs/{knobKey}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/controls/auto-policy/runs`

**설명:** Run the dual-lane automatic adjustment now instead of waiting for Monday

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_runAutoPolicy`
#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/controls/auto-policy/runs" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/controls/consent-versions`

**설명:** Publish a new terms and privacy policy version (Superadmin only)

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_publishConsentVersion`
#### 📦 요청 본문 (Request Body)

  - `termsVersion` (`string`) **(필수)**
  - `privacyVersion` (`string`) **(필수)**
  - `reason` (`string`) **(필수)**
  - `confirmText` (`string`) **(필수)** - Must exactly match PUBLISH_NEW_POLICY_VERSION
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/controls/consent-versions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/controls/consent-versions`

**설명:** List recent terms and privacy policy versions

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_listConsentVersions`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/controls/consent-versions" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/admin/controls/feature-switches/{featureKey}`

**설명:** Enable, pause, put into safe mode or disable a feature

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_setFeatureSwitch`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `featureKey` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `state` (`string`) **(필수)**
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/controls/feature-switches/{featureKey}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/admin/controls/feature-switches/economy_auto_policy`

**설명:** Enable or pause the automatic economy policy without step-up

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_setAutoPolicyFeatureSwitch`
#### 📦 요청 본문 (Request Body)

  - `state` (`string`) **(필수)**
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/controls/feature-switches/economy_auto_policy" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/controls/policies`

**설명:** Create an economy policy version, immediate or scheduled

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_createPolicyVersion`
#### 📦 요청 본문 (Request Body)

  - `version` (`string`) **(필수)**
  - `effectiveAt` (`string`) *(선택)* - ISO 8601 instant; omitted means immediately
  - `payload` (`object`) **(필수)**
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/controls/policies" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/controls/policies/activations`

**설명:** Activate every policy version whose effective time has passed

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_activateDuePolicies`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/controls/policies/activations" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/controls/policies/rollbacks`

**설명:** Return the economy to the previous policy version

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_rollbackPolicy`
#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/controls/policies/rollbacks" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/controls/role-revocations`

**설명:** Take back an administrative role

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_revokeRole`
#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**
  - `userId` (`string`) **(필수)**
  - `role` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/controls/role-revocations" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/controls/roles`

**설명:** Grant an administrative role, or move the superadmin designation

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminControlsController_grantRole`
#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**
  - `userId` (`string`) **(필수)**
  - `role` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/controls/roles" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/discord`

**설명:** Discord delivery: which types are routed, and what is stuck

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminDiscordOperationsController_overview`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/discord" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/discord-outbox-events`

**설명:** Recent Discord outbox deliveries

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_discordOutboxEvents`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/discord-outbox-events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/economy`

**설명:** Money supply, issuance and burn, concentration and operational health

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_dashboard`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/economy" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/economy/ai-status`

**설명:** Economy AI feature switch, latest council review and agent scoreboard

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_aiStatus`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/economy/ai-status" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/economy/alerts`

**설명:** Alerts, unacknowledged first

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_alerts`

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
curl -X GET "https://easy-scraping.com/admin/economy/alerts" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/economy/alerts/{id}/acknowledgements`

**설명:** Acknowledge an alert

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_acknowledgeAlert`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/economy/alerts/{id}/acknowledgements" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/economy/bulk-payouts`

**설명:** Pay every member the filter matches

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_executeBulkPayout`
#### 📦 요청 본문 (Request Body)

  - `userIds` (`array`) *(선택)*
  - `minWorkCompletions` (`number`) *(선택)*
  - `stageCode` (`string`) *(선택)* - A progression stage code
  - `amount` (`number`) **(필수)** - WLD per member
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)** - One key for the batch; re-send it to retry

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/economy/bulk-payouts" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/economy/bulk-payouts/{id}/report`

**설명:** Who was paid, who was skipped and who failed, one row each

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_payoutReport`

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
curl -X GET "https://easy-scraping.com/admin/economy/bulk-payouts/{id}/report" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/economy/bulk-payouts/previews`

**설명:** Count the members a payout would reach, and what it would cost

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_previewBulkPayout`
#### 📦 요청 본문 (Request Body)

  - `userIds` (`array`) *(선택)*
  - `minWorkCompletions` (`number`) *(선택)*
  - `stageCode` (`string`) *(선택)* - A progression stage code
  - `amount` (`number`) **(필수)** - WLD per member

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/economy/bulk-payouts/previews" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/economy/killswitch`

**설명:** Toggle master killswitch or module circuit breaker

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_toggleKillswitch`
#### 📦 요청 본문 (Request Body)

  - `scope` (`string`) **(필수)**
  - `active` (`boolean`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/economy/killswitch" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/economy/knobs-v2`

**설명:** Update economic knobs (interest, bond yields, loan rates)

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_updateKnobsV2`
#### 📦 요청 본문 (Request Body)

  - `depositRateBps` (`number`) **(필수)** - 일일 복리 이자율 bps (예: 5 = 0.05%)
  - `bond7dBps` (`number`) **(필수)** - 7일 국채 만기 수익률 bps (예: 100 = 1.0%)
  - `bond30dBps` (`number`) **(필수)** - 30일 국채 만기 수익률 bps (예: 500 = 5.0%)
  - `loanRateBps` (`number`) **(필수)** - 대출 일일 이자율 bps (예: 10 = 0.1%)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/economy/knobs-v2" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/economy/macro-v2`

**설명:** Admin Control Center 2.0 Macro Economy statistics

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_macroV2`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/economy/macro-v2" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/economy/reconciliations/latest`

**설명:** Most recent economy reconciliation health snapshot

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `ReconciliationController_latest`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/economy/reconciliations/latest" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/economy/scenario-lab/preview`

**설명:** Read-only deterministic economy scenario projection

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_scenarioLabPreview`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/economy/scenario-lab/preview" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/economy/stats`

**설명:** Realtime Faucet vs Sink stats and circulation summary

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_stats`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/economy/stats" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/economy/transactions/{id}/reversal`

**설명:** Reverse one transaction, posting its opposite back to the ledger

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_reverseTransaction`

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
curl -X POST "https://easy-scraping.com/admin/economy/transactions/{id}/reversal" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/economy/users/{id}/inspect-v2`

**설명:** Inspect user wallet, deposits, loans, jobs, businesses

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_inspectUserV2`

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
curl -X GET "https://easy-scraping.com/admin/economy/users/{id}/inspect-v2" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/economy/users/{id}/override-v2`

**설명:** Override user cash or bank balance (grant or confiscate WLD)

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminEconomyController_overrideUserV2`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `assetType` (`string`) **(필수)**
  - `amount` (`string`) **(필수)**
  - `direction` (`string`) **(필수)**
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)** - Caller-owned idempotency key for retry-safe asset overrides

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/economy/users/{id}/override-v2" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/me`

**설명:** Roles held by the caller

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_me`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/me" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/photos`

**설명:** Upload image bytes to the private store

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `PhotoUploadController_upload`
#### 📦 요청 본문 (Request Body)

*(빈 객체)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/photos" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/safety/chat-reports`

**설명:** 관리자 1:1 개인 채팅 신고 큐 목록 조회

- **분류 태그 (Tag):** `safety`
- **엔드포인트 ID:** `SafetyController_adminListChatReports`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `status` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/safety/chat-reports" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/safety/chat-reports/{id}`

**설명:** 관리자 1:1 개인 채팅 신고 상세 및 증거 스냅샷 열람

- **분류 태그 (Tag):** `safety`
- **엔드포인트 ID:** `SafetyController_adminGetChatReport`

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
curl -X GET "https://easy-scraping.com/admin/safety/chat-reports/{id}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/safety/chat-reports/{id}/action`

**설명:** 관리자 1:1 개인 채팅 신고 조치 실행

- **분류 태그 (Tag):** `safety`
- **엔드포인트 ID:** `SafetyController_adminActionChatReport`

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
curl -X POST "https://easy-scraping.com/admin/safety/chat-reports/{id}/action" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/safety/takedowns`

**설명:** 관리자 긴급 콘텐츠 삭제 큐 조회

- **분류 태그 (Tag):** `safety`
- **엔드포인트 ID:** `SafetyController_adminListTakedowns`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `status` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/safety/takedowns" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/safety/takedowns/{caseId}/action`

**설명:** 관리자 긴급 콘텐츠 삭제 조치

- **분류 태그 (Tag):** `safety`
- **엔드포인트 ID:** `SafetyController_adminActionTakedown`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `caseId` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/safety/takedowns/{caseId}/action" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/season-events`

**설명:** Every season event, including inactive ones

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_seasonEvents`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/season-events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/season-events`

**설명:** Create a season event in the active season

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_createSeasonEvent`
#### 📦 요청 본문 (Request Body)

  - `title` (`string`) **(필수)**
  - `description` (`string`) *(선택)*
  - `costWld` (`number`) **(필수)**
  - `pointsPerEntry` (`number`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/season-events" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PATCH `/admin/season-events/{id}`

**설명:** Retitle, redescribe or deactivate a season event

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_updateSeasonEvent`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `title` (`string`) *(선택)*
  - `description` (`string`) *(선택)*
  - `active` (`boolean`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PATCH "https://easy-scraping.com/admin/season-events/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/security`

**설명:** Console session state and login policy

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSecurityController_overview`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/security" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/security/forced-logouts`

**설명:** End every live session a member holds

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSecurityController_forceLogout`
#### 📦 요청 본문 (Request Body)

  - `userId` (`string`) **(필수)**
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/security/forced-logouts" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/security/ip-blocks`

**설명:** List current and historical service IP blocks

- **분류 태그 (Tag):** `admin-security`
- **엔드포인트 ID:** `AbuseSecurityController_ipBlocks`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/security/ip-blocks" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/security/ip-blocks`

**설명:** Block an IP address or CIDR until manually lifted

- **분류 태그 (Tag):** `admin-security`
- **엔드포인트 ID:** `AbuseSecurityController_blockAddress`
#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**
  - `network` (`string`) **(필수)**
  - `reason` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/security/ip-blocks" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/admin/security/ip-blocks/{id}`

**설명:** Lift a service IP block

- **분류 태그 (Tag):** `admin-security`
- **엔드포인트 ID:** `AbuseSecurityController_liftAddress`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**
  - `reason` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/admin/security/ip-blocks/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/admin/security/login-policies/{userId}`

**설명:** Replace the address allowlist for an administrator

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSecurityController_setIpAllowlist`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `userId` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `networks` (`array`) **(필수)** - Networks in CIDR form
  - `reason` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/security/login-policies/{userId}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/security/sessions`

**설명:** Enter the operations console, rotating the session

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSecurityController_openConsole`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/security/sessions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/admin/security/sessions`

**설명:** Leave the operations console

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSecurityController_closeConsole`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **204** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/admin/security/sessions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/security/users/{id}/permanent-suspension`

**설명:** Permanently restrict a member and revoke all live sessions

- **분류 태그 (Tag):** `admin-security`
- **엔드포인트 ID:** `AbuseSecurityController_suspendMember`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/security/users/{id}/permanent-suspension" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/shop/items`

**설명:** List all items in the catalog for admin inspection

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminShopController_listItems`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/shop/items" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PATCH `/admin/shop/items/{id}`

**설명:** Update price, active status, or stock of a catalog item

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminShopController_updateItem`

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
curl -X PATCH "https://easy-scraping.com/admin/shop/items/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/stocks`

**설명:** Every stock, including inactive ones

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_stockList`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/stocks" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/stocks`

**설명:** List a new stock

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_createStock`
#### 📦 요청 본문 (Request Body)

  - `symbol` (`string`) **(필수)**
  - `name` (`string`) **(필수)**
  - `description` (`string`) *(선택)*
  - `price` (`number`) **(필수)**
  - `shares` (`number`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/stocks" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PATCH `/admin/stocks/{id}`

**설명:** Rename, redescribe or deactivate a stock

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_updateStock`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `name` (`string`) *(선택)*
  - `description` (`string`) *(선택)*
  - `active` (`boolean`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PATCH "https://easy-scraping.com/admin/stocks/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/admin/stocks/{id}`

**설명:** Delete a stock that has no history

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_deleteStock`

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
curl -X DELETE "https://easy-scraping.com/admin/stocks/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/stocks/{id}/corporate-actions`

**설명:** Apply a split or reverse split

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_corporateAction`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `action` (`string`) **(필수)**
  - `factor` (`number`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)** - Client-generated key reused when retrying the same mutation

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/stocks/{id}/corporate-actions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/stocks/{id}/halt`

**설명:** Halt stock trading and auto-settle all holdings into cost-basis WLD

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_haltStock`

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
curl -X POST "https://easy-scraping.com/admin/stocks/{id}/halt" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/stocks/{id}/halt-settlement`

**설명:** Get stock halt settlement progress and statistics

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_getHaltSettlement`

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
curl -X GET "https://easy-scraping.com/admin/stocks/{id}/halt-settlement" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/stocks/{id}/halt-settlement/retry`

**설명:** Retry failed or quarantined stock halt settlements

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_retryHaltSettlement`

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
curl -X POST "https://easy-scraping.com/admin/stocks/{id}/halt-settlement/retry" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/stocks/{id}/price`

**설명:** Set a stock price by hand

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_setStockPrice`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `price` (`number`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)** - Client-generated key reused when retrying the same mutation

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/stocks/{id}/price" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/stocks/dynamics`

**설명:** Trend, volatility and fair value per stock

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_stockDynamics`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/stocks/dynamics" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/stocks/market-events`

**설명:** Recent market events, ended and cancelled included

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_marketEvents`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/stocks/market-events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/stocks/market-events`

**설명:** Publish a market event: news that leans the market

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_publishMarketEvent`
#### 📦 요청 본문 (Request Body)

  - `stockId` (`string`) *(선택)* - Absent for the whole market
  - `direction` (`string`) **(필수)**
  - `strength` (`number`) **(필수)**
  - `hours` (`number`) **(필수)**
  - `headline` (`string`) **(필수)**
  - `body` (`string`) *(선택)*
  - `source` (`string`) *(선택)*
  - `idempotencyKey` (`string`) **(필수)** - Client-generated key reused when retrying the same mutation

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/stocks/market-events" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/admin/stocks/market-events/{id}`

**설명:** End a market event now

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `GameCatalogController_cancelMarketEvent`

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
curl -X DELETE "https://easy-scraping.com/admin/stocks/market-events/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/support/threads`

**설명:** Administrator support inbox

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSupportController_threads`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `status` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/support/threads" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/support/threads/{id}/messages`

**설명:** Read a support conversation as administrator

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSupportController_messages`

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
curl -X GET "https://easy-scraping.com/admin/support/threads/{id}/messages" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/support/threads/{id}/messages`

**설명:** Reply to a member support conversation

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSupportController_reply`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `body` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/support/threads/{id}/messages" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/admin/support/threads/{id}/status`

**설명:** Change support conversation status

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminSupportController_status`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `status` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/support/threads/{id}/status" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/treasury/drain`

**설명:** 국고 잉여 자금 영구 소각 (Step-Up/Admin)

- **분류 태그 (Tag):** `Admin Treasury`
- **엔드포인트 ID:** `AdminTreasuryController_absorbFunds`
#### 📦 요청 본문 (Request Body)

  - `vaultCode` (`string`) **(필수)** - 금고 코드
  - `amountWld` (`string`) **(필수)** - 금액 (정수 WLD)
  - `reason` (`string`) **(필수)** - 감사 사유 (최소 10자)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/treasury/drain" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/treasury/inject`

**설명:** 국고 자금 긴급 주입 (Step-Up/Admin)

- **분류 태그 (Tag):** `Admin Treasury`
- **엔드포인트 ID:** `AdminTreasuryController_injectFunds`
#### 📦 요청 본문 (Request Body)

  - `vaultCode` (`string`) **(필수)** - 금고 코드
  - `amountWld` (`string`) **(필수)** - 금액 (정수 WLD)
  - `reason` (`string`) **(필수)** - 감사 사유 (최소 10자)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/treasury/inject" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/treasury/overview`

**설명:** 중앙 국고 및 비축금 현황 대시보드 조회

- **분류 태그 (Tag):** `Admin Treasury`
- **엔드포인트 ID:** `AdminTreasuryController_getOverview`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/treasury/overview" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/treasury/transactions`

**설명:** 국고 원장 입출금 및 순환 감사 내역 조회

- **분류 태그 (Tag):** `Admin Treasury`
- **엔드포인트 ID:** `AdminTreasuryController_listTransactions`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `limit` | `number` | 선택 | - |
| `query` | `cursor` | `string` | 선택 | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/treasury/transactions" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/users`

**설명:** Members and their status

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_users`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/users" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/users/{id}/portfolio`

**설명:** Detailed user asset portfolio

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_userPortfolio`

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
curl -X GET "https://easy-scraping.com/admin/users/{id}/portfolio" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/admin/users/{id}/restriction`

**설명:** Restrict or unrestrict a member

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminController_restrict`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `restricted` (`boolean`) **(필수)**
  - `reason` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/users/{id}/restriction" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/work`

**설명:** The work catalogue, the reward policy in force, and job levels

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminWorkOperationsController_overview`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/work" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/work/auto-tune`

**설명:** Automatically calculate and tune daily reward cap based on economy health

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminWorkOperationsController_autoTune`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/work/auto-tune" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/admin/work/policy`

**설명:** Update work reward policy daily cap, weekly cap, and repeat decay

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminWorkOperationsController_updatePolicy`
#### 📦 요청 본문 (Request Body)

  - `dailyCap` (`number`) *(선택)*
  - `weeklyCap` (`number`) *(선택)*
  - `repeatDecayPercent` (`number`) *(선택)*
  - `enabled` (`boolean`) *(선택)*
  - `reason` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/work/policy" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/work/stats`

**설명:** Real-time 24h work ranking, daily cap usage buckets, and 7-day trend

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminWorkOperationsController_stats`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/work/stats" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PATCH `/admin/work/tasks/{id}`

**설명:** Update base reward, duration, daily limit, and active state of a work task

- **분류 태그 (Tag):** `admin`
- **엔드포인트 ID:** `AdminWorkOperationsController_updateTask`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `baseReward` (`number`) *(선택)*
  - `baseExperience` (`number`) *(선택)*
  - `minimumDurationSeconds` (`number`) *(선택)*
  - `dailyLimit` (`number`) *(선택)*
  - `active` (`boolean`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PATCH "https://easy-scraping.com/admin/work/tasks/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/health`

**설명:** Liveness probe

- **분류 태그 (Tag):** `Health`
- **엔드포인트 ID:** `HealthController_check`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/health" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/privacy/requests`

**설명:** Data subject requests the caller has made

- **분류 태그 (Tag):** `privacy`
- **엔드포인트 ID:** `PrivacyController_list`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/privacy/requests" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/privacy/requests`

**설명:** Raise a data subject request

- **분류 태그 (Tag):** `privacy`
- **엔드포인트 ID:** `PrivacyController_create`
#### 📦 요청 본문 (Request Body)

  - `requestType` (`string`) **(필수)**
  - `detail` (`string`) *(선택)*
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/privacy/requests" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/safety/takedown`

**설명:** 비회원 공개 긴급 콘텐츠 삭제 접수

- **분류 태그 (Tag):** `safety`
- **엔드포인트 ID:** `SafetyController_submitEmergencyTakedown`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/safety/takedown" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/safety/takedown/status`

**설명:** 비회원 접수 상태 조회

- **분류 태그 (Tag):** `safety`
- **엔드포인트 ID:** `SafetyController_getTakedownStatus`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/safety/takedown/status" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/version`

**설명:** Backend runtime identity

- **분류 태그 (Tag):** `Version`
- **엔드포인트 ID:** `VersionController_check`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/version" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

