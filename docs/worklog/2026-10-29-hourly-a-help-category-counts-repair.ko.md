# 2026-10-29 — 개발 A: 검증된 도움말 분야별 문서 수 연결 복구 (Draft/HOLD)

- 기준 main `69c486777d023ee45a216528e7a0c8b7dd1d7ea7`, 새 분리 브랜치 `auto/hourly-a-help-category-contract-repair-20261029-2025`. 기존 A/B/C/QA/Gemini 작업과 예약을 변경하지 않음.
- 원인: SQL·Repository·웹·Android 경로는 통합됐지만 NestJS `help/categories`가 실제 분야별 수와 요청 언어를 반환하지 않아 웹에서 문서 수 확인 불가. Android 응답은 잘못된 상위 캐시 정책을 물려받을 수 있었음.
- 수정: 기존 `SECURITY DEFINER` SQL만 호출하여 ko/en별 실제 승인·게시·유효 문서 수를 정수 **문자열**로 반환. 기본 언어 ko 호환, 잘못된 언어 400, 불완전/잘못된 DB 결과 503, Android 도움말 응답 `no-store`. 금융·인증·원장·적용된 SQL 파일 불변.
- RED→GREEN: 신규 Backend 4개 및 Android 1개 실패 재현, 대상 Backend/HTTP 9 PASS, Frontend/Android 42 PASS, 변경 파일 ESLint PASS. 격리 PostgreSQL 17.11에서 별도 #1885의 303개 유일번호 SQL을 적용하고 현재 main과 동일한 도움말 SQL SHA 확인, 승인·만료·초안·언어·권한·ROLLBACK PASS. 공식 Test가 아님.
- 전체 검증 미통과: Lint 2건, Backend Typecheck 5건, Frontend TS 구문 오류, Build 실패, 모바일 API 문서 불일치, Backend 243 FAIL, Frontend 53 FAIL, Database 번호 중복 1 FAIL. 보안 운영 의존성 알려진 취약점 0건, app-api 40 PASS, 접근성/SEO 도움말 10 PASS.
- 감사: 원격 브랜치 88개(main 포함), 열린 Draft PR 21개, main 포함 조상 77개, 고유 커밋 보유 10개, PR SHA 불일치·중복 0개. 과거 대량 삭제 사고 보호를 위해 삭제 0건.
- 운영: main 병합·Test/Production 배포·운영 DB 변경·롤백 없음. 공식 Test 정확 SHA 인증 E2E와 CI/GitOps가 통과하기 전까지 HOLD. 롤백 방안은 도움말 기능 플래그 OFF 유지 및 후보 커밋 되돌리기.
