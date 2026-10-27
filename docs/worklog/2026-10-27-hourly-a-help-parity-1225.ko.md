# 개발 A — 검증된 도움말 마이그레이션 연속성 복구 (2026-10-27 12:25 KST)

- 기준 main `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`; 독립 브랜치 `auto/hourly-a-help-parity-20261027-1225`. 기존 Draft PR #1522의 미통합 코드를 별도 작업공간에 보존·재적용. 다른 개발 A/B/C·Gemini·QA 작업공간은 수정하지 않음.
- AGENTS/README/영문 원본 및 한국어 통합기획/기획 v1354(DRAFT/HOLD)/기존 QA·CI 확인. 도움말 기능 기본 OFF, 운영 승격 금지.
- **RED→GREEN:** 최신 main의 마이그레이션은 279까지인데 후보는 282라 연속성 1건 FAIL. 아직 적용되지 않은 **신규 후보 파일만** 280으로 재번호 지정하고 격리 테스트 fixture·계약 경로 갱신. 기존 적용 마이그레이션과 체크섬은 변경하지 않음. 다른 Draft PR에도 280이 있어 병합 직전 재조정 필요.
- 실제 `pnpm test` PASS: Backend 1,336 PASS/398 SKIP, Frontend 1,430 PASS, DB 18 PASS/3 SKIP, Contract 38 PASS. PostgreSQL 17.11 네트워크 격리·tmpfs 컨테이너에서 bootstrap/280/권한거부/독립승인/재시도/철회/불변 이벤트 검증 PASS, 컨테이너 삭제. 타입검사·Lint(기존 경고 1,131)·Backend 빌드·Next Webpack 빌드·Android App API 계약·Bot 8건 PASS.
- 전체 의존성 감사 **Critical 2/High 8 FAIL**, Bot 감사 **Critical 1/High 5 FAIL**. 공식 Test 후보 SHA 인증 E2E, 독립 복원, 브라우저 접근성·SEO, GitOps 미충족. Production RELEASE HOLD.
- 시작 원격 비-main 340, 열린 PR 333(Draft 318), 충돌 PR 26, 실패·취소 체크 PR 205, Git 객체 미확보 10. 모든 고유 변경 보존, 브랜치 삭제 0. 공식 Test/운영 DB/배포/기능 스위치 변경 0. 운영 롤백 불필요.
