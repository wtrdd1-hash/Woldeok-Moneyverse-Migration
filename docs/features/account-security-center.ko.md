# 계정 보안 센터

상태: 통합 후보 `v2026.09.13.24`.

로그인한 회원이 활성 세션을 확인하고 사용하지 않는 다른 세션을 종료할 수 있습니다. 기존 권위 데이터인 `auth_sessions`를 그대로 사용하며 새 DB migration은 추가하지 않습니다.

## 런타임 계약

- `GET /api/v1/account/security/sessions`: 회원에게 필요한 최소 세션 정보만 조회합니다.
- `DELETE /api/v1/account/security/sessions/{id}`: 본인 소유의 다른 활성 세션 하나를 종료합니다.
- `POST /api/v1/account/security/sessions/revoke-others`: 현재 세션을 제외한 다른 활성 세션을 모두 종료합니다.
- 현재 세션 제외는 SQL에서 강제합니다.
- 종료 작업은 인증/동의 세션, CSRF 검증, 최근 본인확인을 요구합니다.
- 세션 토큰/해시, OAuth subject, 원시 네트워크 메타데이터, 전체 요청 메타데이터는 노출하지 않습니다.

## 프론트엔드

`/account/security`는 인증 필수·동적·`noindex` 화면입니다. 현재/다른 세션, 만료/본인확인 시각, 개별/전체 다른 세션 종료, 기존 OAuth 본인확인 진입을 제공합니다.

## 출시 게이트

정확한 head SHA에서 전체 CI를 통과한 뒤 동일 SHA를 격리 Test에 배포해 현재 세션 보호, 개별/전체 종료, 본인확인 만료, 종료된 세션 접근 거부, backend/API health, 로그, rollback readiness를 확인하기 전에는 Production에 승격하지 않습니다.
