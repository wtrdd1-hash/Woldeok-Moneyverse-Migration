# 계정 보안 센터

상태: 런타임 후보 `v2026.09.13.5`.

로그인한 회원이 활성 세션을 확인하고 더 이상 사용하지 않는 다른 세션을 종료할 수 있습니다. 첫 구현은 기존 `auth_sessions`를 그대로 권위 있는 데이터로 사용하며 새 DB migration을 추가하지 않습니다.

## 조회 정보

`GET /api/v1/account/security/sessions`는 회원이 확인하는 데 필요한 최소 정보만 반환합니다. 세션 식별자, 생성/만료 시각, 최근 본인확인 시각, 현재 세션 여부, 관리자 콘솔 사용 세션 여부입니다.

세션 토큰·토큰 해시·CSRF 값/해시·OAuth subject·네트워크 주소·전체 요청 메타데이터는 반환하지 않습니다.

## 세션 종료

- `DELETE /api/v1/account/security/sessions/{id}`: 본인 소유의 다른 활성 세션 하나 종료
- `POST /api/v1/account/security/sessions/revoke-others`: 현재 세션을 제외한 본인 소유 활성 세션 전체 종료
- 현재 세션은 SQL 조건에서 제외되어 이 기능으로 종료할 수 없습니다.
- 종료 작업에는 기존 세션, 최신 동의, CSRF 검증, 최근 본인확인이 모두 필요합니다.

## 프론트엔드

`/account/security`는 인증이 필요한 동적 `noindex` 화면입니다. 활성 세션 시각, 현재 세션 표시, 개별/전체 다른 세션 종료 기능, 기존 OAuth 본인확인 진입 기능을 제공합니다.

## 출시 게이트

저장소 CI와 exact-SHA 격리 Test 검증을 통과하기 전에는 main 통합 또는 Production 승격을 하지 않습니다. Test에서는 현재 세션 보호, 다른 세션 종료, 전체 다른 세션 종료, 재인증 만료, 종료된 세션의 접근 거부를 확인해야 합니다.

## 최근 보안 활동 유형 필터 (P1 후보, 출시 보류)

본인 전용 `GET /api/v1/account/security/events`에 선택적 `category=all|login|settings`(기본 `all`)를 추가했습니다. 기존 `account_recent_security_events(본인,20)` SECURITY DEFINER 함수로 본인 소유 최근 20건을 조회한 **다음** 유형을 필터링합니다. 전체 기간 검색이 아닙니다. `login`은 로컬 로그인 성공, `settings`는 비밀번호·로그인 이메일 변경/요청 유형이며 기타·새로운 유형은 `all`에서만 확인할 수 있습니다. 잘못된 값·중복 값·문자열이 아닌 값은 400으로 거부합니다. IP·토큰·감사 원본 메타데이터는 반환하지 않으며 새 SQL 마이그레이션이나 앱 역할 권한 추가도 없습니다.

`/account/security?category=login|settings`는 키보드로 조작 가능한 필터와 선택 상태, 잘못된 값·조회 실패 구분을 제공합니다. 기존 CSV는 선택한 필터와 무관하게 **전체 최근 20건**을 내보낸다고 명시합니다. Android `/app-api/v1/account/security/events`는 본인 세션과 필터를 전달하고 비정상/불일치 200 응답을 거부하며 `private, no-store`, `noindex`를 강제합니다. 아직 미병합 후보이므로 공식 Test·Production 제공 여부는 검증되지 않았습니다.
