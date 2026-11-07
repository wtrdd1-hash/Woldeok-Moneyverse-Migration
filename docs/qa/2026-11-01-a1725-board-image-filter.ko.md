# 개발 A 17:25 공개 게시판 사진 첨부 글 검색 — QA

**기준 main:** `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`. **기능 코드 SHA:** `f0f481044b3b92a388b0b2a686d7d674d7823e13`.

- Backend `withImage=1`은 기존 PostgreSQL 공개 조회 함수의 **최근 50건** 중 사진 저장 키가 있는 게시글만 선택. 종목·제목 필터 결합. 새 마이그레이션·원장 변경·권한 확대 없음.
- 웹 `/board`는 접근 가능한 GET 체크박스, 검색 범위 안내, 빈 결과/오류, 검색 결과 noindex 제공. Android API는 잘못된/중복 파라미터 및 필터 미검증 HTTP 200을 거부하고 no-store/noindex 적용.
- RED→GREEN: Backend RED 3건 후 23 PASS, 웹 RED 후 17 PASS, Android RED 11건 후 12 PASS, SSR 2 PASS. 증거는 미니PC 작업 폴더 `evidence/`에 저장.
- Typecheck PASS, Android API 계약 184개 PASS, Backend/Frontend Build PASS, Lint 오류 0/경고 1022. Backend 전체 **2969 PASS/2 FAIL/518 SKIP**. 실패 2건은 변경 전 main에서도 재현된 프로필 인증 401 문제이며 별도 수리 PR #2265에서 처리 중.
- Frontend 전체 최종 재실행 **2924 PASS**(SSR 테스트 2건 포함). DB 단위 62 PASS/4 SKIP, 보안 스크립트 11 PASS, 운영 의존성 알려진 취약점 0. 최종 SHA CI 대기, Frontend 전체 재실행 완료.
- 실제 개발 PostgreSQL 17.11에서 `moneyverse_app` 역할, READ ONLY, 공개 함수 EXECUTE 허용, 최근 공개 글 1건 중 사진 첨부 1건, 준비된 필터 TRUE/FALSE 각각 1건, ROLLBACK. 사진 없는 실제 양성 데이터 검증 불가.
- **P0 개발 DB 최소권한 위반:** `account_balances UPDATE`, `user_items DELETE`, `users SELECT` 모두 허용. 운영 DB 권한 상태는 미확인.
- 겹치는 미병합 Draft PR #2280/#2286/#2304/#2337 보존. 시작 시 열린 PR 105개(충돌 22개), 비-main 114개(미통합 107개). 브랜치 삭제 0.
- 공식 Test Backend/Frontend `bc8cd8a6…`, Production Backend `353c6d5d…`, Frontend 빌드 ID `1793450413898`. 이번 SHA 아님. 정확 SHA 인증 E2E·독립 복원·GitOps 게이트 미충족.
- **HOLD:** main 병합·Test/Production 배포·DB 쓰기·서비스 재시작·롤백 없음. 미검증을 PASS로 표시하지 않음.

## 종료 감사
- Draft PR #2350 (`hold`). 열린 PR 106개(충돌 22개), 비-main 115개(미통합 커밋 108개, 선조 7개, 중복 tip 0개). 겹치는 게시판 PR 4개 보존, 삭제 0건.
- Test/Production 배포·서비스 재시작·운영 DB 쓰기·롤백 모두 0건. 정확 SHA Test PASS 근거 부재로 병합 금지.
