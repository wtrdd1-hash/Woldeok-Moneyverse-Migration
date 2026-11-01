# 개발 A — 최근 공개 게시판 수정된 글 필터 (2026-11-02)

## 작업 전 (01:26~01:29 KST)
- 전용 미니PC 상태·쉘 연결로 Debian 13.6에 접속. Backend·Frontend·Discord Bot·MCP·Nginx·Docker 활성, 개발 PostgreSQL 연결 확인.
- `AGENTS.md`, `README.md`, 영문 정본 `docs/planning/PROJECT_PLAN.md`, 한국어 2차 문서, 영문 통합기획서, QA v1451, 최근 작업일지, 열린 PR과 원격 브랜치를 확인. 기준 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`. 계획 문서 해시를 증거에 기록.
- 열린 Draft PR 146개, 충돌 29개. 전체 추적 원격 비-main 164개 중 고유 커밋 151개, main에 포함된 13개. 기존 게시판 PR #2399/#2393/#2350/#2337과 파일 중복 확인. 원격 브랜치 삭제 없음.
- 최신 main에서 `auto/hourly-a-20261102-0125-board-edited` 독립 worktree를 생성. 다른 개발자의 작업 폴더와 브랜치를 변경하지 않음.

## 설계 및 실제 구현
- P1 읽기 전용 기능: 최근 공개 게시글 **최대 50건** 중 실제 수정된 글만 선택하는 `editedOnly=1` 필터. 기존 제목·종목 검색과 조합 가능하며 전체 과거 글 검색은 아님.
- Nest에서 중복·잘못된 조건을 400으로 거부. PostgreSQL 기존 `SECURITY DEFINER` 공개 조회 함수 결과에 `updated_at > created_at` 조건을 적용. 신규 마이그레이션·직접 권한 부여·WLD·원장·사용자 데이터 변경 없음.
- 웹의 접근 가능한 GET 체크박스, 범위 안내, 잘못된 입력·조회 불가·실제 빈 결과 구분, 필터 페이지 색인 방지. Android API는 수정 시각·중복 UUID·검색 조건·최대 50건을 재검증하며 불확실한 HTTP 200을 503으로 차단. 필터 성공/오류/HEAD 응답은 no-store/noindex/no-referrer.
- TDD: Backend 관련 테스트 2건 RED 후 대상 22 PASS. Frontend/App API 13건 RED 후 13 PASS, 추가 응답 근거 3 PASS.

## 작업 중 (01:33 KST)
- 최신 main 및 영문·한국어·통합기획서 해시 재확인: 변경 없음. 기획 Draft #2402는 별도 만료 알림 예약 근거 기능으로 이 작업에서 수정하지 않음.
- 실제 개발 PostgreSQL 17.11을 `moneyverse_app` 역할로 READ ONLY 조회: 공개 함수 EXECUTE 허용, 공개 글 1건/수정 글 0건. 합성 SQL 4건 중 수정 글 2건으로 필터 양성 동작 확인. 직접 게시판 SELECT·잔액 UPDATE 권한은 여전히 개발 DB에서 허용(P0). 모든 트랜잭션 ROLLBACK.
- 공식 Test 공개 버전은 `510dbe6...`, Production은 `353c6d5...`. 이번 후보 SHA와 일치하지 않음. QA v1451의 DB 패리티·원장 근거·운영 실행물·백업 차단도 남음.

## 작업 후 (01:49 KST 이후)
- **기능 코드 커밋** `1d6bf41a80ef78d4fe413d7421e36878fd07c553`(계획 포함 11개 파일, 316줄 추가/24줄 삭제). 문서 포함 최종 SHA는 Draft PR #2407에 기록.
- 전체 Backend **2,987 PASS/518 SKIP**, Frontend **2,935 PASS**, DB **62 PASS/5 SKIP**, Android API 계약 184 엔드포인트/683 메서드 PASS. Backend·Next 빌드 PASS(정적 602페이지), Typecheck PASS, Lint 오류 0/경고 1,027, 보안 정책 27 PASS, 운영 의존성 취약점 0건, **전체 의존성 감사 FAIL 9건(보통 8/낮음 1)**. 추가 대상 테스트 PASS. SKIP을 PASS로 계산하지 않음.
- 원격 비-main 브랜치 **164→165개**, 고유 미병합 152개, main 포함 13개. 열린 Draft PR 149개, 충돌 29개. 후보와 다른 164개 브랜치 가상 병합 68개 충돌/96개 정상. #2399/#2393 파일 중복. 브랜치 삭제 없음.
- 공식 Test·Production 후보 SHA 인증 E2E와 외부 독립 복원 BLOCKED, P0 DB 권한·금융·운영 출처 미해결. **Draft/HOLD; main 병합·Test/Production 배포·DB 변경·서비스 재시작·롤백 없음.** 최종 CI 상태는 PR/내부 증거에 기록하며 진행 중인 검증은 PASS가 아님.
