# 개인 공간·세무 구청 & 클럽·시즌 API (Spaces, Clubs & Seasons)

> 가상 부동산 분양/인테리어 레이아웃, 세무 구청 일일 부동산세 납부(SINK_PROPERTY_TAX 100% 소각), 체납 공매 모니터링, 공공 도시 프로젝트 크라우드펀딩, 클럽하우스 12x12 공유 캔버스, 유저 컬렉션 큐레이션 사다리, 시즌 랭킹 및 명예의 전당 보상 분배 엔드포인트

## 📋 목차 (Table of Contents)

- [GET /clubs](#get--clubs) - 클럽 목록 탐색 및 검색 (`clubs`)
- [POST /clubs](#post--clubs) - 신규 클럽 창설 (10,000 WLD 소각) (`clubs`)
- [GET /clubs/{id}](#get--clubs--id-) - 클럽 상세 정보 조회 (`clubs`)
- [GET /clubs/{id}/canvas](#get--clubs--id--canvas) - 클럽하우스 12x12 공유 캔버스 조회 (`clubs`)
- [PUT /clubs/{id}/canvas](#put--clubs--id--canvas) - 클럽하우스 12x12 공유 캔버스 저장 (`clubs`)
- [GET /clubs/{id}/feed](#get--clubs--id--feed) - 클럽 피드 글 목록 조회 (`clubs`)
- [POST /clubs/{id}/feed](#post--clubs--id--feed) - 클럽 피드 또는 공지사항 작성 (`clubs`)
- [POST /clubs/{id}/join](#post--clubs--id--join) - 클럽 공개 가입 (`clubs`)
- [POST /clubs/{id}/leave](#post--clubs--id--leave) - 클럽 탈퇴 (`clubs`)
- [GET /clubs/{id}/members](#get--clubs--id--members) - 클럽 회원 명부 조회 (`clubs`)
- [PATCH /clubs/{id}/members/{userId}/role](#patch--clubs--id--members--userid--role) - 클럽 회원 역할 변경 (`clubs`)
- [GET /clubs/{id}/projects](#get--clubs--id--projects) - 협동 프로젝트 목록 조회 (`clubs`)
- [POST /clubs/{id}/projects/{projectId}/contributions](#post--clubs--id--projects--projectid--contributions) - 협동 프로젝트 WLD 펀딩 기여 (영구 소각) (`clubs`)
- [GET /collections](#get--collections) - 내 수집품 조각 목록 조회 (`collections`)
- [PUT /collections/{id}](#put--collections--id-) - 수집품 유저 메모 및 즐겨찾기 수정 (`collections`)
- [POST /collections/curation/advance](#post--collections-curation-advance) - 소유권 큐레이션 사다리 단계 진척 (`collections`)
- [GET /collections/curation/status](#get--collections-curation-status) - D1~D7 소유권 큐레이션 사다리 상태 조회 (`collections`)
- [POST /seasons/claim-rewards](#post--seasons-claim-rewards) - 시즌 보상 청구 및 수령 (`seasons`)
- [GET /seasons/current](#get--seasons-current) - 현재 시즌 정보 및 내 티어/랭킹 조회 (`seasons`)
- [GET /seasons/events](#get--seasons-events) - Active season events (`seasons`)
- [POST /seasons/events/{id}/consumptions](#post--seasons-events--id--consumptions) - Spend on a season event (`seasons`)
- [GET /seasons/events/{id}/leaderboard](#get--seasons-events--id--leaderboard) - Leaderboard for one event (`seasons`)
- [GET /seasons/hall-of-fame](#get--seasons-hall-of-fame) - 역대 시즌 명예의 전당 헌액자 목록 (`seasons`)
- [POST /seasons/settle](#post--seasons-settle) - 시즌 종료 정산 엔진 (명예의 전당 및 6대 티어 보상 분배) (`seasons`)
- [GET /spaces](#get--spaces) - 내 개인 공간 목록 조회 (`spaces`)
- [GET /spaces/{id}](#get--spaces--id-) - 개인 공간 상세 조회 (`spaces`)
- [PUT /spaces/{id}/layout](#put--spaces--id--layout) - 개인 공간 인테리어/레이아웃 저장 (`spaces`)
- [POST /spaces/{id}/tax/pay](#post--spaces--id--tax-pay) - 개인 공간 일일 부동산세 납부 (100% 영구 소각) (`spaces`)
- [GET /spaces/{id}/tax/status](#get--spaces--id--tax-status) - 개인 공간 부동산세 상태 조회 (`spaces`)
- [GET /spaces/city/projects](#get--spaces-city-projects) - 공공 도시 프로젝트 목록 조회 (`spaces`)
- [POST /spaces/city/projects/{id}/contributions](#post--spaces-city-projects--id--contributions) - 공공 도시 프로젝트 펀딩 기여 (WLD 영구 소각) (`spaces`)
- [POST /spaces/purchase](#post--spaces-purchase) - 개인 공간 구매 (WLD 소각) (`spaces`)
- [GET /spaces/tax/delinquencies](#get--spaces-tax-delinquencies) - 체납 공매 대상 공간 목록 조회 (`spaces`)

---

## 🛠️ 엔드포인트 상세 규격

### GET `/clubs`

**설명:** 클럽 목록 탐색 및 검색

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_listClubs`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `search` | `string` | **필수** | - |
| `query` | `limit` | `string` | **필수** | - |
| `query` | `offset` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/clubs" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/clubs`

**설명:** 신규 클럽 창설 (10,000 WLD 소각)

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_createClub`
#### 📦 요청 본문 (Request Body)

  - `tag` (`string`) **(필수)** - 클럽 태그 (2-8자 대문자 영문/숫자)
  - `name` (`string`) **(필수)** - 클럽 이름 (2-30자)
  - `description` (`string`) *(선택)* - 클럽 소개글 (최대 500자)
  - `charter` (`string`) *(선택)* - 클럽 헌장 (최대 2000자)
  - `joinMode` (`string`) *(선택)* - 가입 방식 (public, invite, request)
  - `idempotencyKey` (`string`) **(필수)** - 클라이언트 멱등성 키

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/clubs" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/clubs/{id}`

**설명:** 클럽 상세 정보 조회

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_getClubById`

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
curl -X GET "https://easy-scraping.com/clubs/{id}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/clubs/{id}/canvas`

**설명:** 클럽하우스 12x12 공유 캔버스 조회

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_getClubCanvas`

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
curl -X GET "https://easy-scraping.com/clubs/{id}/canvas" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/clubs/{id}/canvas`

**설명:** 클럽하우스 12x12 공유 캔버스 저장

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_updateClubCanvas`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `grid` (`array`) **(필수)** - 12x12 가구 배치 그리드 배열
  - `totalScore` (`number`) **(필수)** - 장식 점수

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/clubs/{id}/canvas" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/clubs/{id}/feed`

**설명:** 클럽 피드 글 목록 조회

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_listClubFeed`

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
curl -X GET "https://easy-scraping.com/clubs/{id}/feed" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/clubs/{id}/feed`

**설명:** 클럽 피드 또는 공지사항 작성

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_createClubFeedPost`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `title` (`string`) **(필수)** - 게시글 제목 (1-100자)
  - `body` (`string`) **(필수)** - 게시글 본문 (1-2000자)
  - `isAnnouncement` (`boolean`) *(선택)* - 공지사항 여부 (운영진만 가능)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/clubs/{id}/feed" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/clubs/{id}/join`

**설명:** 클럽 공개 가입

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_joinClub`

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
curl -X POST "https://easy-scraping.com/clubs/{id}/join" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/clubs/{id}/leave`

**설명:** 클럽 탈퇴

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_leaveClub`

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
curl -X POST "https://easy-scraping.com/clubs/{id}/leave" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/clubs/{id}/members`

**설명:** 클럽 회원 명부 조회

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_listClubMembers`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |
| `query` | `limit` | `string` | **필수** | - |
| `query` | `offset` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/clubs/{id}/members" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PATCH `/clubs/{id}/members/{userId}/role`

**설명:** 클럽 회원 역할 변경

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_updateMemberRole`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |
| `path` | `userId` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `role` (`string`) **(필수)** - 변경할 역할

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PATCH "https://easy-scraping.com/clubs/{id}/members/{userId}/role" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/clubs/{id}/projects`

**설명:** 협동 프로젝트 목록 조회

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_listClubProjects`

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
curl -X GET "https://easy-scraping.com/clubs/{id}/projects" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/clubs/{id}/projects/{projectId}/contributions`

**설명:** 협동 프로젝트 WLD 펀딩 기여 (영구 소각)

- **분류 태그 (Tag):** `clubs`
- **엔드포인트 ID:** `ClubController_contributeToProject`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |
| `path` | `projectId` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `amountWld` (`number`) **(필수)** - 기여할 WLD 금액
  - `idempotencyKey` (`string`) **(필수)** - 클라이언트 멱등성 키

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/clubs/{id}/projects/{projectId}/contributions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/collections`

**설명:** 내 수집품 조각 목록 조회

- **분류 태그 (Tag):** `collections`
- **엔드포인트 ID:** `CollectionController_listCollections`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/collections" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/collections/{id}`

**설명:** 수집품 유저 메모 및 즐겨찾기 수정

- **분류 태그 (Tag):** `collections`
- **엔드포인트 ID:** `CollectionController_updatePiece`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `userNote` (`string`) *(선택)* - 수집품 유저 애착 메모 (최대 500자)
  - `isFavorite` (`boolean`) *(선택)* - 즐겨찾기 여부

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/collections/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/collections/curation/advance`

**설명:** 소유권 큐레이션 사다리 단계 진척

- **분류 태그 (Tag):** `collections`
- **엔드포인트 ID:** `CollectionController_advanceCuration`
#### 📦 요청 본문 (Request Body)

  - `targetStep` (`number`) *(선택)* - 소유권 7단계 사다리 목표 단계 (1-7)
  - `timelineDay` (`string`) *(선택)* - D1~D7 타임라인 일차

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/collections/curation/advance" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/collections/curation/status`

**설명:** D1~D7 소유권 큐레이션 사다리 상태 조회

- **분류 태그 (Tag):** `collections`
- **엔드포인트 ID:** `CollectionController_getCurationStatus`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/collections/curation/status" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/seasons/claim-rewards`

**설명:** 시즌 보상 청구 및 수령

- **분류 태그 (Tag):** `seasons`
- **엔드포인트 ID:** `SeasonController_claimReward`
#### 📦 요청 본문 (Request Body)

  - `seasonId` (`string`) **(필수)** - 시즌 ID
  - `idempotencyKey` (`string`) **(필수)** - 클라이언트 멱등성 키

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/seasons/claim-rewards" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/seasons/current`

**설명:** 현재 시즌 정보 및 내 티어/랭킹 조회

- **분류 태그 (Tag):** `seasons`
- **엔드포인트 ID:** `SeasonController_current`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/seasons/current" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/seasons/events`

**설명:** Active season events

- **분류 태그 (Tag):** `seasons`
- **엔드포인트 ID:** `SeasonController_events`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/seasons/events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/seasons/events/{id}/consumptions`

**설명:** Spend on a season event

- **분류 태그 (Tag):** `seasons`
- **엔드포인트 ID:** `SeasonController_consume`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `quantity` (`number`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/seasons/events/{id}/consumptions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/seasons/events/{id}/leaderboard`

**설명:** Leaderboard for one event

- **분류 태그 (Tag):** `seasons`
- **엔드포인트 ID:** `SeasonController_leaderboard`

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
curl -X GET "https://easy-scraping.com/seasons/events/{id}/leaderboard" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/seasons/hall-of-fame`

**설명:** 역대 시즌 명예의 전당 헌액자 목록

- **분류 태그 (Tag):** `seasons`
- **엔드포인트 ID:** `SeasonController_hallOfFame`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/seasons/hall-of-fame" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/seasons/settle`

**설명:** 시즌 종료 정산 엔진 (명예의 전당 및 6대 티어 보상 분배)

- **분류 태그 (Tag):** `seasons`
- **엔드포인트 ID:** `SeasonController_settle`
#### 📦 요청 본문 (Request Body)

  - `seasonId` (`string`) *(선택)* - 정산 대상 시즌 ID (생략 시 현재 활성 시즌)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/seasons/settle" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/spaces`

**설명:** 내 개인 공간 목록 조회

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_listMySpaces`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/spaces" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/spaces/{id}`

**설명:** 개인 공간 상세 조회

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_getSpaceById`

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
curl -X GET "https://easy-scraping.com/spaces/{id}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/spaces/{id}/layout`

**설명:** 개인 공간 인테리어/레이아웃 저장

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_updateLayout`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `layout` (`object`) **(필수)** - 공간 가구/인테리어 레이아웃 JSON

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/spaces/{id}/layout" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/spaces/{id}/tax/pay`

**설명:** 개인 공간 일일 부동산세 납부 (100% 영구 소각)

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_payPropertyTax`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `days` (`number`) **(필수)** - 납부할 일수 (1-30일)
  - `idempotencyKey` (`string`) **(필수)** - 클라이언트 소유 멱등성 키

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/spaces/{id}/tax/pay" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/spaces/{id}/tax/status`

**설명:** 개인 공간 부동산세 상태 조회

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_getSpaceTaxStatus`

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
curl -X GET "https://easy-scraping.com/spaces/{id}/tax/status" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/spaces/city/projects`

**설명:** 공공 도시 프로젝트 목록 조회

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_listCityProjects`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/spaces/city/projects" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/spaces/city/projects/{id}/contributions`

**설명:** 공공 도시 프로젝트 펀딩 기여 (WLD 영구 소각)

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_contributeCityProject`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `amountWld` (`number`) **(필수)** - 기여할 WLD 금액
  - `idempotencyKey` (`string`) **(필수)** - 클라이언트 소유 멱등성 키

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/spaces/city/projects/{id}/contributions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/spaces/purchase`

**설명:** 개인 공간 구매 (WLD 소각)

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_purchaseSpace`
#### 📦 요청 본문 (Request Body)

  - `spaceType` (`string`) **(필수)** - 공간 유형
  - `name` (`string`) **(필수)** - 공간 이름 (1-50자)
  - `idempotencyKey` (`string`) **(필수)** - 클라이언트 소유 멱등성 키

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/spaces/purchase" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/spaces/tax/delinquencies`

**설명:** 체납 공매 대상 공간 목록 조회

- **분류 태그 (Tag):** `spaces`
- **엔드포인트 ID:** `SpaceController_listTaxDelinquencies`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/spaces/tax/delinquencies" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

