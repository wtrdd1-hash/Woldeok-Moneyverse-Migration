# QA — 검증된 블로그 원문 주제 탐색 — 2026-11-01 10:25 KST

**판정: 초안 / 운영 승격 보류.** Test·Production 배포 및 main 병합 없음.

Nest·기존 PostgreSQL SECURITY DEFINER 공개 함수·Next 블로그·Android API에서 경제/코딩/컴퓨터 주제 필터를 추가했다. 검색 범위는 **최근 공개·검증된 원문 150건**이며 전체 보관 자료가 아니다. 중복·잘못된 주제·미지원 매개변수를 거부하고, Android는 무시된 필터·비정상 200·철회된 원문·관리자 경로를 차단한다. 원장/잔액/마이그레이션/직접 테이블 권한 변경 없음.

RED 후 GREEN 대상 시험: Backend 12건(HTTP 2건 포함), Frontend 34건. 전체 타입 검사 통과. 대상 Lint 형식 오류 1건 수정 후 통과. Backend 전체 2,960 PASS / 517 SKIP. 실제 개발 PostgreSQL 17.11 `moneyverse_app` 읽기 전용 검증에서 공개 함수 실행 허용·원본 테이블 직접 조회 거부, 공개 원문 3건 및 코딩 필터 1건 확인 후 ROLLBACK.

Frontend 전체 **2,912 PASS / 2 FAIL**(기존 관리자 세션 만료 테스트 #2292; 변경 없는 main에서 2 FAIL / 35 PASS 재현). DB 단위 62 PASS / 4 SKIP, 전체 Lint 0 오류 / 1,022 경고, Backend 빌드 PASS. Backend·Frontend 빌드 PASS(Next 정적 페이지 603개), 운영 의존성 보안 감사 알려진 취약점 0건. CI·공식 Test 정확 SHA 인증 E2E는 진행/차단 상태. 개발 DB의 `user_items DELETE=true`, `account_balances UPDATE=true`, `users SELECT=true`인 기존 최소 권한 P0 #993, 공식 Test 후보 SHA 불일치, 독립 복원 및 GitOps 게이트 미충족으로 운영 배포 금지. 미통합 브랜치 전부 보존.

시작 원격 브랜치 69개(main 포함), 미통합 고유 변경 보유 67개, 선조 1개 보존. 열린 PR 66개 중 CI 실패 포함 7개, main 기준 충돌 보고 0개. 병합·브랜치 삭제 없음.
