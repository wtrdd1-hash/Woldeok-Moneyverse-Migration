# 개발 A — 상점 재고 필터 QA (2026-11-01 04:25 KST)

**판정: P1 코드 구현·로컬 검증 완료 / 운영 배포 보류.** [영어 원본](2026-11-01-a0425-shop-stock-availability.md).

- 시작·중간·통합 전 main SHA: `f13bbce273ffc65e8576170992d82ea00c27a1c9`. 새 독립 브랜치·worktree에서만 작업. AGENTS, README, 영문·국문 프로젝트 계획 및 통합기획, QA·개발 기록, PR·CI·릴리스 정책 확인.
- 기존 문제: 웹이 `stock=available`을 전송해도 Nest가 해당 쿼리를 바인딩하지 않아 품절 상품이 포함될 수 있었음. 회원·공개 API에서 정확한 파라미터를 검증하고, PostgreSQL의 기존 `shop_catalog_list_v2(actor)` 결과에 적용. 재고 0 제외, NULL(무제한) 유지. 웹 체크박스·검색 상태 유지, Android/웹의 미검증 200 응답 차단, 회원 API 비공개 헤더 강화.
- TDD RED(Backend 3, Frontend 4, 보관함 링크 1, 웹 구버전 응답 1 실패) 후 GREEN. 전체 `pnpm test` 종료코드 0: 계약 41 PASS, DB 단위 62 PASS/4 SKIP, Backend 2,953 PASS/517 SKIP, Frontend 2,908 PASS. Typecheck·Build PASS, Lint 오류 0/기존 경고 1,022, 운영 의존성 감사 알려진 취약점 0. SKIP은 PASS가 아님.
- 실제 PostgreSQL 17.11에서 `moneyverse_app` 역할로 읽기 전용 함수 실행: 146건 중 무제한 143, 유한 양수 3, 품절 0. 가상 회원도 146건. ROLLBACK; 원장·상품·권한 변경 없음. 품절 실데이터 부재로 해당 음성 사례는 단위 회귀테스트로 확인.
- **P0 개발 DB 권한 위반:** 앱 역할에 `shop_catalog` 직접 SELECT/UPDATE, `account_balances` 직접 UPDATE 존재. 운영 DB 동일 여부는 미확인.
- 시작 원격 브랜치 32개, 마지막 확인 35개; 열린 PR 32개. 원격 비-main 추적 35개 중 34개 미병합, 1개 main 선조. 소유권·대체 검증 없이 전부 보존. 브랜치 삭제·main 병합 0.
- 공식 Test 버전 `bc8cd8a6…`, Production Backend `353c6d5d…`, Frontend 빌드 ID `1793450413898`: 후보 SHA와 다름. 정확 SHA 인증 E2E, 독립 백업 복원, 운영 실행 파일 출처 증명 미완료. **Test/Production 배포·재시작·운영 DB 변경·롤백 0.**
- 향후 승격 시 기존 불변 릴리스 보존, GitOps/릴리스 게이트, 로그인 세션 지속성·DB/버전·smoke 검증 필수. 이번 회차 실행하지 않음.
