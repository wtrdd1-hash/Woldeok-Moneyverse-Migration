# QA — 2026-11-03 A 00:25 다국어 경로 복구

**판정: 격리 후보 검증 완료 / 운영 배포 보류.** 이슈 #2534. 금융·DB 기능 추가가 아닌 실제 사용자 P0 접속 장애 복구이다.

- 시작 main `9cade11af53db9f27c2b9f0ea9d39005ea8d0387`, 작업 중 main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`로 변경되어 분리 브랜치를 최신 main으로 리베이스했다.
- 운영 읽기 전용 HTTP: `/tools` 200, `/en/tools`·`/ja/tools`·`/zh/tools`·`/en/stocks`·`/en/roadmap` 500, 물리 경로 `/en/blog` 200. 내부 재작성 대상이 `https://localhost:4205/...`로 생성되지만 실제 Next 리스너는 HTTP였다.
- TDD 수정 전 5 FAIL/2 PASS → 수정 후 7 PASS. 로컬 루프백 HTTPS 재작성만 HTTP로 정규화하며 외부 HTTPS, 검색어, 언어 헤더는 보존한다.
- 격리 후보 4325 포트에서 위 7개 경로 모두 HTTP 200. 영어·일본어·중국어 도구 페이지의 HTML 언어, 제목, canonical URL을 확인했다. **운영 서버는 아직 수정되지 않았다.**
- 초기 코드 SHA: Frontend 2,945 PASS, Backend 2,983 PASS/518 SKIP, DB 패키지 62 PASS/5 SKIP, 빌드·타입검사 PASS, Android API 계약 184개 PASS, 전체 lint 오류 0/기존 경고 1,027.
- 전체 의존성 보안 감사 9건 FAIL(낮음 1/보통 8); 운영 의존성 감사 취약점 0건. 개발 PostgreSQL 17.11에서 `moneyverse_app`의 `account_balances UPDATE` 및 `user_items DELETE` 직접 권한이 모두 허용돼 P0 차단 상태이다.
- 최신 main 리베이스 이후의 정확한 SHA 전체 검증 결과는 PR 증거에 별도 기록한다. 공식 Test exact-SHA, 인증·세션·DB·모바일 E2E, 독립 백업 복원, GitOps/호스트 릴리스 게이트 미완료. **main 병합 및 운영 배포 금지.**

증거: `/srv/moneyverse-data/tasks/mv-a-20261103-0025-localized-tools/evidence/`.

**중복 보호:** 기존 QA Draft PR #2263에도 동일 원인의 수정이 있다. 고유 테스트·문서 커밋을 보존하고, 이 브랜치는 최신 main 기반 검증 강화 대체 후보로만 취급한다. 두 수정본을 중복 병합하지 않는다.

최신 main 리베이스 후 코드 SHA `40bdddab76ca02c4577949235c758e8b5ae4b4cf`에서 `pnpm test` 통과: 계약 41 PASS, DB 72 PASS/5 SKIP, Backend 2,985 PASS/518 SKIP, Frontend 2,954 PASS. 추가 음성 테스트로 프록시 대상 테스트 10 PASS. 최종 문서 SHA의 CI 및 릴리스 증거는 PR에 기록한다.
