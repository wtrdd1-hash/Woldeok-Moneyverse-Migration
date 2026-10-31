# 개발 A 05:25 서비스 상태 필터 — QA (진행 중)

- 영문 정본: `2026-11-01-a0525-public-status-attention.md`.
- 신규 Backend 2개, Frontend 4개 테스트 RED→GREEN 확인. 대상 Frontend 27개 통과.
- 실제 개발 PostgreSQL 17.11 앱 역할 읽기 전용 함수 3행 조회 및 ROLLBACK. 장애 시나리오 데이터는 없음.
- 타입 검사 통과, Lint 오류 0/기존 경고 1,022. 전체 CI·공식 Test 인증 E2E 미완료. **운영 보류.**

## 최종 로컬 근거 및 차단
- Frontend 전체 2,907 PASS, Backend 대상 6 + HTTP 2 PASS, DB 단위 62 PASS/4 SKIP, 공통 계약 41 PASS.
- Backend 전체 2,950 PASS/517 SKIP/2 FAIL(순수 main 동일). 복구 PR #2265의 Backend 전체 2,950 PASS/517 SKIP. 임시 결합 재검증은 Vitest 워커 EPIPE로 중단.
- 개발 DB 앱 역할 상태 원천 테이블 직접 SELECT/UPDATE 허용, 최소 권한 P0 FAIL(#993). 실제 함수 읽기 전용 3행 확인 및 ROLLBACK.
- 공식 Test 정확 SHA 인증 E2E·독립 복원·운영 출처·최종 CI 미충족. **병합 및 운영 배포 금지.**
