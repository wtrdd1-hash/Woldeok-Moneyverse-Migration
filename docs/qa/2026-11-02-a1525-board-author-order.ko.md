# 개발 A QA — 공개 게시판 작성자 이름순 (2026-11-02 15:25 KST)

**판정: DRAFT / RELEASE HOLD.** 병합 또는 운영 배포 승인 아님. 기준 main `a8541927c3a351d980454c66e95a3356c47e0722`, 독립 브랜치 `auto/hourly-a-20261102-1525-board-author-order`.

- 기존 PostgreSQL `member_board_public_list_with_stock(50)`의 최근 공개 글 50건에 한해 `sort=author` 적용. `author_name COLLATE "C" ASC, post_id ASC` 정렬. 기존 종목·제목 검색과 기본 최신순, 기존 서비스 호출 인수 2개 유지. 한국어 가나다순이 아닌 UTF-8 바이트 순서임을 화면에 명시.
- Next `/board` GET 정렬 버튼(키보드 접근 가능), 빈 결과까지 `sortApplied:author` 검증, 정렬 페이지 noindex/캐시 비활성화. Android App API는 중복·잘못된 sort를 400, 증거 없는 200/중복 UUID/순서 오류를 503으로 거부하고 no-store/noindex/no-referrer 적용. 생성형 Android 계약 문서 갱신.
- 마이그레이션·테이블 권한·원장·금융·계정·세션·운영 DB 변경 없음.
- TDD 최초 Backend 3건 실패, Frontend 3개 파일 실패 후 구현. 수정 뒤 Backend 대상 18건, Frontend 대상 8건, SSR 통합 3건 PASS.
- 첫 전체 Backend 2,980 PASS / 3 FAIL / 518 SKIP. 새 호출 인수 호환성 실패 1건은 수정·대상 재검증 PASS. 기존 프로필 인증 HTTP 401 대 200 실패 2건(#2265)은 남음. 전체 Backend PASS 주장 금지.
- 첫 전체 Frontend 2,929 PASS. DB 62 PASS/5 SKIP, 계약 41 PASS, 타입검사 PASS, Lint 오류 0(기존 경고). Backend/Frontend 빌드 PASS(602개 페이지), Lint 오류 0/기존 경고 1,027, 타입검사 PASS, 보안·백업·릴리스 정책 테스트 20 PASS. 운영 의존성 감사 알려진 취약점 0건/PASS, 전체 의존성 감사 9건(낮음 1/보통 8)/FAIL. 전체 경로 QA는 `artifacts/qa/full-route-ledger.json` 부재로 BLOCKED.
- 개발 PostgreSQL 17.11에서 `moneyverse_app` READ ONLY/ROLLBACK, 공개 함수 실행권한/정렬 EXPLAIN·SQL/합성 3건 PASS. 실제 공개 글 1건. 기존 P0 직접 UPDATE(account_balances), DELETE(user_items) 허용 확인. 운영 DB 권한 미확인.
- 공식 Test 후보 SHA 인증 E2E·독립 백업 복원·GitOps 릴리스 게이트 미충족. 병합·배포·재시작·롤백 없음.
- 시작 원격 브랜치 235개(main 포함), 열린 PR 217개, 충돌 PR 29개. 중간 PR 동일, main 불변. 삭제 0개, 고유 미통합 변경 전부 보존.

증거: `/srv/moneyverse-data/tasks/mv-a-20261102-1525-board-author-order/evidence/`. 롤백: 배포 시 선택 정렬을 비활성화하거나 검토된 역배포, DB/원장 불변.
