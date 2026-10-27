# 개발 A — 관리자 문의 최근 제목 검색 (2026-10-28 08:25 KST)

- 기준 main: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`; 별도 브랜치 `auto/hourly-a-support-recent-search-20261028-0825`.
- 기능: 로그인 회원의 **최근 100건 문의** 제목에서 대소문자 무시·문자 그대로 부분 검색. 검색하지 않으면 기존 최근 50건 유지. 전체 기록 검색으로 오해하지 않도록 화면에 범위를 표시함.
- Backend: 기존 회원별 PostgreSQL `SECURITY DEFINER` 조회 함수 사용, SQL 바인딩과 `strpos`, 검색어 80자 제한, 잘못된 입력 400, 캐시 금지.
- Frontend: GET 검색, 검색어 링크 유지, 결과 없는 경우 안내, 검색 결과 외 스레드 자동 선택 방지, 검색 라벨·비공개 SEO 유지.
- Android app-api: 동일 쿼리 전달, 상위 응답이 공개 캐시를 허용해도 `private, no-store` 적용.
- TDD: 수정 전 Backend 2개/Frontend 3개 실패 → 수정 후 Backend 집중 3 PASS, Frontend 집중 19 PASS. 전체 Backend 1,691 PASS/430 SKIP, Frontend 1,684 PASS, Bot 8 PASS.
- 격리 PostgreSQL 17.11: 최근 100건 제한·특수문자 검색·오래된 기록 제외·회원별 반환·앱 역할의 원본 테이블 직접 SELECT 거부 PASS. 운영 DB와 동일한 전체 스키마 검증은 아님.
- 차단: 전체 ESLint 오류 2건, 마이그레이션 283 중복/285 누락, Turbopack SIGABRT, Bot 감사 Critical 1/High 5, 공식 Test 실행 SHA 불일치 및 손상된 릴리스 링크. 기존 DB 함수의 actor 신원 결합 위험(#993)도 미해결.
- 통합·운영배포·운영 DB·원장 변경·브랜치 삭제 없음. 최종 상태 **PARTIAL / BLOCKED — Production RELEASE HOLD**.
