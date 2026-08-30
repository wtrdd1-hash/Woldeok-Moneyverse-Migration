# 월덕 머니버스 재구축 설계 — Next.js + NestJS

작성 2026-08-27. 대상 저장소 `wtrdd1-hash/Woldeok-Moneyverse-Migration`.
원본 `wtrdd1-hash/Woldeok-Moneyverse` (비공개, `/home/ruma/Woldeok-Moneyverse`).

---

## 1. 무엇을 옮기는가

원본은 **프레임워크가 없는** Node 20 ESM 웹 애플리케이션이다. 생 `node:http`,
순차 `if` 라우팅, EJS 뷰 18개, 전역 스크립트로 컴파일되는 브라우저
TypeScript 14개, socket.io 로비, `pg`, `jose`.

### 1.1 핵심 사실 — 비즈니스 로직은 Node에 없다

마이그레이션 47개 · SQL 7,841줄 안의 **`SECURITY DEFINER` 함수 88개**가 이
애플리케이션의 실제 로직이다. 복식부기 원장(`economy_post_transaction`), 주식
거래(`stock_trade`), 대출(`bank_borrow`/`bank_repay`), 2인 승인
(`admin_decide_approval_request`), 감사 해시체인, 멱등키 처리가 전부 거기 있다.

Node의 repository/service 층은 그 함수를 호출하는 얇은 껍데기다.

따라서 "NestJS로 재구축"의 실질은 **HTTP·세션·뷰 층의 교체**이지 경제 로직의
이전이 아니다. 이 전제가 이 문서 전체를 지배한다.

### 1.2 권한 경계 — 유지해야 하는 이유

애플리케이션은 `moneyverse_app` 롤로 접속한다. 그 롤이 실제로 가진 권한:

```
GRANT SELECT, INSERT ON ledger_transactions, ledger_postings, audit_logs   -- UPDATE/DELETE 없음
GRANT SELECT, INSERT, UPDATE ON auth_sessions, oauth_challenges
REVOKE INSERT, UPDATE, DELETE ON users, identities, user_consents
REVOKE ALL ON user_restrictions, minecraft_operations, admin_action_policies,
              virtual_bank_loans, virtual_business_ownerships,
              virtual_stock_corporate_actions, work_reward_policy
GRANT EXECUTE ON FUNCTION ... (74회의 GRANT)
```

`account_balances`에는 UPDATE 권한이 **없다**. 잔액을 바꿀 수 있는 유일한
경로가 `economy_post_transaction`이고, 그 함수는

1. 차변 합계 ≠ 대변 합계면 `RAISE EXCEPTION`
2. 관련 계좌를 `id` 순으로 `FOR UPDATE` 잠금 (데드락 회피)
3. `allow_negative`가 아닌 계좌가 음수가 되면 예외
4. outbox 이벤트까지 같은 트랜잭션에 기록

한다.

**결과**: 애플리케이션이 통째로 침해되어도(SQL 인젝션이든 RCE든) 공격자가 쥔 DB
자격증명으로는 잔액을 직접 변경할 수 없고, 감사 로그를 삭제할 수 없으며(DELETE
권한 부재), 신원을 위조할 수 없고, 자신을 관리자로 승인할 수 없다. 코드가 무엇을
하든 데이터베이스가 거절한다.

ORM으로 쓰기를 옮기려면 지금 **일부러 회수해 둔 권한을 도로 부여**해야 한다. 그
순간 이 보장이 전부 "TypeScript 코드가 잊지 않는다"는 약속으로 격하된다.

### 1.3 결정

| 축 | 결정 | 근거 |
|---|---|---|
| DB | SQL 함수 88개 유지. **쓰기는 전부 함수 호출** | §1.2 |
| ORM | **쓰지 않는다.** `pg`만 사용 (2026-08-27 프로덕션 스키마 실측 후 변경) | 아래 §3.2 |
| 토폴로지 | Next.js가 유일한 공개 출처, NestJS는 내부망 | 세션 쿠키·CSRF·CSP 모델 보존, SEO 확보 |
| API | NestJS 관례로 전면 재설계 + OpenAPI. 외부 등록 URL도 변경 | 사용자 결정 |
| UI | 정보구조·흐름 계승, 시각 실행은 새로 | 사용자 결정 |

