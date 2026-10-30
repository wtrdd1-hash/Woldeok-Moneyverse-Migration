# 개발 A — 회원 문의 상태 요약 (2026-10-30 02:25 KST)

- 범위: P1 회원 기능 개선. 본인의 최근 최대 100건 문의에 대해 관리자 답변 대기, 내 답변 대기, 처리 완료 건수를 표시한다. 전체 누적 건수라고 주장하지 않으며 100건 도달 시 불완전할 수 있음을 명시한다.
- 기준 main: 62c6cd038951d65c94b709302bdaec6e75b080b6. 별도 브랜치 auto/hourly-a-support-summary-20261030-0225 및 독립 worktree. 기존 QA v1377 FAILED/P0, Draft PR 확인. #1923의 상태 필터 변경과 달리 별도 요약 API를 추가하며 기존 필터 동작은 변경하지 않았다.
- 경로: 기존 PostgreSQL 소유자 검증 함수 support_my_threads(actor,100) -> 건수·합계 검증을 수행하는 저장소 -> 인증·동의 가드가 있는 NestJS GET support/threads/summary -> Next.js 회원 화면 -> Android app-api 검증 및 no-store/noindex. 새 마이그레이션, 직접 테이블 권한, 원장 변경 없음.
- TDD: 최초 Backend 4건 및 Frontend 2건 실패 재현, 수정 후 Backend 4건과 Frontend 3건 통과. 격리 PostgreSQL 17.11에 SQL 304개 적용 성공. 합성 문의 105건으로 회원 격리, 100건 상한, 앱 계정의 직접 테이블 SELECT 차단 검증. 테스트 환경의 확장 함수 소유권 문제 때문에 격리 migrator를 임시 superuser로 구성했으므로 운영 migrator 권한 동등성까지 검증된 것은 아니다.
- 검증: Typecheck PASS, 두 번째 Build PASS(최초 추적 단계 시간 초과), 변경 파일 ESLint 오류 0, DB 단위 56 PASS/4 SKIP. 전체 Lint 오류 3건, 기존 NPC 모바일 계약 불일치(QA #1927), Backend 전체 2354 PASS/240 FAIL/493 SKIP. 공식 Test 정확 SHA 인증 E2E와 독립 백업 복원은 미완료.
- 배포: Draft/HOLD. main 병합·Test/Production 배포·운영 DB 변경·브랜치 삭제·롤백 없음.
- 브랜치 감사: 시작 24개, 열린 PR 18개. 중간 24개, PR 18개. main 미포함 고유 커밋 브랜치 20개, main 포함 3개, 충돌 PR #1901/#1892, SHA 불일치 및 중복 0. 과거 참조 복구 사고 때문에 삭제하지 않았다.
- 증거: /srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-0225-support-summary/. 최종 SHA와 CI는 PR에 별도 기록한다.
