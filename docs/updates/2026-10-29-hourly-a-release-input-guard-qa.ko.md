# QA — P0 문서 실행 파일 릴리스 분류 차단 (2026-10-29)

- 기준 main `54b182d2214a15974350701174175f589789613b`; 분리 브랜치 `auto/hourly-a-release-input-20261029-2248`.
- 수정 전 RED: 문서 확장자·실행 권한·심볼릭 링크 3건이 잘못 `DOCS_ONLY` 판정.
- 수정 후 릴리스 회귀 94 PASS, 보안 17 PASS, 변경 파일 ESLint PASS, Typecheck PASS, Backend·Frontend Build PASS(힙 1536MiB).
- 전체 Lint FAIL(기존 오류 3건), 전체 Test FAIL(모바일 API 계약 불일치), Backend 240 FAIL, Frontend 제한시간 초과 및 일부 실패, 공식 Test 인증 E2E·금융/DB 검증 BLOCKED.
- DB 단위 56 PASS/4 SKIP. SQL 변경·실 DB 마이그레이션 없음. Test·Production은 기존 SHA 유지. 일부 테스트 통과를 통합·운영 승인으로 해석하지 않음.