---

## 2. 저장소 구조

```
Woldeok-Moneyverse-Migration/                 pnpm workspace
├─ frontend/                Next.js 15 App Router · shadcn/ui · Tailwind v4
├─ backend/                 NestJS 11 · pg · Prisma(읽기) · socket.io
├─ packages/
│  ├─ database/             SQL 마이그레이션 45개 + production-checksums.json
│  └─ contract/             공유 타입 — WldAmount, OpenAPI 생성 클라이언트
├─ services/
│  ├─ minecraft-agent/      원본 그대로 이식
│  └─ minecraft-executor/   원본 그대로 이식
├─ deploy/                  nginx · compose · Dockerfile
└─ docs/
```

pnpm workspace를 쓴다. content-addressed store라 두 앱의 공통 의존성이 디스크에
한 번만 존재한다. 작업 머신의 여유 공간이 19GB뿐이라 실질적 차이가 난다.

Turborepo는 도입하지 않는다. 앱이 둘뿐이고, 이 머신(RAM 3.6GB)에서 추가 오케스트
레이션 층의 비용이 이득보다 크다.

---

## 3. 데이터베이스 계층 (`packages/database`)

### 3.1 마이그레이션

`test/db/init/*.sql`과 `test/db/migrations/*.sql`을 **바이트 단위로 그대로** 옮
긴다. 번호를 다시 매기지 않고, 적용된 마이그레이션을 편집하지 않는다.

```
packages/database/
├─ init/           000-create-app-role.sh · 001-economy-core.sql
├─ migrations/     002-…-046-deleted-member-display.sql  (45개)
├─ migrate.sh      원본 그대로
└─ prisma/schema.prisma   introspect 산출물 (사람이 편집하지 않음)
```

이식 후 검증: 원본과 새 위치의 SQL 파일 집합이 `sha256`으로 동일해야 한다.

### 3.2 ORM은 쓰지 않는다 — 실측 결과

당초 계획은 "쓰기는 SQL 함수, 읽기는 Prisma"였다. 2026-08-27에 프로덕션
스키마를 실제로 측정한 뒤 그 근거가 성립하지 않는다고 판단해 철회했다.

| 항목 | 값 |
|---|---|
| `public` 전체 테이블 | 52 |
| `moneyverse_app`이 SELECT 가능 | 11 |
| INSERT / UPDATE / DELETE 가능 | 3 / 3 / 0 |
| EXECUTE 가능 함수 | 69 |
| 저장소 코드의 함수 호출 : 평범한 테이블 읽기 | 46 : 8 |

읽을 수 있는 11개는 전부 내부 배관이고(`auth_sessions`, `oauth_challenges`,
`ledger_*`, `accounts` …), 그 8개 쿼리는 이미 손으로 타입을 붙인 저장소가
처리한다. ORM은 모델 52개를 만들어 쿼리 8개를 서비스하게 되며, 대가는 쿼리
엔진 바이너리와 generate 단계, 그리고 누군가 스키마 마이그레이션을 ORM으로
돌릴 상시 위험이다.

행 타입은 스키마에 대한 주장이지 증명이 아니다. 각 행 인터페이스에 그 컬럼을
정의한 마이그레이션을 주석으로 단다.

CI는 Prisma 마이그레이션 명령의 등장을 계속 거부한다 — 재도입이 사고가 아니라
의도적 행위가 되도록.

### 3.3 불변식 — 그대로 유지

- 모든 `SECURITY DEFINER` 함수는 `search_path`를 고정한다. 고정되지 않은 함수는
  권한 상승 수단이다
- 멱등키 처리는 확립된 형태를 따른다: 잠금을 replay 검사보다 **먼저** 취하고,
  replay된 행의 소유자가 호출자인지 확인한다 (`shop_purchase`,
  `economy_claim_daily`, `economy_claim_work`, `021`, `044` 참조)

---

## 4. 백엔드 — NestJS

### 4.1 모듈 지도

원본 `src/*` 디렉터리와 거의 1:1이다.

