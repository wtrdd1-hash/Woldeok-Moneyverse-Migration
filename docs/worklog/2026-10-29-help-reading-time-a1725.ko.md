# A1725 — 검증된 도움말 읽기 예상 시간

## 작업 전 — 2026-10-29 17:42 KST
- Debian 13.6 미니PC 및 개발 PostgreSQL 연결 확인. 기준 main `9ebc5613845ba2e8179a0051e86db996593c8a19`.
- 원격 브랜치 150개, 열린 Draft PR 147개, Head 누락/불일치/중복 0, 충돌 PR 44개. AGENTS·README·영문/국문 기획서·QA v1369·릴리스 정책 확인.
- 처음 검토한 도움말 결과 수 10/20/50 기능은 기존 PR #1839에서 이미 구현된 것을 확인하여 커밋/푸시/PR 생성 없이 중단하고 로컬 증거만 보존.
- 별도 `auto/hourly-a-help-reading-time-20261029-1725` 브랜치/worktree에서 독립적인 P1 기능 개발.

## 작업 중
- RED: 백엔드 읽기 시간 계산 모듈/응답, 프론트 표시, Android 캐시 보호 테스트 실패 확인.
- GREEN: Backend 9 PASS, Frontend/Android 32 PASS, DB SQL 계약 5 PASS. 한국어/영어 분당 문자·단어 기준, 잘못된 추정값 미표시, Android 200/404 no-store 검증.
- 승인된 본문만 반환하는 PostgreSQL SECURITY DEFINER 함수를 재사용. 신규 마이그레이션·원장·권한 변경 없음.

## 완료 판정 — 2026-10-29 17:52 KST (후보 코드, 운영 HOLD)
- 전체 Lint PASS(오류 0/기존 경고 1089), Backend 1969 PASS/440 SKIP, Frontend 1922 PASS, DB 47 PASS/4 SKIP, API 계약 38 PASS, Build PASS. 보안 High/Critical 0, Moderate 9, Low 3.
- 첫 Typecheck는 신규 테스트 fetch 모의함수의 인자 타입 오류 TS2493으로 FAIL. 테스트 전용 타입 수정 후 `pnpm typecheck` 재실행 PASS, 프론트/Android 대상 32 PASS.
- 격리 PostgreSQL 17.11 마이그레이션 293개 적용, 승인된 한국어 501자/영어 201단어 본문 및 만료·초안·언어 차단, 앱 역할 직접 SELECT 거부 PASS. ROLLBACK 및 임시 컨테이너 제거.
- 공식 Test/Production은 `c2129625aa6629c616fb31ce790950618b8d92b2`로 후보와 다름. 정확 SHA 인증 E2E, GitOps, 롤백 검증 미충족. main 병합·운영 배포 없음.
- 브랜치·PR 삭제/종료 0건. 기존 #1839와 다른 개발자의 고유 변경 보존. 최종 후보 SHA/CI/이미지 결과는 Draft PR에 별도 기록.
