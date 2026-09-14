# 내부 작업 기록 — v2026.09.15.96

1. **v2026.09.15.96-01 — 기획/계약 재확인**
   - 상점·사업·직업·관리자 제어·배포 문서와 현재 main 구현을 재확인했습니다.
   - 기존 관리자 feature switch, HSTS/CSP, 모바일 BFF 계약을 우선 재사용하기로 결정했습니다.

2. **v2026.09.15.96-02 — 상점 검색**
   - `/shop/items`, `/shop/catalog`, `/shop/public-catalog`에 `q` 검색을 추가했습니다.
   - 웹 `/shop` 검색 입력을 동일 API 계약에 연결했습니다.

3. **v2026.09.15.96-03 — 사업 구매 목록 정리**
   - 보유 사업의 `businessTypeId`를 기준으로 이미 구매한 유형을 구매 카탈로그에서 서버가 제외합니다.

4. **v2026.09.15.96-04 — 관리자 직업 제한 실강제**
   - `work` feature switch를 기본 enabled로 신규 마이그레이션에 등록했습니다.
   - 신규 전직/작업/즉시 완료는 enabled에서만 허용하고, disabled에서는 진행 중 처리도 차단합니다.
   - paused/safe_mode에서는 신규 요청을 막되 기존 배정 작업의 제출/검증은 허용합니다.
   - 앱이 읽을 수 있도록 작업 목록 응답에 `featureState`를 추가하되 기존 profile 계약은 유지했습니다.

5. **v2026.09.15.96-05 — HTTPS 보강**
   - 기존 HSTS/CSP/secure-cookie 설정을 재확인했습니다.
   - 운영 공개 HTTP 요청을 canonical `APP_BASE_URL`의 HTTPS 주소로 308 전환하도록 기존 Next middleware를 보강했습니다.
   - Nest API는 외부 직접 노출 없이 loopback 내부 HTTP를 유지합니다.

6. **v2026.09.15.96-06 — 배포 게이트**
   - PR CI → main 병합 → 격리 Test exact-SHA/backend/database 검증 → Production 순서를 적용합니다.
   - 실제 성공 여부는 해당 단계 완료 후 이 기록의 후속 릴리스 상태에서 확인합니다.