| 모듈 | 담당 |
|---|---|
| `CoreModule` | `ConfigService` · `PgPool` provider |
| `AuthModule` | 세션 · CSRF · OAuth(Discord/Google) · 동의 게이트 · step-up 재인증 |
| `WalletModule` | 잔액 · 송금 · 일일/작업 보상 · 은행 입출금 · 대출 |
| `StockModule` | 시세 · 포트폴리오 · 거래 · 가격 이력 · 시장 스케줄러 |
| `BusinessModule` | 카탈로그 · 구매 · 일일 정산 |
| `SeasonModule` | 이벤트 · 소비 · 리더보드 |
| `ShopModule` | 상품 · 구매 |
| `BoardModule` | 회원 게시판 |
| `ContentModule` | 공지 · 사진 · 서버 상태 · 비공개 이미지 저장소 |
| `AccountModule` | 신원 목록 · 연동/해제 · 탈퇴 |
| `PrivacyModule` | 정보주체 요청 |
| `AdminModule` | 승인 · 감사 · 사용자 제재 · 게임 카탈로그 · 경제 대사(읽기) |
| `MinecraftModule` | 승인된 고정 작업 요청/조회 |
| `DiscordModule` | Interactions(Ed25519) · outbox worker |
| `LobbyModule` | socket.io 게이트웨이 |
| `HealthModule` | `/health` |

### 4.2 각 도메인 모듈의 3층

```
Controller   경로 · DTO(class-validator) · @ApiOperation · Guard
Service      순수 규칙 + 한국어 라벨 매핑 (원본 *-service.ts에서 이식)
Repository   SELECT * FROM <sql_function>(...)   ← 유일한 쓰기 경로
```

Repository는 원본 `postgres-*-repository.ts`의 입력 검증(`requireUuid`,
`requirePositiveSafeInteger` 등)을 그대로 가져온다. DTO 검증이 앞에 있어도
저장소 자체 검증을 없애지 않는다 — 두 겹 다 유지한다.

### 4.3 돈 타입

`WldAmount = string & { __wld }` 브랜디드 타입과 정규 정수 정규식(최대 38자리)을
`packages/contract`로 올려 프론트와 공유한다.

- 금액 컬럼은 `bigint` / `numeric(38,0)`이고 `pg`는 **문자열**로 반환한다
- 산술은 `BigInt()`를 통한다
- 금액이 JavaScript `number`가 되는 지점은 결함으로 취급한다 (2^53 초과 정밀도
  손실). ESLint 규칙으로 `Number(` 적용을 금액 타입에 대해 차단한다

### 4.4 인증

원본의 세션 기전을 그대로 옮긴다. 재발명하지 않는다.

- 불투명 세션 토큰. DB에는 `sha256` 해시만 저장 (`auth_sessions.token_hash`)
- 세션당 CSRF 토큰, 해시 저장 (`csrf_hash`), double-submit 검증
- 8시간 만료
- **prelogin 동의 게이트** — 로그인 전 약관 동의가 없으면 OAuth를 시작하지 않는다
- **step-up 재인증** — 민감 작업(탈퇴, 신원 해제)은 900초 이내 재인증 요구

Guard로 표현한다:

| Guard | 검사 |
|---|---|
| `SessionGuard` | 유효 세션 존재 |
| `AuthenticatedGuard` | `session.user_id` 존재 |
| `ConsentGuard` | `auth_session_has_current_consent` |
| `CsrfGuard` | 상태 변경 요청 전체. 예외 없음 |
| `AdminGuard` | `admin_current_roles` 비어 있지 않음 |
| `ReauthGuard` | `auth_session_has_recent_reauthentication(id, 900)` |

세션 쿠키는 **Next.js 출처에 머문다**. Next 서버가 내부 호출 시 쿠키를 전달하고
NestJS가 세션을 해석한다. NestJS는 쿠키를 발급하지 않고 Next에 지시를 반환한다.

내부 신뢰: NestJS는 공개 노출되지 않으며, 추가로 공유 비밀 헤더
(`x-internal-token`)를 요구한다. 심층 방어이지 유일한 방어가 아니다.

### 4.5 횡단 관심사

- 전역 `ValidationPipe` — `whitelist`, `forbidNonWhitelisted`, `transform`
- 전역 예외 필터 → **RFC 9457 `application/problem+json`**
- `ThrottlerModule` — 원본 3티어 유지: `/auth` 20 · 쓰기 60 · 읽기 240 (분당)
- 프로세스 지역 레이트 리미터라는 한계는 원본과 동일하다. 단일 인스턴스 compose
  에서 옳고, 스케일아웃 시 N배 약해진다 — 알려진 사실이지 간과가 아니다
