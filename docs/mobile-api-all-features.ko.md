# 전체 기능 앱 API 가이드

> 버전: v2026.09.12.33
> 기준일: 2026-09-12
> 영문: [mobile-api-all-features.md](mobile-api-all-features.md)

## 목적

이 문서는 Woldeok Moneyverse의 일반 사용자/회원 기능을 앱에서 사용할 수 있도록 제공하는 전체 앱 API 범위를 정의한다. 네이티브/모바일 앱은 `/app-api/v1/*` Next.js BFF를 호출하며 `INTERNAL_API_TOKEN`을 앱에 저장하거나 노출하지 않는다. BFF가 세션 쿠키, CSRF 토큰, 허용된 요청 메타데이터를 비공개 NestJS API로 전달한다.

## 로그인/회원가입 API

앱 인증 방식은 다음을 모두 지원한다.
- 사이트 자체 이메일/비밀번호 회원가입 및 로그인(`local_email`)
- Discord OAuth Authorization Code + PKCE
- Google OAuth/OIDC Authorization Code + PKCE
- 서버 세션 쿠키 + 변경 요청 CSRF
- 계정 identity 연결/해제 및 고위험 작업 재인증

대표 경로:
- `POST /app-api/v1/auth/prelogin-session`
- `GET /app-api/v1/auth/policy`
- `PUT /app-api/v1/auth/consent`
- `GET /app-api/v1/auth/providers`
- `GET /app-api/v1/auth/discord/authorize`
- `GET /app-api/v1/auth/google/authorize`
- 기존 OAuth callback 흐름
- `POST /app-api/v1/auth/local/register`
- `POST /app-api/v1/auth/local/verify-email`
- `POST /app-api/v1/auth/local/login`
- `POST /app-api/v1/auth/logout`

## 전체 앱 기능 API 범위

| 기능 | 앱 API 루트 / 대표 경로 | 지원 범위 |
| --- | --- | --- |
| 계정 | `/app-api/v1/account/*` | identity 연결/해제, 계정 lifecycle |
| 활동 | `/app-api/v1/activity/*` | 회원 활동 기능 |
| 인증 | `/app-api/v1/auth/*` | 자체 로그인, Discord, Google, 세션, 동의 |
| 지갑 | `/app-api/v1/wallet/*` | 잔액, 송금, 원장 기반 회원 작업 |
| 은행 | `/app-api/v1/bank/*`, `/app-api/v1/banking/*` | 입출금/이동, 대출, 상환, 은행 기능 |
| 보상 | `/app-api/v1/rewards/*` | 일일/근무 보상 청구 |
| 근무 | `/app-api/v1/work/*` | 직업 및 근무 작업 |
| 성장 | `/app-api/v1/progression/*` | 레벨/숙련도/성장 정보 |
| 초반 진행 | `/app-api/v1/early-game/*` | 온보딩 및 초기 진행 |
| 참여 | `/app-api/v1/engagement/*` | 참여/회원 루프 |
| 주식 | `/app-api/v1/stocks/*` | 시세, 포트폴리오, 가격, 주문, 기록 |
| 사업 | `/app-api/v1/businesses/*` | 보유 사업, V2 정산, 라이선스 활성화, 부스트 |
| 사업 카탈로그 | `/app-api/v1/businesses/catalog` | 사업 종류 조회 |
| 사업 구매 | `/app-api/v1/businesses/catalog/{id}/purchases` | 사업 종류 구매 |
| 사업 자기자본 | `/app-api/v1/businesses/equity` | 사업 구매에 사용할 수 있는 자기자본 조회 |
| 상점 | `/app-api/v1/shop/*` | 상품, 구매, 상점 모듈 기능 |
| 시즌 | `/app-api/v1/seasons/*` | 이벤트, 소비, 리더보드/보상 흐름 |
| 카지노 | `/app-api/v1/casino/*` | 서버 권한형 가상 미니게임, 한도, 기록 |
| 게시판 | `/app-api/v1/board/*` | 글, 이미지, 게시판 회원 기능 |
| 프로필 | `/app-api/v1/profile/*` | 프로필/회원 데이터 및 프로필 이미지 |
| 공지 | `/app-api/v1/content/announcements` | 공개 공지 조회 |
| 갤러리 | `/app-api/v1/content/photos` | 공개 사진 조회 |
| 서비스 상태 | `/app-api/v1/content/status` | 서비스 상태 조회 |
| 미디어 | `/app-api/v1/media/*`, `/app-api/v1/photos/*` | 미디어 및 회원 사진 기능 |
| 개인정보 | `/app-api/v1/privacy/*` | 개인정보 요청/내보내기/lifecycle 기능 |

## v2026.09.12.33에서 닫은 누락 구간

기존 BFF는 대부분의 회원용 기능을 이미 지원했지만 백엔드의 `announcements`, `status`, `business-types`, `business-equity` 루트는 앱 게이트웨이 허용 그룹 밖에 있었다. BFF 보안 allowlist를 넓히지 않고, 이미 허용된 기능 그룹 아래에 앱 전용 정식 별칭 API를 추가했다.

- `GET /api/v1/announcements` → `GET /app-api/v1/content/announcements`
- `GET /api/v1/photos` → `GET /app-api/v1/content/photos`
- `GET /api/v1/status` → `GET /app-api/v1/content/status`
- `GET /api/v1/business-types` → `GET /app-api/v1/businesses/catalog`
- `POST /api/v1/business-types/{id}/purchases` → `POST /app-api/v1/businesses/catalog/{id}/purchases`
- `GET /api/v1/business-equity` → `GET /app-api/v1/businesses/equity`

## 일반 사용자 앱 API에서 의도적으로 분리하는 경계

다음은 일반 사용자 기능이 아니라 관리자/시스템 간 제어면이므로 앱의 일반 기능 API와 분리한다.
- `/api/v1/admin/*` — 강화된 관리자 권한, 관리자 세션, 재인증 경계
- `/api/v1/integrations/discord/*` — Discord webhook/interactions
- `/health` — 인프라 health probe
- scheduler/background worker 내부 경로

이 분리는 제품 기능을 삭제하는 것이 아니라 일반 앱 클라이언트가 관리자·서버 간 내부 API의 범용 프록시가 되는 것을 방지하기 위한 보안 경계다.

## 보안 계약

- 앱에 `INTERNAL_API_TOKEN`을 넣지 않는다.
- 변경 API는 백엔드가 요구하는 세션/CSRF 검사를 그대로 적용한다.
- 인증, 동의, 소유권, 재인증, 관리자 권한 판단은 백엔드 guard가 최종 권한을 가진다.
- 경제 관련 쓰기는 서버 권한형 처리와 DB invariant를 그대로 유지한다.
- 앱 BFF는 DB 권한이나 백엔드 route guard를 우회하지 않는다.

## 이번 통합 예외

2026-09-12 사용자 명시 지시에 따라 v2026.09.12.33은 일반적인 Test 서버 검증 단계를 생략하고 `main` 통합한다. 이번 작업에 한정한 예외이며 기본 배포 정책 자체를 변경하지 않는다.
