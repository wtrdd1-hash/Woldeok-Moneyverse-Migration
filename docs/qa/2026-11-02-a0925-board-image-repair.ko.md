# QA — 2026-11-02 A0925 공개 게시판 사진 필터 검증 보수 (DRAFT / HOLD)

## 기준 및 작업 범위
- 시작/중간 최신 main `a8541927c3a351d980454c66e95a3356c47e0722`; 기존 Draft PR #2350 SHA `aaab7abd8a8036ced77f4469aa86f354ed61b610`.
- `withImage=1` 기능은 기존 PR #2350의 고유 변경이며 새 기능으로 중복 제출하지 않음. 이번 작업은 필터 미적용 구버전의 빈 HTTP 200 응답 차단, UUID 대소문자 중복 차단, 웹 SSR 검증, HEAD 응답 처리 및 referrer 차단을 보수함.
- SQL 마이그레이션·DB 권한·금융 원장·회원정보 변경 없음. 기존 공개 PostgreSQL 함수가 반환하는 최근 50건만 필터링함.

## 검증 증거
- RED: Backend 1 FAIL/12 PASS, Frontend 4 FAIL/20 PASS. GREEN: Backend 23 PASS, Frontend 26 PASS.
- 최신 main과 부모 PR을 임시 병합한 검증 작업공간 전체 테스트: Backend 2,988 PASS / 518 SKIP, Frontend 2,948 PASS, DB 62 PASS / 5 SKIP, Typecheck PASS. SKIP은 PASS가 아님.
- 전체 의존성 감사 9건(낮음 1·보통 8) FAIL, 운영 의존성 감사 알려진 취약점 0건.
- 실제 DEV PostgreSQL 17.11 `moneyverse_app` 읽기 전용: 공개 함수 실행 허용, 공개 글 1건/사진 1건, 필터 결과 1건, ROLLBACK. DEV 직접 권한 위반 `member_board_posts SELECT`, `account_balances UPDATE`, `user_items DELETE` 허용. 운영 DB 상태는 미검증(#993).

## 배포 보류
- 부모 PR #2350 미병합. 새 repair PR은 부모 PR에 종속되며 별도 main 병합 금지.
- 최종 SHA의 공식 Test 인증 E2E, 독립 백업 복원, 전체 보안 및 GitOps 게이트 미충족. Production HOLD.
- main 병합, Test·Production 배포, 운영 DB 수정, 서비스 재시작, 롤백 및 브랜치 삭제 없음.

### 스택 브랜치 검증 참고
최신 main+부모 PR 임시 통합 작업공간에서 전체 빌드와 린트(오류 0, 기존 경고 1,027) 통과. 부모 #2350 기준 깨끗한 스택 PR을 만들기 위해 브랜치를 재설정한 뒤 타입검사 최초 실행에서는 최신 main의 연금 경로를 가리키는 오래된 `.next/types` 때문에 실패. 이 worktree의 무시된 `frontend/.next`만 삭제하고 타입검사를 재실행하여 PASS. 소스나 적용된 마이그레이션을 변경해 오류를 숨기지 않았음. 공식 Test 공개 버전은 `510dbe6bf4d5...`로 이번 repair SHA와 다름.