- Swagger `/docs` — production에서 비활성
- HTTP 서버 타임아웃: `headersTimeout` 8s, `requestTimeout` 20s,
  `connectionsCheckingInterval` 2s, `maxConnections` 1000 (원본의 slowloris 방어)

### 4.6 API 재설계

전면 재설계한다. 외부에 등록된 URL도 함께 바꾸며, Discord/Google 개발자 콘솔의
리다이렉트 URI 수정이 **배포 전 필수 작업**이다.

대표 변경:

| 원본 | 새 경로 |
|---|---|
| `POST /api/v1/stocks/trade` | `POST /api/v1/stocks/{id}/orders` |
| `POST /api/v1/bank/deposit` | `POST /api/v1/bank/movements` `{direction, amount}` |
| `POST /api/v1/bank/loans/{id}/repay` | `POST /api/v1/bank/loans/{id}/repayments` |
| `POST /api/v1/businesses/purchase` | `POST /api/v1/business-types/{id}/purchases` |
| `POST /api/v1/businesses/{id}/settle` | `POST /api/v1/businesses/{id}/settlements` |
| `POST /api/v1/shop/purchases` | `POST /api/v1/shop/items/{id}/purchases` |
| `POST /api/v1/seasons/events/consume` | `POST /api/v1/seasons/events/{id}/consumptions` |
| `POST /api/v1/prelogin-consent` | `PUT /api/v1/auth/consent` |
| `GET /auth/discord/start` | `GET /auth/{provider}/authorize` |
| `GET /auth/discord/callback` | `GET /auth/{provider}/callback` |
| `POST /api/v1/account/identities/{id}/unlink` | `DELETE /api/v1/account/identities/{id}` |
| `{ "error": "..." }` | `{ "type", "title", "status", "detail" }` |

**경로 대조표**가 이식의 안전망이다. 원본 애플리케이션 라우트 82개와 새 경로를 1:1로 기술한
표를 `packages/contract/route-map.ts`에 두고, 테스트가 다음을 검사한다:

1. 원본 애플리케이션 라우트 82개가 모두 표에 있다 (누락 = 이식 실패)
2. 표의 새 경로가 모두 NestJS 라우터에 실재한다
3. 의도적으로 제거한 라우트는 사유와 함께 명시된다

원본의 `route-surface.snapshot.json`은 경로가 바뀌므로 그대로 쓸 수 없다. 이
표가 그 자리를 대신한다.

---

## 5. 프론트엔드 — Next.js + shadcn/ui

### 5.1 출처 분할

```
nginx (공개 호스트 하나)
  /socket.io/*  →  NestJS 직결 (WebSocket 업그레이드)
  /*            →  Next.js

  Next 서버  ──내부망──→  NestJS
```

socket.io만 예외인 이유: Next Route Handler는 WebSocket 업그레이드를 프록시할 수
없다. nginx에서 경로로 가르면 브라우저 입장에서는 여전히 동일 출처이므로 세션
쿠키와 CSP 모델이 그대로 성립한다.

### 5.2 SEO

Next.js를 선택한 이유가 검색 노출과 빠른 라우팅이므로 명시적으로 설계한다.

| 경로 | 렌더링 | 색인 |
|---|---|---|
| `/` `/announcements` `/gallery` `/board` `/status` | RSC 서버 렌더 + ISR | 허용 |
| `/terms` `/privacy` | 정적 | 허용 |
| `/wallet` `/stocks` `/businesses` `/seasons` `/shop` `/account` | 서버 셸 + Suspense 스트리밍 | `noindex` |
| `/admin/*` `/login/*` | 동적 | `noindex` |

- `generateMetadata` — 제목, 설명, OG/트위터 카드
- `sitemap.ts` · `robots.ts`
- 공지와 갤러리에 JSON-LD 구조화 데이터
- **`SEO_INDEXING_ENABLED`가 `robots.ts`를 지배한다.** 원본의 opt-in 정책 유지 —
  정본 도메인이 확정되기 전에는 색인을 차단한다

