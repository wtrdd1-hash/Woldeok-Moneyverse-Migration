# A1457 QA / 릴리스 판정 — PARTIAL / BLOCKED

회원 지갑 거래내역 50건 초과 조회를 소유자·세션·기간 결합 HMAC 커서, 절대 기간 및 (시간, 거래 ID) 키셋 정렬로 구현. 웹과 Android app-api를 연결했으나 PR #1703은 Draft/HOLD이며 운영 기능이 활성화된 것은 아님.

코드 SHA `9fb1fdf8a7167e7fed84f70098826a095a856b8b`, 최신 main `9ff388ab608af99b9ccc806c35ebac5c14bd15e9`. Backend 1,939 PASS/441 SKIP, Frontend 1,870 PASS, DB 45 PASS/3 SKIP, Bot 11 PASS, 격리 PostgreSQL 17 PASS, 전체 테스트 PASS, Lint 오류 0건(경고 1,095건), 타입 검사·백엔드·웹 빌드·모바일 API 계약 180개 PASS. 보안 감사 High/Critical 0건. 최초 Bot 실패와 Next 빌드 시간 초과는 의존성 설치·자원 경합 해소 후 재실행하여 PASS.

시작 원격 브랜치(main 포함) 36개/열린 PR 34개, 종료 39개/36개, 충돌 2개, 실패 체크 PR 17개, 중복 HEAD 0개. 사고 복구 참조 352개 모두 유효하며 삭제 브랜치 0개. 다른 작업자의 미통합 변경 보호.

공식 Test 릴리스 링크는 복구됐으나 실행 SHA `4688e84be0f8`로 신규 후보와 불일치. 후보 SHA 기반 인증 E2E, 실제 운영 권한·마이그레이션 체크섬 검증, 독립 백업 복원, GitOps 승격 증거가 없어 main 병합·Test/Production 배포·운영 DB 및 금융 원장 변경·롤백 모두 금지. **Production RELEASE HOLD**.
