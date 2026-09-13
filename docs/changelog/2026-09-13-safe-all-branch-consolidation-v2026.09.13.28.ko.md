# v2026.09.13.28 — 전체 브랜치 안전 통합

## 요약

현재 `main`을 기준으로 저장소의 활성·과거 브랜치에 남아 있는 유효한 런타임과 문서를 통합하되, 오래된 브랜치 이력을 무조건 재생하지 않는 방식으로 최종 후보를 구성했습니다.

- 기준 `main`: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`
- 최종 후보: `integrate/final-safe-all-v2026.09.13.28`
- 최종 브랜치 생성 직전 59개 ref를 확인했고, 이 후보가 60번째 보이는 ref가 됐습니다.
- 이번 통합으로 `main`과 Production은 변경하지 않았습니다.

## 통합된 런타임

- 계정 보안 센터와 세션 조회·폐기 백엔드/UI
- 관리자 입력 상태 보존
- Business Settlement Boost 런타임·멱등성 보정
- 신뢰 클라이언트 IP 강화
- 주식 태그 커뮤니티·탐색
- 가상 은행 안전 UI와 마켓플레이스 워크벤치
- 로컬 이메일 인증 메일 SMTP 전송과 `/verify-email` 흐름
- 조건부 가상 주식 알림, 개인 대시보드, 포트폴리오 분석
- Economy Scenario Lab
- Event Calendar 및 내비게이션 병합

## 통합된 문서

- Casino Game System 기획서
- AI Economy Controller 기획서: 영어 기준, 한국어 동등 문서
- Event Calendar 및 Economy Scenario Lab 변경내역·작업기록
- 현재 `main`의 Living Project Plan과 최신 문서 기준을 권위 있는 기준으로 유지했고, 오래된 기획 브랜치가 이를 덮지 않도록 했습니다.

## DB migration 정리

최종 후보는 다음 하나의 연속된 순서를 유지합니다.

- `179-business-settlement-v2-boost-runtime-fix.sql`
- `180-local-email-auth.sql`
- `181-stock-tagged-community.sql`
- `182-conditional-stock-alerts.sql`

동시에 생성된 `integrate/final-all-v2026.09.13.27`은 `179-local-email-auth.sql`과 `180-local-email-auth.sql`에 동일한 로컬 인증 SQL을 동시에 포함하고 있어 전체 병합하지 않았습니다. 이를 그대로 재생하면 migration 번호·내용 중복이 다시 생깁니다.

## 브랜치 처리 원칙

상위 통합 브랜치에 이미 포함된 하위 stacked 브랜치는 개별 재병합하지 않고 포함/대체된 것으로 분류했습니다. 현재 기준과 크게 분기됐고 예전 `163-local-email-auth.sql` 구조 등 오래된 migration 상태를 가진 인증·문서 브랜치는 기록용으로 보존하되 현재 저장소를 되돌리는 방식으로 병합하지 않았습니다.

## 검증·배포 게이트

최종 후보의 정확한 SHA로 GitHub CI가 통과해야 합니다. 그 다음 동일 SHA를 격리 Test에 배포하고 백엔드·DB·API·UI smoke 검증을 통과한 뒤에만 `main` 병합 또는 Production 승격이 가능합니다. 현재 승인된 `@미니pc홍` 원격 장비가 오프라인이므로 exact-SHA Test 런타임 검증 성공은 아직 주장하지 않습니다.