### 5.3 빠른 라우팅

- App Router 클라이언트 내비게이션, `<Link>` prefetch
- 좌측 레일과 헤더를 레이아웃에 두어 페이지 전환 시 재마운트하지 않는다
- 인증 페이지는 셸을 즉시 렌더하고 데이터는 Suspense로 스트리밍한다

### 5.4 shadcn/ui 사용 원칙

- 컴포넌트를 직접 만들지 않는다. Card · Table · Tabs · Dialog · Sheet · Form ·
  Select · Sonner · Skeleton · Badge · Separator 등을 그대로 쓴다
- 테마는 CSS 변수로만 얹는다. 컴포넌트 내부를 고쳐야 한다면 먼저 토큰으로 풀 수
  있는지 검토한다
- Radix 기반이므로 키보드 내비게이션, 포커스 트랩, 스크린리더 대응이 검증된 채로
  온다. 이 이점을 훼손하지 않는다

### 5.5 시각 방향 — 「원장 (Ledger Plate)」

원본의 방향(따뜻한 크림 배경 + 에디토리얼 세리프 + 클레이 액센트)은 현재 AI 생성
디자인이 가장 흔하게 수렴하는 기본값과 일치한다. 정보구조와 흐름만 계승하기로
했으므로, 이 주제에서만 도출되는 방향으로 다시 잡는다.

**출발점**: 이 제품의 정체는 게임이 아니라 **복식부기 장부**다. 차변과 대변이
일치해야만 커밋되는 원장. 그 사실을 시각의 중심에 둔다.

#### 팔레트

```
--ledger  #E8EAE3   회색 도는 회계용지. 녹색 편향 — 크림(#F4F1EA) 아님
--ink     #1B2A24   진한 소나무 잉크. 원본 포레스트 그린의 계승
--brass   #A67C2E   주조된 놋빛. 통화 기호와 주요 액션 — 테라코타 아님
--rise    #C6382C   상승 빨강  ┐ 한국 증시 관행. 서구와 반대이며
--fall    #2F5FA8   하락 파랑  ┘ 이 사용자층에게는 이쪽이 정보로서 옳다
--plate   #FAFAF7   떠 있는 카드면
```

다크 모드: 잉크가 바탕이 되고(`#12181A`), plate는 `#1A2223`, 놋빛은 `#D6A34A`로
밝아진다. shadcn 토큰(`--background`, `--foreground`, `--primary`, `--muted`,
`--border`, `--ring`)에 이 값을 매핑한다.

`--rise` / `--fall`은 색만으로 정보를 전달하지 않는다. 항상 부호(`+` / `−`)와
방향 아이콘을 동반한다.

#### 타이포그래피

Inter/Geist 기본값 대신, 한글이 1급 시민인 조합을 쓴다.

| 역할 | 서체 | 이유 |
|---|---|---|
| 디스플레이 | **Hahmlet** | 한글·라틴 겸용 세리프. 세로 강세가 강해 흔한 에디토리얼 세리프와 구분된다. 절제해서 사용 |
| 본문 · UI | **IBM Plex Sans KR** | 한글과 라틴이 같은 설계에서 나와 자연히 붙는다. "기록 시스템"의 목소리 |
| 수치 · 데이터 | **IBM Plex Mono**, `tabular-nums` | 금액 전량. Plex Sans KR과 설계상 한 가족 |

`next/font/google`로 자가 호스팅한다 (외부 요청 없음, CLS 없음).

#### 시그니처 — 전기(轉記) 스트립

금액을 "뱃지 붙은 리스트 행"으로 그리지 않는다. 모든 거래를 **차변면 · 헤어라인 ·
대변면**의 세 부분으로 렌더한다. `economy_post_transaction`이 강제하는
`debit_total = credit_total`을 화면 형태로 옮긴 것이다.

지갑의 거래 목록이 곧 원장이다. 송금이 성공하면 양쪽에서 선이 그어져 가운데서
만난다(대차 일치). **애니메이션은 이 한 곳에만 쓴다.**

#### 레이아웃

- 데스크톱: 좌측 고정 레일(장부 색인 탭). 본문은 쌓이는 plate
- 모바일: 하단 내비게이션
- 품질 하한선 — 44px 탭 타깃, 가시 포커스 링, `prefers-reduced-motion` 준수,
  모바일까지 반응형

