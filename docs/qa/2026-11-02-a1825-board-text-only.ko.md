# 2026-11-02 18:25 개발 A — 공개 게시판 사진 없는 글 필터 QA (배포 보류)

영문 정본: `docs/qa/2026-11-02-a1825-board-text-only.md`. 기준 main `a8541927c3a351d980454c66e95a3356c47e0722`에서 시작, SOE v1621 병합 후 `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`로 독립 브랜치를 재기반화했습니다. Draft PR #2499.

웹 `/board`에서 사진 없는 글만 선택하고 기존 제목·종목 검색과 결합합니다. PostgreSQL의 기존 공개 조회 함수에서 **최근 50건**만 가져온 뒤 이미지 키가 없는 글을 선택합니다. Nest는 `media=text`만 허용하고 검증된 빈 결과에도 `filterApplied:'text'`를 반환합니다. Android App API는 필터 표시·UUID 중복·이미지 부재를 검증하며 불명확한 HTTP 200, 302/304를 503으로 거부합니다. HEAD는 본문 없는 405, 필터 응답은 no-store/noindex/no-referrer입니다. 신규 마이그레이션, DB 권한 추가, 금융 쓰기 없음.

TDD RED(Backend 신규 3건, Frontend 신규 8건, DB 결과 위조 1건)를 재현하고 수정했습니다. 대상 Backend 26건(실제 HTTP 3건 포함), Frontend 22건 PASS, Typecheck 및 변경 파일 ESLint PASS. 개발 PostgreSQL 17.11 읽기 전용 쿼리와 함수 실행 권한 PASS. 실제 공개 글 1건 중 사진 없는 글 0건, 합성 데이터 3건 중 2건 검증. 공식 Test의 후보 SHA 인증 E2E는 아닙니다.

전체 Backend **2,989 PASS / 2 FAIL / 518 SKIP**(기존 프로필 인증 401 문제, PR #2265). 올바른 NODE_ENV=test로 Frontend **2,933 PASS**. DB 62 PASS/5 SKIP, 계약 41 PASS, 정책 34 PASS. 운영 의존성 감사 0건, 전체 감사 **9건 FAIL**. 개발 DB 앱 역할의 `account_balances UPDATE`, `user_items DELETE`, `member_board_posts SELECT` 직접 권한이 허용돼 P0 #993을 재확인했습니다. 운영 DB 권한은 확인되지 않았습니다.

공식 Test는 `bb5e99ae...`, Production은 `510dbe6b...`로 후보와 다릅니다. Test 정확 SHA 사전검사 6건 불일치, 인증 E2E·독립 백업 복원 미완료. PR #2350/#2494/#2480과 가상 병합 충돌. 로컬 빌드는 2,048MiB 정적 생성 워커 SIGABRT, 1,024MiB 힙 OOM으로 실패했습니다. 최초 CI는 Android API 생성 문서 불일치로 실패했으며 생성 문서를 후보에 반영합니다. 시작 감사: 로컬 비-main 참조 247개·열린 PR 228개·충돌 29개, 종료 원격 비-main 257개(병합 14·고유 243)·열린 PR 238개·충돌 29개, 삭제 0개. 최종 SHA CI 판정은 영문 정본과 PR 댓글을 따릅니다. main 병합·배포·서비스 재시작·운영 DB 변경·롤백·브랜치 삭제는 하지 않았습니다. **RELEASE HOLD**.
