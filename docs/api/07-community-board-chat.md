# 커뮤니티 게시판 & 실시간 채팅·미디어 API (Community, Board & Chat)

> 자유게시판 및 종목 토론방 글 작성/수정/삭제, 댓글, 좋아요, 광고 게재, 1:1 및 그룹 실시간 채팅, 메시지 읽음 처리, 안전 뮤트/차단, 갤러리 사진 업로드 및 미디어 스트리밍 엔드포인트

## 📋 목차 (Table of Contents)

- [POST /activity/events](#post--activity-events) - Ingest client activity telemetry events (page view, dwell, clicks) (`activity`)
- [GET /admin/activity/logs](#get--admin-activity-logs) - List user activity logs for administrators (`activity`)
- [GET /admin/activity/traffic](#get--admin-activity-traffic) - Privacy-safe day/month/year traffic analytics for administrators (`activity`)
- [POST /admin/announcements](#post--admin-announcements) - Create or edit an announcement (`content`)
- [GET /admin/announcements](#get--admin-announcements) - List all announcements for administrators (`content`)
- [PUT /admin/announcements/{id}](#put--admin-announcements--id-) - Update an announcement (`content`)
- [DELETE /admin/announcements/{id}](#delete--admin-announcements--id-) - Delete an announcement (`content`)
- [PUT /admin/announcements/{id}/image](#put--admin-announcements--id--image) - Attach an uploaded image to a draft announcement (`content`)
- [PUT /admin/announcements/{id}/publication](#put--admin-announcements--id--publication) - Publish or unpublish an announcement (`content`)
- [GET /admin/photos](#get--admin-photos) - List all gallery photos for administrators (`content`)
- [DELETE /admin/photos/{id}](#delete--admin-photos--id-) - Delete a draft or published photo (`content`)
- [POST /admin/photos/{id}/approval](#post--admin-photos--id--approval) - Approve and publish a pending member photo (`content`)
- [PUT /admin/photos/{id}/publication](#put--admin-photos--id--publication) - Publish or unpublish a photo (`content`)
- [POST /admin/photos/metadata](#post--admin-photos-metadata) - Create or edit a photo record (`content`)
- [GET /admin/photos/submissions](#get--admin-photos-submissions) - List pending photo submissions awaiting review (`content`)
- [GET /announcements](#get--announcements) - Published announcements (`content`)
- [GET /board/images/{key}](#get--board-images--key-) - Read an image attached to a visible board post (`board`)
- [POST /board/images/uploads](#post--board-images-uploads) - Upload one image for a board post (`board`)
- [GET /board/posts](#get--board-posts) - Recent member board posts (`board`)
- [POST /board/posts](#post--board-posts) - Write a post (`board`)
- [GET /board/posts/{id}](#get--board-posts--id-) - One post, with its body (`board`)
- [PUT /board/posts/{id}](#put--board-posts--id-) - Rewrite your own post (`board`)
- [DELETE /board/posts/{id}](#delete--board-posts--id-) - Delete your own post (`board`)
- [GET /board/posts/{id}/comments](#get--board-posts--id--comments) - The replies on a post, oldest first (`board`)
- [POST /board/posts/{id}/comments](#post--board-posts--id--comments) - Reply to a post (`board`)
- [DELETE /board/posts/{id}/comments/{commentId}](#delete--board-posts--id--comments--commentid-) - Delete your own reply (`board`)
- [GET /board/public/images/{key}](#get--board-public-images--key-) - Public image attached to a visible board post (`board`)
- [GET /board/public/posts](#get--board-public-posts) - Public recent board posts (`board`)
- [GET /board/public/posts/{id}](#get--board-public-posts--id-) - Public board post (`board`)
- [GET /board/public/posts/{id}/comments](#get--board-public-posts--id--comments) - Public replies on a board post (`board`)
- [GET /board/public/stock-posts](#get--board-public-stock-posts) - 엔드포인트 상세 (`board`)
- [POST /board/stock-posts](#post--board-stock-posts) - 엔드포인트 상세 (`board`)
- [POST /chat/conversations](#post--chat-conversations) - 1:1 대화방 생성 또는 기존 대화방 조회 (`chat`)
- [GET /chat/conversations](#get--chat-conversations) - 참여 중인 1:1 대화방 목록 조회 (`chat`)
- [POST /chat/conversations/{id}/archive](#post--chat-conversations--id--archive) - 대화방 보관 또는 보관 해제 (`chat`)
- [GET /chat/conversations/{id}/messages](#get--chat-conversations--id--messages) - 대화방 메시지 이력 조회 (`chat`)
- [POST /chat/conversations/{id}/messages](#post--chat-conversations--id--messages) - 대화방에 1:1 쪽지 메시지 전송 (`chat`)
- [POST /chat/conversations/{id}/mute](#post--chat-conversations--id--mute) - 대화방 알림 음소거 또는 해제 (`chat`)
- [POST /chat/conversations/{id}/read](#post--chat-conversations--id--read) - 대화방 메시지 읽음 처리 (`chat`)
- [POST /chat/conversations/{id}/report](#post--chat-conversations--id--report) - 부적절한 대화 내용 신고 및 증거 스냅샷 접수 (`chat`)
- [GET /chat/unread-count](#get--chat-unread-count) - 안 읽은 전체 쪽지 개수 조회 (`chat`)
- [POST /chat/users/{id}/block](#post--chat-users--id--block) - 특정 회원 1:1 쪽지 차단 (`chat`)
- [DELETE /chat/users/{id}/block](#delete--chat-users--id--block) - 특정 회원 1:1 쪽지 차단 해제 (`chat`)
- [GET /content/announcements](#get--content-announcements) - App API: published announcements (`content`)
- [GET /content/photos](#get--content-photos) - App API: published gallery photos (`content`)
- [GET /content/status](#get--content-status) - App API: service status board (`content`)
- [POST /integrations/discord/interactions](#post--integrations-discord-interactions) - Discord interaction webhook (`discord`)
- [GET /media/{key}](#get--media--key-) - Bytes of a published gallery photo (`content`)
- [GET /media/profile/{key}](#get--media-profile--key-) - Bytes of a member’s profile picture, on their terms (`content`)
- [GET /photos](#get--photos) - Published gallery photos (`content`)
- [POST /photos](#post--photos) - Send an uploaded photo to the gallery for review (`content`)
- [GET /photos/mine](#get--photos-mine) - The caller’s own submissions and where each one got to (`content`)
- [POST /photos/uploads](#post--photos-uploads) - Upload image bytes and receive a storage key (`content`)
- [GET /profile](#get--profile) - The caller’s own profile, with every field (`profile`)
- [PUT /profile](#put--profile) - Replace the caller’s profile and its per-field visibility (`profile`)
- [GET /profile/{userId}](#get--profile--userid-) - Another member’s profile, as they have chosen to show it (`profile`)
- [POST /profile/image](#post--profile-image) - Upload a profile picture, replacing the current one (`profile`)
- [DELETE /profile/image](#delete--profile-image) - Remove the profile picture (`profile`)
- [GET /profile/settings](#get--profile-settings) - The caller’s own profile settings, as stored (`profile`)
- [GET /profile/titles](#get--profile-titles) - Profile titles actually awarded to the caller (`profile`)
- [GET /status](#get--status) - Server status board (`content`)

---

## 🛠️ 엔드포인트 상세 규격

### POST `/activity/events`

**설명:** Ingest client activity telemetry events (page view, dwell, clicks)

- **분류 태그 (Tag):** `activity`
- **엔드포인트 ID:** `ActivityController_ingestEvents`
#### 📦 요청 본문 (Request Body)

  - `events` (`array`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/activity/events" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/activity/logs`

**설명:** List user activity logs for administrators

- **분류 태그 (Tag):** `activity`
- **엔드포인트 ID:** `ActivityController_listLogs`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `limit` | `number` | 선택 | - |
| `query` | `offset` | `number` | 선택 | - |
| `query` | `eventType` | `string` | 선택 | Filter by event type |
| `query` | `userId` | `string` | 선택 | Filter by user UUID |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/activity/logs" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/admin/activity/traffic`

**설명:** Privacy-safe day/month/year traffic analytics for administrators

- **분류 태그 (Tag):** `activity`
- **엔드포인트 ID:** `ActivityController_traffic`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `granularity` | `string` | 선택 | - |
| `query` | `periods` | `number` | 선택 | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/activity/traffic" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/admin/announcements`

**설명:** Create or edit an announcement

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_saveAnnouncement`
#### 📦 요청 본문 (Request Body)

  - `announcementId` (`string`) *(선택)* - Omit to create
  - `title` (`string`) **(필수)**
  - `body` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/announcements" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/announcements`

**설명:** List all announcements for administrators

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_adminAnnouncements`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/announcements" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/admin/announcements/{id}`

**설명:** Update an announcement

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_updateAnnouncement`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `title` (`string`) **(필수)**
  - `body` (`string`) **(필수)**
  - `isPinned` (`boolean`) *(선택)*
  - `contentState` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/announcements/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/admin/announcements/{id}`

**설명:** Delete an announcement

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_deleteAnnouncement`

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
curl -X DELETE "https://easy-scraping.com/admin/announcements/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/admin/announcements/{id}/image`

**설명:** Attach an uploaded image to a draft announcement

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_setAnnouncementImage`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `storageKey` (`string`) **(필수)** - Key in the private image store
  - `altText` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/announcements/{id}/image" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/admin/announcements/{id}/publication`

**설명:** Publish or unpublish an announcement

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_publishAnnouncement`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `publish` (`boolean`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/announcements/{id}/publication" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/photos`

**설명:** List all gallery photos for administrators

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_listAllPhotos`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/photos" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### DELETE `/admin/photos/{id}`

**설명:** Delete a draft or published photo

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_rejectPhoto`

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
curl -X DELETE "https://easy-scraping.com/admin/photos/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/photos/{id}/approval`

**설명:** Approve and publish a pending member photo

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_approveMemberPhoto`

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
curl -X POST "https://easy-scraping.com/admin/photos/{id}/approval" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/admin/photos/{id}/publication`

**설명:** Publish or unpublish a photo

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_publishPhoto`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `publish` (`boolean`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/admin/photos/{id}/publication" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/admin/photos/metadata`

**설명:** Create or edit a photo record

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_savePhoto`
#### 📦 요청 본문 (Request Body)

  - `photoId` (`string`) *(선택)*
  - `storageKey` (`string`) **(필수)** - Key in the private image store
  - `imageUrl` (`string`) **(필수)** - Source URL, validated against the allowed host list
  - `altText` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/admin/photos/metadata" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/admin/photos/submissions`

**설명:** List pending photo submissions awaiting review

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_listPendingPhotos`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/admin/photos/submissions" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/announcements`

**설명:** Published announcements

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_announcements`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/announcements" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/board/images/{key}`

**설명:** Read an image attached to a visible board post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardImageController_image`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `key` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/board/images/{key}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/board/images/uploads`

**설명:** Upload one image for a board post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardImageController_upload`
#### 📦 요청 본문 (Request Body)

*(빈 객체)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/board/images/uploads" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/board/posts`

**설명:** Recent member board posts

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardController_list`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/board/posts" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/board/posts`

**설명:** Write a post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardController_create`
#### 📦 요청 본문 (Request Body)

  - `title` (`string`) **(필수)**
  - `body` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**
  - `imageStorageKey` (`string`) *(선택)*
  - `imageAltText` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/board/posts" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/board/posts/{id}`

**설명:** One post, with its body

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardController_read`

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
curl -X GET "https://easy-scraping.com/board/posts/{id}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/board/posts/{id}`

**설명:** Rewrite your own post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardController_update`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `title` (`string`) **(필수)**
  - `body` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**
  - `imageStorageKey` (`string`) *(선택)*
  - `imageAltText` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/board/posts/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/board/posts/{id}`

**설명:** Delete your own post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardController_remove`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **204** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/board/posts/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/board/posts/{id}/comments`

**설명:** The replies on a post, oldest first

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardController_comments`

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
curl -X GET "https://easy-scraping.com/board/posts/{id}/comments" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/board/posts/{id}/comments`

**설명:** Reply to a post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardController_reply`

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
curl -X POST "https://easy-scraping.com/board/posts/{id}/comments" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/board/posts/{id}/comments/{commentId}`

**설명:** Delete your own reply

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `BoardController_removeComment`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |
| `path` | `commentId` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **204** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/board/posts/{id}/comments/{commentId}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/board/public/images/{key}`

**설명:** Public image attached to a visible board post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `PublicBoardImageController_image`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `key` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/board/public/images/{key}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/board/public/posts`

**설명:** Public recent board posts

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `PublicBoardController_list`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/board/public/posts" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/board/public/posts/{id}`

**설명:** Public board post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `PublicBoardController_read`

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
curl -X GET "https://easy-scraping.com/board/public/posts/{id}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/board/public/posts/{id}/comments`

**설명:** Public replies on a board post

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `PublicBoardController_comments`

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
curl -X GET "https://easy-scraping.com/board/public/posts/{id}/comments" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/board/public/stock-posts`

**설명:** 상세 설명

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `PublicStockCommunityController_list`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `query` | `stock` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/board/public/stock-posts" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/board/stock-posts`

**설명:** 상세 설명

- **분류 태그 (Tag):** `board`
- **엔드포인트 ID:** `StockCommunityController_create`
#### 📦 요청 본문 (Request Body)

  - `title` (`string`) **(필수)**
  - `body` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**
  - `imageStorageKey` (`string`) *(선택)*
  - `imageAltText` (`string`) *(선택)*
  - `stockSymbol` (`string`) **(필수)**
  - `category` (`string`) **(필수)**
  - `stance` (`string`) **(필수)**
  - `positionDisclosure` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/board/stock-posts" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/chat/conversations`

**설명:** 1:1 대화방 생성 또는 기존 대화방 조회

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_openConversation`
#### 📦 요청 본문 (Request Body)

  - `peerUserId` (`string`) **(필수)** - 상대방 회원 ID

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/chat/conversations" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/chat/conversations`

**설명:** 참여 중인 1:1 대화방 목록 조회

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_listConversations`

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
curl -X GET "https://easy-scraping.com/chat/conversations" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/chat/conversations/{id}/archive`

**설명:** 대화방 보관 또는 보관 해제

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_archiveConversation`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `archived` (`boolean`) **(필수)** - 대화방 보관 여부

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/chat/conversations/{id}/archive" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/chat/conversations/{id}/messages`

**설명:** 대화방 메시지 이력 조회

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_listMessages`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |
| `query` | `limit` | `string` | **필수** | - |
| `query` | `beforeSequence` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/chat/conversations/{id}/messages" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/chat/conversations/{id}/messages`

**설명:** 대화방에 1:1 쪽지 메시지 전송

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_sendMessage`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `body` (`string`) **(필수)** - 메시지 본문
  - `idempotencyKey` (`string`) *(선택)* - 클라이언트 멱등성 키 (미제공시 서버 자동생성)

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/chat/conversations/{id}/messages" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/chat/conversations/{id}/mute`

**설명:** 대화방 알림 음소거 또는 해제

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_muteConversation`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `muted` (`boolean`) **(필수)** - 대화방 알림 음소거 여부

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/chat/conversations/{id}/mute" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/chat/conversations/{id}/read`

**설명:** 대화방 메시지 읽음 처리

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_markAsRead`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `sequence` (`number`) **(필수)** - 읽은 마지막 메시지 시퀀스 번호

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/chat/conversations/{id}/read" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/chat/conversations/{id}/report`

**설명:** 부적절한 대화 내용 신고 및 증거 스냅샷 접수

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_reportConversation`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📦 요청 본문 (Request Body)

  - `reason` (`string`) **(필수)** - 신고 사유 코드
  - `details` (`string`) **(필수)** - 구체적 신고 상세 사유

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/chat/conversations/{id}/report" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/chat/unread-count`

**설명:** 안 읽은 전체 쪽지 개수 조회

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_unreadCount`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/chat/unread-count" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/chat/users/{id}/block`

**설명:** 특정 회원 1:1 쪽지 차단

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_blockUser`

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
curl -X POST "https://easy-scraping.com/chat/users/{id}/block" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/chat/users/{id}/block`

**설명:** 특정 회원 1:1 쪽지 차단 해제

- **분류 태그 (Tag):** `chat`
- **엔드포인트 ID:** `ChatController_unblockUser`

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
curl -X DELETE "https://easy-scraping.com/chat/users/{id}/block" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/content/announcements`

**설명:** App API: published announcements

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `AppContentController_announcements`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/content/announcements" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/content/photos`

**설명:** App API: published gallery photos

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `AppContentController_photos`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/content/photos" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/content/status`

**설명:** App API: service status board

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `AppContentController_status`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/content/status" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/integrations/discord/interactions`

**설명:** Discord interaction webhook

- **분류 태그 (Tag):** `discord`
- **엔드포인트 ID:** `DiscordController_interactions`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/integrations/discord/interactions" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/media/{key}`

**설명:** Bytes of a published gallery photo

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `MediaController_media`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `key` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/media/{key}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/media/profile/{key}`

**설명:** Bytes of a member’s profile picture, on their terms

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ProfileImageController_image`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `key` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/media/profile/{key}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/photos`

**설명:** Published gallery photos

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_photos`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/photos" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/photos`

**설명:** Send an uploaded photo to the gallery for review

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `MemberPhotoController_submit`
#### 📦 요청 본문 (Request Body)

  - `storageKey` (`string`) **(필수)** - A key this server issued from POST /photos/uploads
  - `altText` (`string`) **(필수)**
  - `idempotencyKey` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/photos" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/photos/mine`

**설명:** The caller’s own submissions and where each one got to

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `MemberPhotoController_mine`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/photos/mine" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/photos/uploads`

**설명:** Upload image bytes and receive a storage key

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `MemberPhotoController_upload`
#### 📦 요청 본문 (Request Body)

*(빈 객체)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/photos/uploads" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/profile`

**설명:** The caller’s own profile, with every field

- **분류 태그 (Tag):** `profile`
- **엔드포인트 ID:** `ProfileController_mine`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/profile" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### PUT `/profile`

**설명:** Replace the caller’s profile and its per-field visibility

- **분류 태그 (Tag):** `profile`
- **엔드포인트 ID:** `ProfileController_replace`
#### 📦 요청 본문 (Request Body)

  - `visibility` (`string`) **(필수)**
  - `displayName` (`string`) *(선택)*
  - `imageUrl` (`string`) *(선택)*
  - `fieldVisibility` (`object`) *(선택)*
  - `featuredTitle` (`string`) *(선택)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/profile" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/profile/{userId}`

**설명:** Another member’s profile, as they have chosen to show it

- **분류 태그 (Tag):** `profile`
- **엔드포인트 ID:** `ProfileController_member`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `userId` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/profile/{userId}" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/profile/image`

**설명:** Upload a profile picture, replacing the current one

- **분류 태그 (Tag):** `profile`
- **엔드포인트 ID:** `ProfileController_uploadImage`
#### 📦 요청 본문 (Request Body)

*(빈 객체)*

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/profile/image" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### DELETE `/profile/image`

**설명:** Remove the profile picture

- **분류 태그 (Tag):** `profile`
- **엔드포인트 ID:** `ProfileController_removeImage`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **204** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/profile/image" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/profile/settings`

**설명:** The caller’s own profile settings, as stored

- **분류 태그 (Tag):** `profile`
- **엔드포인트 ID:** `ProfileController_settings`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/profile/settings" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/profile/titles`

**설명:** Profile titles actually awarded to the caller

- **분류 태그 (Tag):** `profile`
- **엔드포인트 ID:** `ProfileController_titles`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/profile/titles" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/status`

**설명:** Server status board

- **분류 태그 (Tag):** `content`
- **엔드포인트 ID:** `ContentController_status`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/status" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