### 5.6 사용자 문구

**제품 문구는 한국어이며 원본의 문자열을 보존한다.** 특히 socket.io 로비 메시지와
표시 이름 자리표시자는 원본 그대로 옮긴다. 새로 쓰는 문구는 능동태, 문장형, 버튼이
약속한 동사를 결과 토스트에서도 유지한다.

---

## 6. 실시간 — 로비

원본의 socket.io 로비를 NestJS 게이트웨이로 옮긴다. 다음 방어가 전부 유지된다:

| 항목 | 값 |
|---|---|
| 핸드셰이크 레이트 리밋 | 20/분 (`allowRequest`에서) |
| 최대 엔진 연결 | 300 |
| 최대 로비 연결 | 250 |
| 미인증 로비 연결 | 50 |
| 세션당 연결 | 5 |
| 메시지 속도 | 10초당 5건 |
| `maxHttpBufferSize` | 8KB |
| Origin | 동일 출처만. 와일드카드 CORS 금지 |

메시지 발신은 로그인 + 최신 동의를 요구하며, 매 메시지마다 재확인한다.
제어문자 제거와 180자 절단도 그대로다.

---

## 7. 사이드카 서비스

`minecraft-agent`와 `minecraft-executor`는 **웹 경로가 아니다.** 전자는 게임
호스트의 loopback 전용 HTTP 에이전트(systemd), 후자는 DB 리스로 승인된 작업을
claim하는 호스트 로컬 워커다.

executor는 HTTP가 아니라 DB 리스로 동작하므로 API 재설계의 영향을 받지 않는다.
둘 다 코드를 그대로 옮기고, 원본 `src/minecraft/*`를 상대 경로로 참조하던 결합만
`packages/contract` 또는 backend의 공개 타입으로 정리한다.

`minecraft-executor/tsconfig.json`의 `rootDir: ".."`은 그 결합 때문에 존재했다.
이식 후 결합이 사라지면 정상적인 `rootDir`로 되돌리고, systemd 유닛의
`ExecStart=` 경로를 같은 커밋에서 갱신한다.

---

## 8. 테스트와 검증

### 8.1 작업 머신의 제약 — 먼저 밝힌다

작업 머신에 **docker도 podman도 PostgreSQL 서버도 없다** (psql 클라이언트 18.4만
존재). 원본의 개발 DB 스택이 `docker compose`였으므로 그대로는 기동할 수 없다.

RAM 3.6GB / i3-7100U 4스레드 / 디스크 여유 19GB라는 제약도 함께 적용된다.

### 8.2 대응

- 테스트 러너를 **Vitest 하나**로 통일한다. 백엔드는 `unplugin-swc`로 Nest
  데코레이터 메타데이터(`design:type`)를 처리한다. Jest보다 가볍고 이 RAM에서
  유리하다. Vitest+Nest 조합이 문제를 일으키면 Jest로 후퇴하되 그 사실을 기록한다
- 백엔드 단위·컨트롤러 테스트는 **DB 없이** 돈다. 원본의 185개 단위 테스트가 이미
  부분 테스트 더블 방식이며 그 방식을 계승한다
- DB가 필요한 테스트는 작성하되 `DATABASE_URL`이 있을 때만 실행한다.
  **DB 없이 실행하지 못한 테스트를 "통과"로 보고하지 않는다**
- 프론트는 Vitest + Testing Library. e2e는 Playwright
- `cargo`가 아닌 Node 빌드지만 병렬도는 낮게 유지한다 (`--maxWorkers=2` 상당)

### 8.3 테스트 더블 규약 계승

원본의 규약을 그대로 가져온다: **테스트 더블은 의도적으로 부분적이다.** 컴파일을
만족시키려고 스텁 메서드를 채워 넣지 않는다. 그러면 테스트가 증명하는 내용이
바뀐다. 타이핑 결과 더블에 실제로 호출되는 멤버가 빠져 있음이 드러나면, 그것은
조용히 고칠 대상이 아니라 **보고할 발견**이다.

### 8.4 이식 증명

