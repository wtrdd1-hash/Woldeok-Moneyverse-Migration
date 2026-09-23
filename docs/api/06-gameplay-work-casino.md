# 게임플레이 & 직업·카지노 API (Gameplay, Work & Casino)

> 직업 배정, 일일 노동 퀘스트 및 급여 수령, 레벨업/성장 단계, 주사위·코인플립 미니게임 플레이, 이용약관, 공정성(Provably Fair) 시드 검증 및 자가 보호 베팅 한도 설정 엔드포인트

## 📋 목차 (Table of Contents)

- [GET /casino/clock](#get--casino-clock) - Read the authoritative accelerated server day and week (`casino`)
- [GET /casino/coin/fairness](#get--casino-coin-fairness) - The disclosed win probability and the trial that evidences it (`casino`)
- [POST /casino/coin/plays](#post--casino-coin-plays) - Stake WLD on one toss of the coin (`casino`)
- [GET /casino/coin/terms](#get--casino-coin-terms) - The odds, the stake limits, and what today has already used (`casino`)
- [GET /casino/dice/fairness](#get--casino-dice-fairness) - Each dice game’s disclosed odds and the trial evidencing them (`casino`)
- [POST /casino/dice/plays](#post--casino-dice-plays) - Stake WLD on one roll of the die (`casino`)
- [GET /casino/games/terms](#get--casino-games-terms) - Every game’s odds, payout and remaining exposure for today (`casino`)
- [GET /casino/history](#get--casino-history) - Read the current member's recent casino plays (`casino`)
- [GET /casino/jackpot](#get--casino-jackpot) - Read current casino house reserve and jackpot pool (`casino`)
- [PUT /casino/self-limit](#put--casino-self-limit) - Set the daily caps and the lock the member holds themselves to (`casino`)
- [GET /casino/self-limit](#get--casino-self-limit) - Read the daily limits chosen by the current member (`casino`)
- [POST /casino/theme/plays](#post--casino-theme-plays) - Stake WLD on one play of a theme catalog game (`casino`)
- [POST /early-game/claims](#post--early-game-claims) - Claim today’s event, once (`early-game`)
- [GET /early-game/first-day](#get--early-game-first-day) - The seven steps of 16.1’s first day, counted from what happened (`early-game`)
- [GET /early-game/today](#get--early-game-today) - The event this member is dealt today, and whether it is still theirs (`early-game`)
- [GET /engagement](#get--engagement) - Today’s goals, this week’s goals, the next unlock and the preference (`engagement`)
- [GET /engagement/early-game](#get--engagement-early-game) - The early-game weekly goals and collection books (`engagement`)
- [POST /engagement/npcs/{code}/orders](#post--engagement-npcs--code--orders) - Take an order from an NPC (`engagement`)
- [PUT /engagement/preferences](#put--engagement-preferences) - Set whether the member hears about their goals (`engagement`)
- [GET /progression](#get--progression) - The caller’s growth stage and what unlocks the next one (`progression`)
- [GET /progression/credit](#get--progression-credit) - The caller’s credit grade, what each grade buys, and their loans (`progression`)
- [GET /progression/early-game](#get--progression-early-game) - The early-game unlock ladder and what the caller has reached (`progression`)
- [POST /progression/refreshes](#post--progression-refreshes) - Recompute the caller’s growth stage from their progress (`progression`)
- [GET /work](#get--work) - Caps, what has been paid against them, and open assignments (`work`)
- [POST /work/active-job](#post--work-active-job) - Switch active job among 8 specialization careers (`work`)
- [GET /work/assignments](#get--work-assignments) - The caller’s recent assignments (`work`)
- [POST /work/assignments](#post--work-assignments) - Take a task (`work`)
- [POST /work/assignments/{id}/completions](#post--work-assignments--id--completions) - Submit a taken task as done (`work`)
- [POST /work/assignments/{id}/verify](#post--work-assignments--id--verify) - Verify a submitted task and pay it, within the caps (`work`)
- [GET /work/profile](#get--work-profile) - Current active job and all job masteries (`work`)
- [GET /work/receipts](#get--work-receipts) - What the work paid, and the ledger transaction it paid through (`work`)
- [GET /work/tasks](#get--work-tasks) - Every task on offer, with this member’s standing against each (`work`)
- [POST /work/tasks/{id}/complete](#post--work-tasks--id--complete) - Directly complete a career task with EXP and instant WLD faucet payout (`work`)

---

## 🛠️ 엔드포인트 상세 규격

### GET `/casino/clock`

**설명:** Read the authoritative accelerated server day and week

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_clock`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/casino/clock" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/casino/coin/fairness`

**설명:** The disclosed win probability and the trial that evidences it

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_fairness`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/casino/coin/fairness" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/casino/coin/plays`

**설명:** Stake WLD on one toss of the coin

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_play`
#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**
  - `choice` (`string`) **(필수)**
  - `stake` (`number`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/casino/coin/plays" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/casino/coin/terms`

**설명:** The odds, the stake limits, and what today has already used

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_terms`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/casino/coin/terms" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/casino/dice/fairness`

**설명:** Each dice game’s disclosed odds and the trial evidencing them

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_diceFairness`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/casino/dice/fairness" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/casino/dice/plays`

**설명:** Stake WLD on one roll of the die

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_playDice`
#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**
  - `game` (`string`) **(필수)**
  - `choice` (`string`) **(필수)**
  - `stake` (`number`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/casino/dice/plays" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/casino/games/terms`

**설명:** Every game’s odds, payout and remaining exposure for today

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_gameTerms`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/casino/games/terms" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/casino/history`

**설명:** Read the current member's recent casino plays

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_history`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/casino/history" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/casino/jackpot`

**설명:** Read current casino house reserve and jackpot pool

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_jackpot`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/casino/jackpot" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/casino/self-limit`

**설명:** Set the daily caps and the lock the member holds themselves to

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_setSelfLimit`
#### 📦 요청 본문 (Request Body)

  - `dailyBetLimit` (`number`) **(필수)**
  - `dailyLossLimit` (`number`) **(필수)**
  - `lockedUntil` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/casino/self-limit" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/casino/self-limit`

**설명:** Read the daily limits chosen by the current member

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_selfLimit`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/casino/self-limit" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/casino/theme/plays`

**설명:** Stake WLD on one play of a theme catalog game

- **분류 태그 (Tag):** `casino`
- **엔드포인트 ID:** `CasinoController_playTheme`
#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**
  - `game` (`string`) **(필수)**
  - `choice` (`string`) **(필수)**
  - `stake` (`number`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/casino/theme/plays" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/early-game/claims`

**설명:** Claim today’s event, once

- **분류 태그 (Tag):** `early-game`
- **엔드포인트 ID:** `EarlyGameController_claim`
#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**
  - `eventDate` (`string`) **(필수)** - The Asia/Seoul day the screen is showing

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/early-game/claims" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/early-game/first-day`

**설명:** The seven steps of 16.1’s first day, counted from what happened

- **분류 태그 (Tag):** `early-game`
- **엔드포인트 ID:** `EarlyGameController_firstDay`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/early-game/first-day" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/early-game/today`

**설명:** The event this member is dealt today, and whether it is still theirs

- **분류 태그 (Tag):** `early-game`
- **엔드포인트 ID:** `EarlyGameController_today`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/early-game/today" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/engagement`

**설명:** Today’s goals, this week’s goals, the next unlock and the preference

- **분류 태그 (Tag):** `engagement`
- **엔드포인트 ID:** `EngagementController_dashboard`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/engagement" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/engagement/early-game`

**설명:** The early-game weekly goals and collection books

- **분류 태그 (Tag):** `engagement`
- **엔드포인트 ID:** `EngagementController_earlyGame`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/engagement/early-game" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/engagement/npcs/{code}/orders`

**설명:** Take an order from an NPC

- **분류 태그 (Tag):** `engagement`
- **엔드포인트 ID:** `EngagementController_recordNpcOrder`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `code` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/engagement/npcs/{code}/orders" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/engagement/preferences`

**설명:** Set whether the member hears about their goals

- **분류 태그 (Tag):** `engagement`
- **엔드포인트 ID:** `EngagementController_setPreferences`
#### 📦 요청 본문 (Request Body)

  - `notificationsEnabled` (`boolean`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/engagement/preferences" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/progression`

**설명:** The caller’s growth stage and what unlocks the next one

- **분류 태그 (Tag):** `progression`
- **엔드포인트 ID:** `ProgressionController_status`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/progression" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/progression/credit`

**설명:** The caller’s credit grade, what each grade buys, and their loans

- **분류 태그 (Tag):** `progression`
- **엔드포인트 ID:** `ProgressionController_credit`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/progression/credit" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/progression/early-game`

**설명:** The early-game unlock ladder and what the caller has reached

- **분류 태그 (Tag):** `progression`
- **엔드포인트 ID:** `ProgressionController_earlyGameUnlocks`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/progression/early-game" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/progression/refreshes`

**설명:** Recompute the caller’s growth stage from their progress

- **분류 태그 (Tag):** `progression`
- **엔드포인트 ID:** `ProgressionController_refresh`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/progression/refreshes" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/work`

**설명:** Caps, what has been paid against them, and open assignments

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_dashboard`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/work" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/work/active-job`

**설명:** Switch active job among 8 specialization careers

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_switchJob`
#### 📦 요청 본문 (Request Body)

  - `jobType` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/work/active-job" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/work/assignments`

**설명:** The caller’s recent assignments

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_assignments`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/work/assignments" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/work/assignments`

**설명:** Take a task

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_assign`
#### 📦 요청 본문 (Request Body)

  - `taskId` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/work/assignments" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/work/assignments/{id}/completions`

**설명:** Submit a taken task as done

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_submit`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**
  - `evidence` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/work/assignments/{id}/completions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/work/assignments/{id}/verify`

**설명:** Verify a submitted task and pay it, within the caps

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_verify`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**
  - `evidence` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/work/assignments/{id}/verify" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/work/profile`

**설명:** Current active job and all job masteries

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_profile`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/work/profile" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/work/receipts`

**설명:** What the work paid, and the ledger transaction it paid through

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_receipts`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/work/receipts" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/work/tasks`

**설명:** Every task on offer, with this member’s standing against each

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_tasks`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/work/tasks" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/work/tasks/{id}/complete`

**설명:** Directly complete a career task with EXP and instant WLD faucet payout

- **분류 태그 (Tag):** `work`
- **엔드포인트 ID:** `WorkController_completeTask`

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
curl -X POST "https://easy-scraping.com/work/tasks/{id}/complete" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

