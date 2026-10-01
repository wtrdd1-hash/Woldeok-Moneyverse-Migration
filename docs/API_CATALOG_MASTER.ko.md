# 🔌 월덕 머니버스(Woldeok Moneyverse) 공식 마스터 REST API 카탈로그 (v2026.10.01.499)

<!-- CORE-AUTHORITY-V499 -->
## App/Site/Economy Core 상위 권위 — v2026.10.01.499 (2026-10-01)

- **상위 권위:** 이 maintained-document 블록은 아래의 충돌하는 과거 기획문구를 supersede한다. 과거 문구는 당시 의사결정 증거로 보존하되 현재 제품 권위가 아니다.
- **채널 경계:** 목표 canonical public contract는 **App Core** `/app-api/v2/**`, **Site Core** `/site-api/v1/**`다. **App API v1**은 측정된 retirement 전까지 compatibility/runtime 증거로 유지하며 이번 문서 회차는 목표 route가 Test/Production에 이미 구현됐다고 주장하지 않는다.
- **단일 경제권위:** App/Site BFF는 잔액·세금·은행·국고·시장·직업보상·통화정책 규칙을 독립 소유하지 않는다. 하나의 **Economy Core**만 경제 command/read 권위를 가지며 최종 WLD 변경은 append-only ledger와 검토된 PostgreSQL `SECURITY DEFINER` 함수를 거친다.
- **재정 보존:** 모든 `TAX_*`는 explicit reversal 제외 **100% TREASURY_MAIN**으로 들어간다. 세금을 burn/sink로 보내지 않는다. 국고 목적별 예산은 독립 spendable cash vault가 아니라 logical commitment/envelope다.
- **AI 경계:** 하나의 **Economy Policy Registry**와 policy executor만 수치정책 적용권한을 가진다. AI/model/work/stock module은 특정 low-risk key가 `BOUNDED_AUTO`로 등록된 경우를 제외하면 **proposal-only**다. **direct member balance write = 0 (prohibited)**, **direct absolute stock-price write = 0**, historical-ledger rewrite = 0이며 AI가 자기 limit을 넓힐 수 없다.
- **신원 경계:** 내부 **workload identity**와 user/admin/automation actor identity는 독립 검증한다. shared `INTERNAL_API_TOKEN` / `x-internal-token`은 legacy compatibility이며 최종 multi-core service-identity 설계가 아니다.
- **승격 사실성:** expand → shadow/observe → switch → reconcile → contract 순서로 이행한다. exact-SHA 증거 없이는 runtime/Test/Production 완료를 주장하지 않는다.

[English canonical](API_CATALOG_MASTER.md) | **한국어**

> **버전**: `v2026.10.01.499`
> **목표 public contract**: App Core `https://easy-scraping.com/app-api/v2`, Site Core `https://easy-scraping.com/site-api/v1`. 현재 App API v1은 migration compatibility로 유지한다. private Nest/API `/api/v1`은 내부 구현 surface이며 최종 public client contract가 아니다.
> **표준 프로토콜**: HTTP/2, TLS 1.3, JSON (UTF-8)  
> **표준 에러 규격**: RFC 7807 Problem Details for HTTP APIs  
> **다계층 보안 헤더**: `x-session-id`, `x-csrf-token`, `x-internal-token`, `x-totp-code` (관리자 Step-Up 2FA)

---

