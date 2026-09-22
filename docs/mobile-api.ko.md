# 모바일 / 외부 앱 API 및 개발자 포털 가이드

[English](mobile-api.md) | **한국어** | [문서 색인](INDEX.ko.md) | [개발자 포털](/developer)

Moneyverse 백엔드는 `/api/v1` 아래에 애플리케이션 전체 도메인 RESTful API(57개 컨트롤러, 179개 모바일 계약 엔드포인트 / 전체 335개 엔드포인트)를 제공합니다. 운영 서비스는 비공개 네트워크에 격리되어 있으며, Next.js 프론트엔드 App Gateway(`/app-api/v1/*`)가 내부 네트워크에서 `x-internal-token`을 사용하여 안전하게 중계합니다.

네이티브/모바일 앱 및 외부 연동 클라이언트에는 **`INTERNAL_API_TOKEN`을 직접 포함해서는 안 됩니다.** 이 비밀값은 서버 간 통신 전용으로 취급합니다. 안전한 연동 방식은 다음과 같습니다.

1. 앱은 HTTPS로 App Gateway (`https://easy-scraping.com/app-api/v1/*`)에 요청합니다.
2. `INTERNAL_API_TOKEN`은 게이트웨이만 보유합니다.
3. 게이트웨이는 호출자의 Moneyverse 세션 쿠키와 CSRF 토큰을 NestJS API에 전달하고 `x-internal-token`을 직접 추가합니다.
4. OAuth 로그인은 기존 `/auth/:provider/authorize` 및 `/auth/:provider/callback`을 통해 Authorization Code + PKCE 방식을 유지합니다.
5. 상태 변경 요청은 세션의 CSRF 토큰을 `x-csrf-token`에 사용합니다.

이 방식은 별도의 인증 체계 파편화 없이 기존 세션, 동의, 재인증, 데이터베이스 트랜잭션 보안 모델을 완벽히 유지합니다.

## 🧭 대화형 개발자 포털 (`/developer`) 및 스펙 탐색

- **인터랙티브 개발자 포털**: 웹 브라우저에서 [`/developer`](/developer)에 접속하면 7대 카테고리별 실시간 API 카탈로그, cURL / TypeScript / Python 3개 언어 스니펫, 실시간 레이턴시 및 응답 코드를 측정하는 샌드박스 테스터를 사용할 수 있습니다.
- **기계 판독 계약**: [`docs/mobile-api-contract.json`](mobile-api-contract.json)에서 179개 전 도메인 모바일 계약 엔드포인트의 OpenAPI 3.0 스펙을 제공합니다.
- **Swagger UI**: 비운영 개발 환경에서는 `/docs` 및 `/docs-json`을 통해 NestJS Swagger UI에 접근할 수 있습니다.

## 📦 클라이언트에서 사용할 API 그룹

OpenAPI 3.0 태그 및 App Gateway 라우트 그룹 기준입니다. 일반 앱 클라이언트는 다음과 같은 공개/회원용 도메인 그룹을 사용합니다:

| 도메인 그룹 | 주요 엔드포인트 및 기능 |
| :--- | :--- |
| **`auth` / `account`** | 자체 로그인, Google/Discord OAuth, 이메일 인증, 세션/기기 관리, 탈퇴 |
| **`wallet` / `bank` / `banking`** | WLD 잔액 조회, 사용자 간 송금, 은행 예금/출금, 대출 실행 및 상환, 채권 투자, 저축 포켓(`/banking/pockets`) 분할 관리 |
| **`crafting`** | 아이템/장비/부스트 제작 레시피 조회 및 재료 조합 제작 실행 |
| **`marketplace`** | 유저 간 P2P 아이템 거래소 등록, 내 출품 목록, 즉시 구매, 출품 취소 |
| **`notifications`** | 인앱 알림 피드, 미확인 알림 카운트, 단일 알림 확인, 전체 알림 일괄 읽음 처리 |
| **`stocks`** | 상장 주식 시세, 캔들 차트(OHLC), 매수/매도 주문, 포트폴리오, 주가 알림 |
| **`newspaper`** | 실시간 시장 심리 지표(`pulse`), 주간 증시 전망 설문(`poll`), 금융 교육 아티클(`lore`) |
| **`shop` / `inventory`** | 아이템 카탈로그, 소비재/치장품 구매, 아이템 장착 및 소모, 유지비 정산 |
| **`businesses`** | 가상 사업체 인수, 사업체 부스트, 일일 사업 정산(V2), 라이선스 활성화 |
| **`casino`** | 동전 앞뒤 맞추기, 주사위 홀짝/숫자 게임, 공정성(Fairness) 검증, 자가보호 한도 설정 |
| **`board` / `photos`** | 커뮤니티 게시글 및 댓글 CRUD, 사진 갤러리 업로드 및 피드 |
| **`profile` / `progression` / `work`** | 사용자 프로필/타이틀 설정, 레벨 및 신용 등급, 일일 직업 과제 및 보상 수령 |
| **`engagement` / `seasons` / `early-game`** | 일일 퀘스트, 시즌 이벤트 자원 소비 및 리더보드, 온보딩 이벤트 보상 |
| **`privacy` / `content` / `activity`** | 개인정보 열람/삭제 DSR 신청, 공지사항/시스템 상태 조회, 활동 텔레메트리 |

> ⚠️ `admin` 및 `discord` 그룹은 일반 앱 클라이언트용 공개 API가 아니며 내부 권한자 전용으로 보호됩니다.
