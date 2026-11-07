# 개발 A 01:55 — 최근 공개 게시판 미답변 글 QA (2026-11-02)

**상태:** Draft / RELEASE HOLD. 영문 문서 원본의 한국어 대응본.

- 기준 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, 독립 브랜치 `auto/hourly-a-20261102-0155-board-unanswered`.
- 기존 PostgreSQL `SECURITY DEFINER` 공개 조회 함수의 최근 최대 50건 결과에서 댓글 0개만 필터링. 제목/종목 검색과 조합. 신규 DB 마이그레이션, 금융 원장 및 권한 변경 없음.
- 웹: 라벨 있는 GET 체크박스, 범위 표시, 검색 결과 noindex 및 no-store, 오류와 실제 빈 결과 구분.
- Android API: `unanswered=1`만 허용, 중복/미지원 조건 거부, 백엔드 적용 증명과 댓글 수·UUID 검증 실패 시 503.
- TDD RED Backend 3건/Frontend 8건, GREEN Backend 대상 22 PASS/Frontend·Android 15 PASS. 전체 타입검사와 변경 파일 ESLint PASS.
- 실제 개발 PostgreSQL 17.11 앱 역할 READ ONLY: 함수 실행 가능, 공개 1건 중 미답변 1건, ROLLBACK. 복수 실제 데이터의 정렬/필터 검증은 미완료.
- 루트 전체 테스트 첫 실행은 생성된 API 계약 미커밋으로 FAIL. 계약 문서 커밋 후 재실행 **PASS**: 사전검사 34, 계약 41, DB 62 PASS/5 SKIP, Backend 2,987 PASS/518 SKIP, Frontend 2,937 PASS.
- 전체 빌드 PASS, 타입검사 PASS, 전체 Lint 오류 0/기존 경고 1,027. 모바일 API 계약 184개 엔드포인트 재생성/드리프트 검사 PASS.
- 운영 의존성 보안 감사 알려진 취약점 0건, 전체 개발 의존성 감사 **9건(낮음 1/보통 8) FAIL**.
- 개발 DB 최소 권한 **P0 FAIL**: `account_balances.UPDATE`, `user_items.DELETE`, `users.SELECT` 앱 역할 허용. 공개 보안 함수 소유자는 `postgres`로 정책상 `moneyverse_migrator`와 다름. 운영 DB 동일 여부 미확인.
- Draft #2399 가상 병합 충돌 9개 파일, #2407 충돌 6개 파일. 고유 변경 보존, 강제 병합 금지.
- 공식 Test 백엔드·프론트엔드 `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, 운영 Backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, Frontend `1793450413898`. 후보 SHA 불일치.
- 최종 문서 포함 SHA CI 및 공식 Test 인증 E2E/독립 복원/실제 브라우저 접근성·SEO 검증 미완료. 기존 P0 권한 문제와 PR 충돌 존재. 병합/배포 금지.
