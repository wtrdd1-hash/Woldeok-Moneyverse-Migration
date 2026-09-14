# v2026.09.14.74 — 운영 승격 게이트 API 경로 수정

## 요약
- 운영 릴리스 Test 게이트가 실제 BFF 경로인 `/app-api/v1/shop/public-catalog`를 검사하도록 수정했습니다.
- exact-SHA, 백엔드/DB, `noindex` 실패 시 차단하는 기존 fail-closed 정책은 유지합니다.

## 검증
- 격리 Test에서 `/app-api/v1/shop/public-catalog`가 HTTP 200과 비어 있지 않은 `catalogItems`를 반환함을 확인했습니다.
- 기존 `/app-api/shop/public-catalog` 경로는 프론트엔드 HTTP 404를 반환해 운영 승격을 잘못 차단했습니다.
