# v2026.11.19.29.1 — Spring 상태 API404 및 오래된 수집 기록 실제 복구

**2026-11-19 KST · 일부 실제 운영 승격 PASS, 전면 UI/API 보류.** [영문 정본](2026-11-19-spring-status-v2026.11.19.29.md) / [결과](../findings/2026-11-19-spring-status-real-api-v2026.11.19.29.ko.md).

- **원인/실패 재현:** 실제 HTTPS `/api/v1/status`404, 구 `/status` HTML200만 존재. 실제 PostgreSQL 공개 감시3개 최근 기록11월17일, 유효180초 지나 옛 정상→현재 확인 중이어야 함. Test 앱 역할 상태 테이블 SELECT 누락(운영은 기존 권한 정상). 정책4+통합2 TDD RED.
- **코드9626746a:** Spring MVC/Thymeleaf 신규 네이비/보라 EN/KO `/status` + 진짜 DB 기반 `/api/v1/status`,`/api/status` status-v1, 공개+활성만 최신 기록 조회, 오래됨/없음→UNKNOWN, 비공개·내부detail 숨김, DB장애503, RSC406/POST405. Test DB에서만 두 테이블 읽기 권한 부여, 운영 DB 권한/원장 미변경. 전체 Java **232/232 통과, 60스위트**, JAR SHA `2c92302aca1ce5001132baef69b3c6b7ba382897f36c1b9d183fd76916e98f3c`.
- **실운영:** Test readonly4655/운영readonly4656, Nginx Test4454 브라우저7/7, 운영 Nginx 이전 SHA확인/설정 비공개 백업/`nginx -t`·무중단 reload. 메인306b4aa 그대로, 스니펫0cefe07e→06059c2e, 구 Spring4550 PID368434 보존. 외부 HTTPS39/39·실브라우저7/7, 임시 Test 회원조회200/위조403·삭제PASS. OpenAPI903, 비로그인 API459건 200160/401271/50328, 예상밖500·502·5040.
- **미완료:** 실제 수집기 11월17일 이후 갱신 안 됨, API503 28, 새 Spring UI 검증 미완료176경로·전 관리자/회원·실채팅·금융 정산·외부 Test403·전면 원복훈련. 전체 서비스 완료로 표기 금지, Draft 유지.
