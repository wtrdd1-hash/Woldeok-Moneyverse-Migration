# 개발 A v2026.10.23.2325 — P2P 수취인 검색 개인정보 보호 (DRAFT / HOLD)

- Debian 13.6 미니PC·서비스·개발 PostgreSQL 정상 확인. 최신 main `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` 기준 새 독립 Worktree/브랜치에서만 수정. 타 개발자 브랜치·Worktree 보존.
- **실제 문제:** 기존 수취인 검색의 SQL `ILIKE '%검색어%'`가 `%_`를 문자 그대로 처리하지 않아 개발 DB의 활성 프로필 8개가 매칭됨. 개선 후 `%_`를 리터럴로 이스케이프하면 0개. 사용자 정보 자체는 출력하지 않음.
- **구현:** Nest repository의 2~40 유니코드 코드포인트 입력 제한, SQL LIKE 특수문자 이스케이프, 사용자 UUID 바인딩, 활성 사용자/자기 자신 제외, 최대 10개 정렬; Next BFF와 Nest 응답에 `private, no-store`; Android app-api 기존 인증 쿠키 전달/응답 헤더 전달 테스트.
- **TDD:** Backend RED 3건, BFF RED 3건, Nest HTTP RED 1건 확인 후 GREEN. 집중 Backend 5 PASS, Frontend 4 PASS. 전체 DB 패키지 15 PASS/3 SKIP, Backend 1,318 PASS/398 SKIP, Frontend 1,388 PASS. Typecheck·Build·변경 파일 ESLint·diff check PASS.
- **차단:** 전체 Lint는 기존 CSV `no-control-regex` 오류로 FAIL(QA PR #1021), 보안 의존성 감사 FAIL(Next 16.3.8 Critical 2/High 1). 개발 DB 원장 877건/Posting 1,784건, 불균형 0건, Posting 부족 0건. 앱 계정 241개 중 235개 테이블 직접 INSERT/UPDATE 가능(P0).
- **보존:** 시작 원격 브랜치 11개(main 포함), 열린 PR 10개. 모든 비-main 원격 브랜치에 고유 미통합 변경 존재, 삭제 0건. 최신 main·영문 원본 계획·한국어 2차 문서·QA/PR/CI 검토.
- **Release:** 공식 Test 정확한 SHA·인증 E2E·실제 앱 권한 거부 테스트·GitOps·백업/복원 미검증. main 병합 0, Test/Production 승격 0, DB 변경 0, 운영 롤백 불필요. **Production RELEASE HOLD.**
