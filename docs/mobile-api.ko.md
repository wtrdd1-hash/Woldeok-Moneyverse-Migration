# 모바일 / 외부 앱 API

[English](mobile-api.md) | **한국어** | [문서 색인](INDEX.ko.md)

Moneyverse 백엔드는 이미 `/api/v1` 아래에 애플리케이션 API를 제공합니다. 운영 서비스는 의도적으로 비공개이며 일반적으로 Next.js 프론트엔드가 내부 네트워크에서 `x-internal-token`을 사용해 요청할 때만 허용합니다.

네이티브/모바일 앱에는 **`INTERNAL_API_TOKEN`을 넣어서는 안 됩니다.** 이 비밀값은 서버 간 통신 전용으로 취급합니다. 안전한 연동 방식은 다음과 같습니다.

1. 앱은 HTTPS로 앱 전용 게이트웨이/BFF에 요청합니다.
2. `INTERNAL_API_TOKEN`은 게이트웨이만 보유합니다.
3. 게이트웨이는 호출자의 Moneyverse 세션 쿠키와 CSRF 토큰을 NestJS API에 전달하고 `x-internal-token`을 직접 추가합니다.
4. OAuth 로그인은 기존 `/auth/:provider/authorize` 및 `/auth/:provider/callback`을 통해 Authorization Code + PKCE 방식을 유지합니다.
5. 상태 변경 요청은 세션의 CSRF 토큰을 `x-csrf-token`에 사용합니다.

이 방식은 별도의 두 번째 인증 체계를 만들지 않고 기존 세션, 동의, 재인증, 데이터베이스 보안 모델을 유지합니다.

## 탐색
운영이 아닌 환경에서는 `/docs`에 Swagger UI가 제공됩니다. 원본 OpenAPI JSON은 Nest Swagger의 `/docs-json`에서 확인할 수 있습니다. 문서는 버전이 지정된 `/api/v1` 엔드포인트와 두 서버 측 헤더를 설명합니다.

## 클라이언트에서 사용할 API 그룹
OpenAPI 태그가 기준입니다. 일반 앱 클라이언트는 `auth`, `wallet`, `banking`, `stocks`, `shop`, `businesses`, `casino`, `board`, `profile`, `progression`, `work`, `content`, `engagement`, `seasons`, `privacy`, `activity`, `early-game` 같은 회원/공개 그룹을 사용합니다.

`admin`과 `discord` 그룹은 일반 앱 클라이언트용 API가 아닙니다.
