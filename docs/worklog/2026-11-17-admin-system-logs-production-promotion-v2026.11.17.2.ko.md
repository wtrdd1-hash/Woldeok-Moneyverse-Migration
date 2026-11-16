# v2026.11.17.2 — 관리자 서버 로그 운영 승격 시도

**작업 전 (2026-11-17 KST):** 사용자 운영 승격 승인 확인. PR #3205 후보 `b6d013e`, 최신 `main` `86777fb2d5a1f8bbc680453368c0a5f04b5c7715` 재확인. `AGENTS.md`, 통합 기획문서, Spring 관측성/출시 가이드 및 실제 미니PC Nginx/systemd 점검. 제미나이·다른 개발자의 워크트리는 수정하지 않음.

**필수 순서:** 후보 CI 통과 → 동일 SHA 독립 Test 및 실제 데이터베이스 경계 검증 → 최고관리자 브라우저/HTTP 기능 검증 → 세션/롤백·금융·백업 준비 → 운영 무중단 승격 → 실제 운영 검증.

**작업 전 실제 확인:** 운영 및 공식 Test `/admin/logs/system` HTTP 404, 공식 Test 백엔드 서비스 `test-main-backend.service`는 비활성·비활성화 상태, Test의 `/health`·`/api/version`는 운영 Spring 4550으로 프록시되어 독립적인 테스트 검증 불가. Test 인증 및 로그 API는 HTTP 502. 공식 Test SHA `cfc178ab...`로 후보와 다름. exact-SHA 검증 스크립트 FAIL. 기존 호스트 배포 스크립트는 후보에 없는 Nest 산출물을 요구하고 빌드한 Next BUILD_ID도 커밋 SHA가 아님. PR CI 일부 진행 중.

**작업 중:** 안전한 복구 가능 여부 점검 중. 운영 서비스 재시작, Nginx 운영 경로 변경, DB·재무 데이터 변경 없음.

**종료:** 결과 기록 예정.
