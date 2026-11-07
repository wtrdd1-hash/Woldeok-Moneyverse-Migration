# 개발 A 작업일지 — 공개 게시판 댓글 있는 글 필터

## 시작 전
- Debian 13.6 미니PC 상태 확인: Backend/Frontend/Discord/Nginx/Docker 활성, 개발 DB 연결 정상.
- 최신 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, 저장소 규칙, README, 영문·국문 통합기획서, 이전 QA 및 열린 PR 확인.
- 분리 브랜치 `auto/hourly-a-20261102-0025-board-replies`와 독립 작업 폴더 생성. 시작 시 원격 브랜치 158개(main 포함), 열린 PR 141개.

## 작업 중
- 기존 공개 게시글 50건을 기준으로 댓글이 있는 글만 선택하는 P1 기능 구현. 기존 DB 함수와 매개변수 SQL 재사용, 신규 마이그레이션/권한 변경 없음.
- 테스트 우선 개발: Backend RED 2 → GREEN 22, Frontend·Android RED 9 → GREEN 19.
- 중간 main 재확인, 기능 커밋 `3bd7ba3b602845a4abdff31302c36d2b658f5ac0`, Android API 계약 갱신 커밋 `f817b25dbe4f55210ddc150c1fd2f85c058049c0`.

## 종료 및 차단
- 전체 Backend 2,987 PASS/518 SKIP, Frontend 2,941 PASS, Database 62 PASS/5 SKIP. Build·Typecheck PASS, Lint 오류 0, 보안 14 PASS, SEO 17 PASS, API 계약 184개 PASS.
- 개발 PostgreSQL 읽기 전용 검증 성공(공개 글 1건, 댓글 있는 글 0건), 양성 다건 검증은 미완료. P0 #993 권한 문제 확인.
- 공식 Test 정확 후보 SHA 인증 E2E, 독립 복원 및 GitOps 미충족. Draft PR #2399 / RELEASE HOLD. 운영 배포·main 병합·브랜치 삭제·서비스 재시작·DB 쓰기·롤백 없음.
- 상세 QA: `docs/qa/2026-11-02-a0025-board-replies.md`; 배포 보류: `docs/updates/2026-11-02-a0025-board-replies-release-hold.md`. 영문 원본과 국문 보조 기록 유지.

## v4 검증 보강(2026-11-02 00:57 KST)
- Android 게시글 응답의 UUID 대소문자 중복 우회 결함을 발견해 RED 1건 재현 후 정규화 수정. 웹·Android 대상 테스트 20건 통과, 중복 응답 HTTP 503 검증.
- 최신 main 및 영문·국문 기획서 재확인. 원격 브랜치 160개(고유 미통합 147, main 선조 12), 열린 Draft PR 143개·충돌 29개. 다른 개발 브랜치 삭제·변경 없음.
- v4 정확 SHA 전체 검증 필요. 공식 Test 인증 E2E·보안·복원·GitOps 미충족으로 병합/배포 보류.