| 검사 | 방법 |
|---|---|
| SQL 무변경 | 원본과 새 위치 마이그레이션 파일의 `sha256` 일치 |
| 라우트 누락 없음 | `route-map.ts` 대조표 테스트 (§4.6) |
| 사용자 문구 보존 | 로비 메시지·표시 이름 자리표시자 문자열 대조 |
| 금액 정밀도 | `WldAmount` 타입 + `number` 변환 금지 린트 |
| 접근성 | 44px 탭 타깃, 포커스 가시성, 축소 모션 |

### 8.5 제어문자 정규식 취급

원본이 네 차례 겪은 사고를 계승 대상으로 명시한다. 입력 정제 코드의
백슬래시-`u` 이스케이프가 편집 도구에 의해 **원시 제어 바이트로 치환**되는 일이
있었다. 파일은 정상으로 보이지만 리터럴의 의미가 달라진다.

제어문자 클래스를 포함한 파일을 건드릴 때는 텍스트가 아니라 **바이트를**
검증한다:

```bash
grep -nP '[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]' <files>   # 출력 없음 = 정상
```

---

## 9. 규약

- **저장소에 남는 글은 전부 영어다** — 코드 주석, 커밋 메시지, PR 제목과 본문,
  테스트 이름, assert 메시지. `docs/` 아래 문서는 한국어 허용
- **사용자에게 보이는 제품 문구는 한국어**이며 원본 문자열을 보존한다
- Conventional Commits (`feat|fix|docs|refactor|test|build|chore(scope): …`)
- **커밋에 `Co-Authored-By: Claude` 트레일러, `Claude-Session:` 트레일러,
  "Generated with Claude Code" 문구를 넣지 않는다.** PR 본문도 마찬가지다
- 상태 변경 라우트는 예외 없이 CSRF 보호를 받는다. 라우트를 추가하면 보호도 같은
  커밋에서 추가한다
- `as` 캐스트보다 실제 narrowing을 선호한다. 살아남은 캐스트는 그것을 정당화하는
  불변식과 함께 `docs/as-casts.md`에 기록한다

---

## 10. 단계

| # | 내용 | 완료 기준 |
|---|---|---|
| 0 | 저장소 · pnpm workspace · 툴링 · CI | 빈 앱 둘이 빌드·린트·테스트를 통과 |
| 1 | `packages/database` — 마이그레이션 이식 | 프로덕션 DB 기록과 `sha256` 일치 |
| 2 | 백엔드 코어 — config · pool · 세션 · CSRF · 가드 · 예외필터 · OpenAPI | 인증 왕복 성립 |
| 3 | 도메인 모듈 13개 | 대조표의 새 경로 전량 실재 |
| 4 | 로비 게이트웨이 | 채팅 · 접속자 수 · 모든 상한 유지 |
| 5 | 프론트 기반 — shadcn · 토큰 · 폰트 · 레이아웃 · 전기 스트립 | 디자인 시스템 동작 |
| 6 | 공개 페이지 | SEO 검증 (메타데이터 · sitemap · robots · JSON-LD) |
| 7 | 인증 페이지 | 지갑 · 주식 · 사업 · 시즌 · 상점 · 계정 · 로그인 |
| 8 | 관리자 페이지 | 승인 · 감사 · 콘텐츠 · 마인크래프트 |
| 9 | 사이드카 이식 + 배포 | Dockerfile · compose · nginx |
| 10 | 대조 검증 · 문서 | §8.4 전 항목 통과 |

3~8단계는 분량이 크다. 각 단계 종료 시 커밋하고 진행 상황을 보고한다.

---

## 11. 이 설계가 의도적으로 하지 않는 것

- **SQL 함수를 TypeScript로 재구현하지 않는다** (§1.2)
- **ORM을 쓰지 않는다** — 스키마 소유권은 번호 붙은 SQL에만 있다 (§3.2)
- **NestJS를 공개 노출하지 않는다** — 브라우저는 Next.js에만 접속한다
- **원본의 시각 디테일을 그대로 복제하지 않는다** — 정보구조와 흐름만 계승한다
- **레이트 리미터를 분산 저장소로 옮기지 않는다** — 원본과 동일한 알려진 한계로
  두며, 스케일아웃 시점의 별도 작업이다
- **사용자 문구를 번역하거나 "개선"하지 않는다**
