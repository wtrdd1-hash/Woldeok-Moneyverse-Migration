# QA — 문의 상태 요약 / HOLD

범위: 회원 전용 최근 최대 100건 상태 집계. 기존 #1923 상태 필터와 별도 기능.

증거:
- RED: Backend 4건, Frontend 2건 실패.
- GREEN: Backend 4/4, Frontend·Android 3/3.
- 격리 PostgreSQL 17.11: SQL 304/304 적용, 합성 문의 105건으로 소유자 격리·직접 테이블 조회 차단·100건 상한 PASS. 격리 migrator superuser는 테스트 소유권 우회용이며 운영 권한 동등성 증거가 아니다.
- Typecheck PASS, 재시도 Build PASS, 변경 ESLint 오류 0, DB 단위 56 PASS/4 SKIP.
- 전체 Lint FAIL(기존 오류 3건), 모바일 계약 FAIL(기존 NPC affinity, QA #1927), Backend 전체 2354 PASS/240 FAIL/493 SKIP. Frontend 전체 PASS 미확인.
- 보안: 직접 테이블 권한·금융 쓰기·클라이언트 사용자 ID 없음. 정수 건수 및 합계 검증, 웹·Android 캐시 금지와 noindex.
- 미검증: 정확 SHA CI, 공식 Test 인증 E2E, 전체 접근성·SEO E2E, 독립 백업 복원, 금융 릴리스 게이트.

전체 릴리스 게이트 전에는 병합·운영 승격 금지.
