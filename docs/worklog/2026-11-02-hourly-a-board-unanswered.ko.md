# 개발 A — 최근 공개 게시판 미답변 글 필터 (2026-11-02)

## 시작 (01:55 KST)
- 기준 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, 독립 worktree/브랜치 사용. 타 작업의 미커밋 파일 보존.
- 영어 원본 AGENTS/README/통합계획, 한국어 계획, QA/릴리스/PR 감사. 최근 공개 게시글 최대 50건 내 댓글 0개인 글만 조회. 전체 과거 게시글 검색 아님.
- 기존 DB 보안 함수 재사용, 신규 마이그레이션/권한/금융 원장 변경 없음. 검색 조건 중복/오류 400, 검증되지 않은 Android 성공 응답 503, 검색 결과 noindex/no-store.

## 진행 중
- Backend, Web, Android API 테스트 우선 작성 및 실제 실패 재현 후 구현. Test 정확 SHA/배포 증거 없으면 HOLD.

## 종료 (02:08 KST, 로컬 후보/배포 보류)
- 순서별 SHA: main `510dbe6bf`, 시작 `fb8485a30`, 기능 `a3ff50138`, 코드·계약 `1f1c9a6d0`, 최종 문서 SHA는 PR 기록.
- 전체 테스트 재실행 PASS: 사전검사 34, 계약 41, DB 62 PASS/5 SKIP, Backend 2,987 PASS/518 SKIP, Frontend 2,937 PASS. 빌드·타입검사 PASS, Lint 오류 0/경고 1,027.
- 운영 의존성 취약점 0, 전체 개발 의존성 취약점 9건 FAIL. 개발 DB 권한 P0 FAIL, 보안 함수 소유자 정책 불일치. 실제 공개 미답변 게시글 1건 READ ONLY 확인, ROLLBACK.
- 공식 Test 후보 SHA 불일치, Production 출처 불일치, 인증 E2E/복원 미완료. #2399 가상 병합 9개 파일, #2407 6개 파일 충돌. 미통합 변경 보존.
- 감사 당시 원격 168개(main 포함), 비-main 167개 중 미통합 155개, main 선조 12개, 열린 Draft PR 150개/충돌 29개. 삭제 0건. 본 회차 main 병합·Test/운영 배포·DB 수정·서비스 재시작·롤백 0건. 최종 Draft/HOLD.


## 중간 (01:58 KST)
- 테스트 우선 실패 재현: Backend 3건, Frontend/Android 8건. 수정 후 대상 테스트 Backend 22 PASS, Frontend/Android 12 PASS. 기존 테스트 기대값과 신규 테스트 따옴표 오류 수정 기록.
- 전체 TypeScript typecheck 및 변경 파일 ESLint PASS. 개발 PostgreSQL 17.11 실제 애플리케이션 역할로 READ ONLY 조회: 최근 1건, 미답변 1건, 함수 EXECUTE 허용, ROLLBACK.
- 전체 원격 브랜치/PR 재조회, 미통합 변경 보존. Test/Production 변경 없음.
