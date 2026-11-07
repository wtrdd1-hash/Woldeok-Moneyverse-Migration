# 개발 A 2026-11-02 19:30 — 공개 작성자 검색 검증 보강 QA (초안 / 배포 보류)

**기준:** `AGENTS.md`, `README.md`, 영문 원본 `docs/planning/PROJECT_PLAN.md`, 한국어 2차 문서 `docs/planning/PROJECT_PLAN.ko.md`, `docs/RELEASING.md`. 시작·중간·통합 전 main `3eb1441090cb0602e054908547dcf43bfe4299dd`. 별도 작업공간 `auto/hourly-a-20261102-1930-board-author-filter` 사용. 타 개발 브랜치와 공유 작업공간은 변경하지 않았다.

**중복 확인 및 수정 범위:** 기존 Draft #2286·#2393에 이미 공개 작성자 검색이 있다. 이번 작업은 신규 중복 기능이 아닌 **기존 기능 대체용 검증 보강**이다. #2393의 작성자 이름 검사에 더해 `sourceWindow:50` 근거, 대소문자 무시 UUID 중복, 잘못된 게시글 제목·작성자·시각·댓글 수를 Next SSR과 Android에서 차단한다. 근거 없는 빈 HTTP 200은 503, 검증 불가 HEAD는 405로 처리한다. 기존 `authorFilter` 응답 키를 유지한다. 기존 두 PR을 동시에 병합하지 않으며 고유 커밋은 보호한다. 필터 없는 기존 `{posts}` 응답은 유지한다.

**기능:** 선택적 `author` 1~80자, 앞뒤 공백 제거, 유니코드 부분문자열·대소문자 무시 검색. 종목 `stock`, 제목 `q`와 조합 가능. 매개변수 SQL `$4`로 기존 `public.member_board_public_list_with_stock(50)` 최근 50건에서만 조회한다. 전체 과거 검색이 아니다. Backend는 잘못된·중복·미허용 파라미터에 400을 반환한다. 웹에는 레이블과 최소 44px 입력, 초기화, 범위 안내, 오류 알림, 검증되지 않은 결과 차단, 비색인·무캐시를 적용한다. Android App API는 근거 없는 200을 503으로 거부하고 no-store/noindex/no-referrer를 적용한다. Android 계약 184개 유지 및 영문·국문 스키마 갱신. 신규 마이그레이션·원장·잔액 변경·권한 확대 없음.

**테스트:** 최초 RED Backend 7/Frontend 3, GREEN Backend 29/Frontend 21, 실제 Nest HTTP 6 PASS. 보강 RED Backend 2/Frontend 3, GREEN Backend 21/Frontend 16. 최초 코드 SHA `df65e64ca5b3b19a37e9a4c40de2af82a57f9f3d`의 전체 테스트 PASS: 정책 34, 계약 41, DB 62 PASS/5 SKIP, Backend 3003 PASS/518 SKIP, Frontend 2936 PASS. Lint 오류 0/기존 경고 1027, Typecheck PASS, 빌드 PASS, 운영 의존성 감사 0건. 전체 감사 **취약점 9건(낮음 1·보통 8) FAIL**. 수정 SHA `478348d7f582d8d5bb70867bcae8bdff5c180707`의 대상 테스트 PASS. 최종 정확 SHA 전체 결과는 PR에 추가한다. 저장소에 없는 두 구형 비밀정보/제어문자 스크립트 실행은 PASS로 간주하지 않는다.

**실제 PostgreSQL 17.11:** `READ ONLY`, `SET LOCAL ROLE moneyverse_app`, SQL PREPARE, ROLLBACK 성공. 조회 함수 실행 권한 true, 실제 공개 게시글 1건, 합성 종목+제목+작성자 일치 1건. 실제 다수 게시글 양성 검증은 제한적. 개발 DB의 `user_items DELETE=true`, `account_balances UPDATE=true` P0 #993 유지. 운영 DB 권한은 확인하지 않았다.

**통합·배포:** 시작 원격 브랜치(main 포함) 266, 열린 PR 245, 충돌 29. 추가 로컬 감사에서 비-main 267, main 포함 17, 고유 미통합 250, 중복 tip 그룹 1. 기존 #2517/#2499/#2494/#2486/#2480과 가상 병합 충돌(9/9/7/7/6). 삭제 0개, 고유 변경 보호. Test/Production은 후보가 아닌 `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e` 실행 중으로 6개 SHA 불일치, 공개 Treasury HTTP 200(필수 503 아님). 공식 Test 정확 SHA 인증 E2E·독립 백업 복원·전체 보안 감사·GitOps 게이트 미충족. **main 병합, Test/운영 배포, 서비스 재시작, 운영 DB 변경, 롤백 없음.** 되돌리기는 `author` 필터 사용 중지로 가능하며 스키마 롤백은 없다.

**증거:** `/srv/moneyverse-data/tasks/mv-a-20261102-1930-board-author-filter/evidence/`. 최종 상태 DRAFT/HOLD.
