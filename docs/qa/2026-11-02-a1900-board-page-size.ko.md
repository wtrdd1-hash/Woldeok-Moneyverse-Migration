# 개발 A 2026-11-02 19:00 — 공개 게시판 표시 건수 QA (초안 / 운영 보류)

**기준:** `AGENTS.md`, `README.md`, 영문 정본 `docs/planning/PROJECT_PLAN.md`, 국문 보조본 `PROJECT_PLAN.ko.md`, `docs/RELEASING.md`. 기준 main `3eb1441090cb0602e054908547dcf43bfe4299dd`; 분리 브랜치 `auto/hourly-a-20261102-1900-board-page-size`; 초안 PR #2517. 다른 작업의 수정 중인 공유 체크아웃은 변경하지 않았다. 코드·계약 체크포인트 `b4ab109bf78b0702ec553c96406f0ba326a6f3d4`.

- **기능:** 최근 공개 게시글 최대 50건에서 표시할 10/25/50건을 선택. 기존 종목·제목 검색과 조합. `limit` 없는 기존 API 응답은 유지. PostgreSQL 기존 SECURITY DEFINER 함수의 50건 결과를 검색한 뒤 밀리초 작성시각·UUID로 정렬하고 매개변수화된 LIMIT 적용. 전체 게시글 페이지네이션이 아니다.
- **보호:** 명시적 `limit`에 `limitApplied`, `sourceWindow:50` 근거를 요구. 빈 결과도 근거 없으면 성공으로 인정하지 않는다. Next와 Android는 중복 UUID·비정상 건수·순서·응답을 차단하고 Android는 검증 불가 HTTP 200을 503으로 전환. 중복·잘못된 limit는 400. 선택 UI 라벨·44px, no-store/noindex/no-referrer 적용. DB 마이그레이션·금융 원장·권한 변경 없음.
- **TDD:** 최초 Backend 3건, Frontend 7건 실패를 확인하고 구현 후 Backend 23건, Frontend 10건 통과. 밀리초 정렬 보완 테스트와 Nest 실제 HTTP 통합 5건 통과.
- **전체 Backend:** 2,989 PASS / **2 FAIL** / 518 SKIP. 기존 프로필 인증 HTTP 200 예상 대비 401, 별도 복구 PR #2265. 전체 PASS 아님.
- **전체 Frontend:** 호스트의 `NODE_ENV=production` 환경으로 첫 실행 499 FAIL(React.act 오류). 원인 확인 후 `NODE_ENV=test`로 동일 코드 SHA 재실행해 **2,933 PASS / 0 FAIL**.
- **기타:** DB 단위 62 PASS/5 SKIP, 계약 41 PASS, 보안·릴리스 정책 34 PASS, 타입검사·빌드 PASS, ESLint 오류 0/기존 경고 1,027, Next 페이지 602개. Android 계약 184개 엔드포인트. 최초 계약 문서 drift를 영문·국문·JSON 재생성 후 PASS. 운영 의존성 감사 0건, 전체 감사 **취약점 9건 FAIL**.
- **실제 DB:** 개발 PostgreSQL 17.11 `moneyverse_app` 읽기 전용 검증 성공, 실제 공개 게시글 1건, 조건 불일치 0건, 합성 2건 검증. 개발 DB의 `user_items DELETE`, `account_balances UPDATE` 직접 권한 허용(P0 #993). 운영 DB의 권한은 미확인.
- **충돌·브랜치:** PR #2499/#2494/#2486/#2480/#2393 가상 병합에서 충돌. 원격 브랜치 265개(main 포함), 열린 PR 244개(mergeability UNKNOWN 181개). 삭제 0개, 고유 변경 보존.
- **공식 Test/Production:** 실행 SHA `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`로 후보와 다름(6개 불일치). 공개 Treasury HTTP 200으로 필수 503 조건 위반. 인증 E2E·독립 복원·GitOps 게이트 미완료. **main 병합과 운영 배포 금지**. 롤백은 `limit` 생략, 실제 배포·롤백 없음.

증거: `/srv/moneyverse-data/tasks/mv-a-20261102-1900-board-page-size/evidence/`. 최종 SHA·CI는 최종 문서 커밋 후 PR에 추가 기록한다.
