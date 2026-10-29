# QA A1225 — 상점 비교 복구 / FAILED-HOLD

main `a28bed9aa40ff74d492824ae12892a7d52132fdd`; 코드 `e6c4782d27ddf9fbf9e7dda7e34d27bcc26cc20f`.

- Backend 전체 1,933 PASS/441 SKIP, Frontend 전체 1,870 PASS/1 FAIL(기존 블로그), DB 45 PASS/3 SKIP, Bot 11 PASS.
- 타입 검사, 린트 오류 0(경고 1,102), Backend·Next 빌드, Android API 계약 181개 PASS.
- 격리 PostgreSQL 17.11에서 Migration 123 실제 조회 함수 본문·저장소 SQL·회원별 수량·대형 정수·테이블 SELECT 차단 PASS. 합성 스키마이며 전체 운영 DB 인증은 아님.
- 의존성 보안 감사 root High/Critical 0, Moderate 1; Bot 0. 전체 프로젝트 테스트는 main과 동일한 관리자 블로그 테스트 1건 실패.
- 공식 Test 정확 SHA 인증 E2E, 전체 DB ACL, 백업 복원, 접근성·SEO 종합검증 및 GitOps 운영 게이트 미충족. PR #1677 중복 파일 및 P0 복구 참조 352개 보호. 병합·배포 금지.
- 증거 `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-28-1225/`.
