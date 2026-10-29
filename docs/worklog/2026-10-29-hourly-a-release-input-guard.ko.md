# 2026-10-29 개발 A — 릴리스 입력 분류 안전장치

## 작업 전
- Debian 13.6 미니PC 및 주요 서비스 정상, 개발 PostgreSQL 연결 확인. 기준 main: `54b182d2214a15974350701174175f589789613b`.
- 최신 AGENTS.md/README.md, 영문·국문 프로젝트 및 통합기획서, QA v1374, 열린 PR 8개, CI를 확인하고 독립 `auto/hourly-a-release-input-20261029-2248` worktree에서만 수정함.
- 문제: `docs/` 하위의 실행 가능 파일이나 심볼릭 링크도 `DOCS_ONLY`로 판정해 릴리스 검증을 우회할 수 있음.

## 진행 중
- 실제 Git 저장소를 생성한 테스트에서 3건의 잘못된 `DOCS_ONLY` 판정을 먼저 재현함(RED).
- 문서 경로의 실행 파일 확장자, 실행 비트, 심볼릭 링크, 삭제 이전 모드, 제어 문자 파일명을 보수적으로 차단함. 일반 Markdown 및 안전한 이미지 문서의 비런타임 분류는 유지함.
- Git diff를 NUL 구분 방식으로 처리하고 이전·현재 커밋의 파일 모드를 검증함.

## 종료 / 검증
- 릴리스 테스트 94 PASS, 보안 테스트 17 PASS, 변경 파일 ESLint PASS, 전체 Typecheck PASS, Backend 및 Frontend Build PASS(Frontend 힙 1536MiB).
- 전체 Lint FAIL(기존 stale-tab-notice.tsx 오류 3건, QA PR #1894), 전체 Test FAIL(모바일 API 계약 문서 불일치). Backend 2,350 PASS/240 FAIL/493 SKIP, Frontend는 110초 제한에 걸리고 일부 실패 확인, DB 56 PASS/4 SKIP.
- 전체 실 PostgreSQL 재적용, 공식 Test 정확 SHA 인증 E2E 및 운영 릴리스 승인 미완료. 따라서 main 병합·운영배포·DB 변경·롤백을 하지 않음.
- 감사 시 원격 브랜치 14개(main 포함), 비-main 13개 중 고유 미통합 10개, 조상 3개. 열린 Draft PR 8개 중 충돌 2개. PR SHA 불일치 0, 삭제 0.
- Test·Production 버전 API는 모두 기존 `c2129625aa6629c616fb31ce790950618b8d92b2`로 응답. 이번 변경은 P0 릴리스 안전성 수정이며 신규 사용자 기능 완료가 아님.
- 롤백은 해당 분류기 변경 커밋을 되돌리는 방식이며 DB 롤백은 불필요. 모든 필수 게이트 전까지 Draft/RELEASE HOLD 유지.
