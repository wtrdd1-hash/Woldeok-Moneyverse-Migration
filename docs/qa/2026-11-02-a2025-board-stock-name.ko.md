# QA — A2025 공개 게시판 종목명 검색 (2026-11-02, 배포 보류)

## 범위
- 시작·중간 기준 main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; 독립 브랜치 `auto/hourly-a-20261102-2025-board-stock-name`. 기능 SHA `c09db875f4aa33b15b4e4d1b53bed32aab2d63b3`, 린트 수정 SHA `b7385d0106183375dc1cc74392649994a0b79279`. 최종 문서 SHA는 PR #2526에 기록.
- 공개 게시글 최근 50건에서 연결된 **종목명 일부**를 대소문자 구분 없이 검색. 기존 종목코드·제목 검색과 조합. 파라미터 SQL, 검증 가능한 필터 적용 근거, 웹·Android 동일 검증. 미검증 200·빈 결과·HEAD는 차단.
- DB 마이그레이션·직접 권한·금융 원장·운영 환경 변경 없음.

## 실제 검증
- TDD RED 확인 후 대상 Backend 서비스/컨트롤러/HTTP **31건 PASS**, Frontend/Android **9건 PASS**.
- 전체 Backend **2,997 PASS / 2 FAIL / 518 SKIP**. 기존 프로필 인증 테스트 2건에서 200 대신 401, 전체 테스트 FAIL; 관련 복구 PR #2265.
- Frontend 전체 2,945건의 테스트 단언 PASS이나 Vitest 작업자 비정상 종료 1건으로 **전체 실행 FAIL**. 대상 회귀테스트는 PASS. 동시 작업자 수를 제한한 재실행 필요.
- Typecheck·빌드 PASS, Lint 오류 0/기존 경고 1,027, Android 계약 184개 PASS, DB 단위 62 PASS/5 SKIP, 계약 단위 41 PASS.
- 운영 의존성 취약점 0건, 전체 감사 **9건 FAIL**(낮음 1·보통 8).
- 개발 PostgreSQL 17.11의 `moneyverse_app` 읽기 전용 조회 PASS. 공개 글 1건, `제주` 종목명 일치 0건. 실제 다중 데이터 양성 검증은 제한적. 개발 DB의 `user_items` DELETE와 `account_balances` UPDATE 허용은 **P0**이며 운영 DB 권한은 미확인.
- 공식 Test SHA `abfbb8aee63393c9f58e72159bd5bcab06f99412`, Production SHA `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`: 후보 SHA 불일치. 양쪽 공개 Treasury가 HTTP 200을 반환하여 503 필수 배포 보류 조건 위반.
- 정확한 SHA의 Test 인증 E2E·독립 백업 복원·전체 보안/접근성/SEO·GitOps 릴리스 검증 **BLOCKED**.

## 보존 및 배포
- 시작 원격 참조 277개/미병합 258개/열린 PR 250개, 중간 278개/259개/251개(충돌 29개). 삭제 0개, 다른 개발의 고유 커밋 보존.
- **Draft PR #2526 / RELEASE HOLD**. main 병합·Test/Production 배포·서비스 재시작·운영 DB 변경 없음. 배포하지 않았으므로 롤백도 미실시.