## 📑 목차 (Table of Contents)
1. [공통 API 아키텍처 및 보안 규격](#1-공통-api-아키텍처-및-보안-규격)
2. [도메인 01: 인증, 세션 & 계정 (Auth & Accounts)](#도메인-01-인증-세션--계정-auth--accounts)
3. [도메인 02: 지갑 & 불변 원장 (Wallet & Ledger)](#도메인-02-지갑--불변-원장-wallet--ledger)
4. [도메인 03: 가상 은행, 예적금 & 신용대출 (Bank & Loans)](#도메인-03-가상-은행-예적금--신용대출-bank--loans)
5. [도메인 04: 노동, 직업 & 자격증 (Work & Professions)](#도메인-04-노동-직업--자격증-work--professions)
6. [도메인 05: 가상 주식, 호가창 & 시장 뉴스 (Stock & Market)](#도메인-05-가상-주식-호가창--시장-뉴스-stock--market)
7. [도메인 06: 가상 파생상품 & 10x 레버리지 선물 (Derivatives & Futures)](#도메인-06-가상-파생상품--10x-레버리지-선물-derivatives--futures)
8. [도메인 07: 상점, 인벤토리 & 경제 특권 (Shop & Items)](#도메인-07-상점-인벤토리--경제-특권-shop--items)
9. [도메인 08: 웹 카지노, 미니게임 & 자가보호 (Casino & Minigames)](#도메인-08-웹-카지노-미니게임--자가보호-casino--minigames)
10. [도메인 09: 가상 기업 & 경영 시뮬레이션 (Businesses)](#도메인-09-가상-기업--경영-시뮬레이션-businesses)
11. [도메인 10: 가상 스타트업 VC 엔젤투자 & 크라우드펀딩 (Ventures & Crowdfunding)](#도메인-10-가상-스타트업-vc-엔젤투자--크라우드펀딩-ventures--crowdfunding)
12. [도메인 11: 가상 부동산 & 메타버스 랜드 (Spaces & Real Estate)](#도메인-11-가상-부동산--메타버스-랜드-spaces--real-estate)
13. [도메인 12: 디스코드 클럽 & 길드 영지 공성전 (Clubs & Warfare)](#도메인-12-디스코드-클럽--길드-영지-공성전-clubs--warfare)
14. [도메인 13: 노코드 퀀트 봇 스튜디오 & 백테스팅 (Quant Studio)](#도메인-13-노코드-퀀트-봇-스튜디오--백테스팅-quant-studio)
15. [도메인 14: 고객지원 티켓, 프라이버시 & 안전 (Support & Safety)](#도메인-14-고객지원-티켓-프라이버시--안전-support--safety)
16. [도메인 15: 통합 관리자 관제타워 & 거시경제 통제 (Admin Tower & Economy)](#도메인-15-통합-관리자-관제타워--거시경제-통제-admin-tower--economy)
17. [RFC 7807 표준 에러 매핑표](#17-rfc-7807-표준-에러-매핑표)
18. [클라이언트 SDK & cURL 통합 호출 예제](#18-클라이언트-sdk--curl-통합-호출-예제)

---

## 1. 공통 API 아키텍처 및 보안 규격

### 1.1 인증 및 권한 헤더 체계
모든 API 호출은 엄격한 다계층 인증 체계를 따릅니다.

| 헤더명 | 필수 여부 | 설명 | 예시 |
| :--- | :---: | :--- | :--- |
| `x-session-id` | 조건부 | 사용자 인증 세션 쿠키 또는 헤더 토큰 | `sess_9f8a7c6b5d4e...` |
| `x-csrf-token` | POST/PUT/DELETE 필수 | 상태 변경 요청 시 CSRF 공격 방어 토큰 | `csrf_3a1b2c...` |
| `x-internal-token` | 내부 서버 간 필수 | Next.js App Router ↔ NestJS 백엔드 간 방화벽 서명 토큰 | `sec_internal_token_32bytes...` |
| `x-totp-code` | 관리자 고위험군 필수 | 관리자 킬스위치, WLD 발행, DB 직접 수정 시 6자리 Step-Up 2FA 코드 | `582910` |

### 1.2 표준 요청/응답 헤더
- `Content-Type`: `application/json; charset=utf-8`
- `Accept`: `application/json`
- `X-Request-Id`: 클라이언트 또는 게이트웨이 추적 UUID

---

## 도메인 01: 인증, 세션 & 계정 (Auth & Accounts)

### 1. `POST /api/v1/auth/login`
- **요약**: 이메일/비밀번호 또는 OAuth 기반 사용자 로그인
- **권한**: Public (비로그인)
- **요청 본문 (JSON)**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **응답 (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_9f8a7c6b-1234-5678-9abc-def012345678",
      "email": "user@example.com",
      "nickname": "골드핸드",
      "role": "USER",
      "wldBalance": 1500000
    },
    "sessionId": "sess_9f8a7c6b5d4e3f2a1b0c9d8e7f6a5b4c",
    "csrfToken": "csrf_1234567890abcdef"
  }
  ```

### 2. `POST /api/v1/auth/logout`
- **요약**: 현재 세션 파기 및 로그아웃
- **권한**: Authenticated User

### 3. `GET /api/v1/accounts/me`
- **요약**: 내 계정 상세 정보, 보유 자산 및 레벨 프로필 조회
- **권한**: Authenticated User

---

## 도메인 02: 지갑 & 불변 원장 (Wallet & Ledger)

### 1. `GET /api/v1/wallet/balance`
- **요약**: 내 보유 WLD 잔액, 잠금 증거금 및 실시간 변동 내역 조회
- **권한**: Authenticated User
- **응답 (200 OK)**:
  ```json
  {
    "userId": "usr_9f8a7c6b-1234-5678-9abc-def012345678",
    "availableWld": 4850000,
    "lockedInStocksWld": 1200000,
    "lockedInDerivativesWld": 500000,
    "totalNetWorthWld": 6550000,
    "lastUpdated": "2026-09-28T04:20:00.000Z"
  }
  ```

### 2. `POST /api/v1/wallet/transfer`
- **요약**: 유저 간 WLD 송금 (이체 수수료 1% 소각)
- **권한**: Authenticated User
- **요청 본문 (JSON)**:
  ```json
  {
    "recipientUserId": "usr_target_1234",
    "amountWld": 100000,
    "idempotencyKey": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
  ```

---

## 도메인 03: 가상 은행, 예적금 & 신용대출 (Bank & Loans)

### 1. `GET /api/v1/bank/products`
- **요약**: 가상 정기예금/적금 상품 목록 (복리 이율, 만기 주기)
- **권한**: Authenticated User

### 2. `POST /api/v1/bank/deposits/subscribe`
- **요약**: 복리 정기예금 가입
- **요청 본문 (JSON)**:
  ```json
  {
    "productId": "dep_monthly_compound_01",
    "amountWld": 1000000,
    "periodDays": 30,
    "idempotencyKey": "b1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
  ```

### 3. `POST /api/v1/loans/apply`
- **요약**: 신용도 기반 가상 대출 신청
- **권한**: Authenticated User

---

## 도메인 04: 노동, 직업 & 자격증 (Work & Professions)

### 1. `GET /api/v1/work/jobs`
- **요약**: 선택 가능한 5대 직업군(데이터 레이블러, AI 프롬프트 엔지니어 등) 및 에너지 요구량 조회

### 2. `POST /api/v1/work/execute`
- **요약**: 노동 수행 및 WLD 임금 수령
- **요청 본문 (JSON)**:
  ```json
  {
    "jobId": "job_prompt_eng_lv2",
    "energySpent": 20,
    "idempotencyKey": "c1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
  ```

---

## 도메인 05: 가상 주식, 호가창 & 시장 뉴스 (Stock & Market)

### 1. `GET /api/v1/stocks`
- **요약**: 상장 가상 주식 전 종목 시세, 등락률, 24시간 거래량 조회

### 2. `GET /api/v1/stocks/:ticker/orderbook`
- **요약**: 10-Depth 실시간 매수/매도 호가창 및 잔량 조회

### 3. `POST /api/v1/stocks/orders`
- **요약**: 주식 매수/매도 주문 제출 (지정가/시장가)
- **요청 본문 (JSON)**:
  ```json
  {
    "ticker": "KRX_005930",
    "side": "BUY",
    "type": "LIMIT",
    "price": 78500,
    "quantity": 10,
    "idempotencyKey": "d1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
  ```

---

## 도메인 06: 가상 파생상품 & 10x 레버리지 선물 (Derivatives & Futures)

### 1. `GET /api/v1/stocks/derivatives/markets`
- **요약**: 가상 선물 시장 종목(삼성전자 10x, NAVER 5x, 월덕100 10x) 및 8시간 펀딩비 조회
- **권한**: Authenticated User

### 2. `GET /api/v1/stocks/derivatives/positions`
- **요약**: 내 활성 롱/숏 레버리지 선물 포지션 목록 및 실시간 미실현 손익(PnL) 조회
- **권한**: Authenticated User

### 3. `POST /api/v1/stocks/derivatives/open`
- **요약**: 레버리지 선물 포지션 진입 (증거금 잠금)
- **요청 본문 (JSON)**:
  ```json
  {
    "ticker": "KRX_005930",
    "side": "LONG",
    "leverage": 10,
    "collateralWld": 500000,
    "idempotencyKey": "e1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
  ```

### 4. `POST /api/v1/stocks/derivatives/:id/close`
- **요약**: 시장가 포지션 청산 및 손익/증거금 즉시 정산

---

## 도메인 07: 상점, 인벤토리 & 경제 특권 (Shop & Items)

### 1. `GET /api/v1/shop/items`
- **요약**: 버프 아이템, 칭호, 인테리어 가구, 프로필 스킨 목록 조회

### 2. `POST /api/v1/shop/purchase`
- **요약**: 아이템 구매 (WLD 영구 소각)

---

## 도메인 08: 웹 카지노, 미니게임 & 자가보호 (Casino & Minigames)

### 1. `POST /api/v1/casino/roulette/spin`
- **요약**: 럭키 룰렛 스핀 (일일 무료 1회 + WLD 유료 베팅)

### 2. `POST /api/v1/casino/crash/play`
- **요약**: 크래시 배수 그래프 베팅 및 캐시아웃

### 3. `POST /api/v1/safety/self-exclusion`
- **요약**: 사행성 방지 24시간~30일 게임 자가 격리 및 베팅 한도 설정

---

## 도메인 09: 가상 기업 & 경영 시뮬레이션 (Businesses)

### 1. `GET /api/v1/businesses/my`
- **요약**: 내가 설립한 가상 법인 및 일일 매출 현황 조회

### 2. `POST /api/v1/businesses/establish`
- **요약**: 신규 법인 설립 및 지분 발행

---

## 도메인 10: 가상 스타트업 VC 엔젤투자 & 크라우드펀딩 (Ventures & Crowdfunding)

### 1. `GET /api/v1/businesses/ventures/pitches`
- **요약**: 현재 크라우드펀딩 진행 중인 스타트업 피치 목록 조회

### 2. `POST /api/v1/businesses/ventures/invest`
- **요약**: 스타트업 엔젤투자 집행 (SAFE 지분 취득)
- **요청 본문 (JSON)**:
  ```json
  {
    "pitchId": "pitch-ai-01",
    "amountWld": 1000000,
    "idempotencyKey": "f1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
  ```

### 3. `POST /api/v1/businesses/ventures/claim-dividend`
- **요약**: 투자 스타트업 분기 배당금 수령

---

## 도메인 11: 가상 부동산 & 메타버스 랜드 (Spaces & Real Estate)

### 1. `GET /api/v1/spaces/real-estate/districts`
- **요약**: 특별 구역(강남 테헤란, 여의도 금융가, 성수 밸리 등) 목록 조회

### 2. `GET /api/v1/spaces/real-estate/lands`
- **요약**: 랜드 필지 목록, 분양가 및 임대 현황 조회

### 3. `POST /api/v1/spaces/real-estate/purchase`
- **요약**: 랜드 필지 신규 매입 등기 (WLD 영구 소각)

### 4. `POST /api/v1/spaces/real-estate/:id/settle-rent`
- **요약**: 소유 랜드 일일 누적 임대료 수익 정산 수령

---

## 도메인 12: 디스코드 클럽 & 길드 영지 공성전 (Clubs & Warfare)

### 1. `GET /api/v1/clubs/warfare/strongholds`
- **요약**: 요새(월덕 중앙은행, 테헤란 거래소 등) 점령 현황 및 세수 풀 조회

### 2. `POST /api/v1/clubs/warfare/declare`
- **요약**: 요새 공성전 선전포고 (보증금 결제)

### 3. `POST /api/v1/clubs/warfare/:id/attack`
- **요약**: 공성전 실시간 타격 및 전투력 투입

---

## 도메인 13: 노코드 퀀트 봇 스튜디오 & 백테스팅 (Quant Studio)

### 1. `GET /api/v1/quant/strategies`
- **요약**: 내 노코드 퀀트 알고리즘 전략 목록 조회

### 2. `POST /api/v1/quant/backtest`
- **요약**: 과거 30일 틱 데이터 기반 알고리즘 백테스팅 시뮬레이션
- **요청 본문 (JSON)**:
  ```json
  {
    "targetTicker": "KRX_005930",
    "periodDays": 30,
    "ruleLogic": { "indicator": "RSI", "condition": "LESS_THAN", "value": 30 },
    "initialCapitalWld": 10000000
  }
  ```

### 3. `POST /api/v1/quant/strategies/:id/toggle`
- **요약**: 퀀트 봇 실시간 자동매매 가동 상태 On/Off 토글

---

## 도메인 14: 고객지원 티켓, 프라이버시 & 안전 (Support & Safety)

### 1. `POST /api/v1/support/tickets`
- **요약**: 1:1 고객지원 티켓 문의 접수

### 2. `POST /api/v1/safety/take-it-down`
- **요약**: 24시간 비회원 아동·청소년 유해물/불법 콘텐츠 긴급 삭제 요청

---

## 도메인 15: 통합 관리자 관제타워 & 거시경제 통제 (Admin Tower & Economy)

### 1. `GET /api/v1/admin/dashboard/stats`
- **요약**: 거시경제 M2 통화량, 활성 세션(1,498개), 실시간 소각량 관제

### 2. `POST /api/v1/admin/switches/toggle`
- **요약**: 킬스위치 및 피처 플래그 토글 (**Step-Up 2FA TOTP 필수**)
- **요청 헤더**: `x-totp-code: 582910`
- **요청 본문 (JSON)**:
  ```json
  {
    "featureKey": "FEATURE_CASINO_ROULETTE",
    "enabled": false,
    "reason": "경제 밸런스 점검 긴급 차단"
  }
  ```

---

## 17. RFC 7807 표준 에러 매핑표

| HTTP 상태 코드 | RFC 7807 `type` | 설명 및 클라이언트 대응 가이드 |
| :--- | :--- | :--- |
| `400 Bad Request` | `https://easy-scraping.com/errors/validation-error` | 입력 DTO 유효성 실패. 필드별 에러 배열 확인 |
| `401 Unauthorized` | `https://easy-scraping.com/errors/unauthorized` | 세션 만료 또는 무효. `/login` 리다이렉트 필요 |
| `403 Forbidden` | `https://easy-scraping.com/errors/forbidden` | 권한 부족 (일반 유저의 관리자 엔드포인트 접근 차단) |
| `409 Conflict` | `https://easy-scraping.com/errors/idempotency-conflict` | 동일 멱등성 키로 중복 실행 요청 차단 |
| `429 Too Many Requests` | `https://easy-scraping.com/errors/rate-limited` | 1분당 호출 한도 초과. `Retry-After` 헤더 대기 |

---

## 18. 클라이언트 SDK & cURL 통합 호출 예제

### TypeScript (Next.js 16 Server Actions / Fetch SDK)
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
    const errorProblem = await response.json();
    throw new Error(`[API Error ${response.status}] ${errorProblem.title}: ${errorProblem.detail}`);
  }

  return response.json();
}
```

### cURL
```bash
curl -X POST "https://easy-scraping.com/api/v1/stocks/derivatives/open" \
  -H "Content-Type: application/json" \
  -H "x-session-id: sess_9f8a7c6b5d4e..." \
  -H "x-csrf-token: csrf_3a1b2c..." \
  -d '{
    "ticker": "KRX_005930",
    "side": "LONG",
    "leverage": 10,
    "collateralWld": 500000,
    "idempotencyKey": "e1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```
