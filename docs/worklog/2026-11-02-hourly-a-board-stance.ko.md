# 개발 A — 검증된 종목 의견 필터, 2026-11-02 03:25 KST

## 시작 전
- AGENTS.md, README.md, 영문 원본 PROJECT_PLAN.md·한국어 PROJECT_PLAN.ko.md, 통합기획서, 이전 QA·A 기록, PR·CI 확인.
- 기준 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, 독립 브랜치 `auto/hourly-a-20261102-0325-board-stance`. 시작 원격 추적 브랜치 173개, 열린 PR 156개, 중간 확인 충돌 29개. 다른 개발자의 미통합 커밋 보존.

## 개발 중
- 최근 공개 글 최대 50건의 종목 의견(상승·중립·하락·의견 미표시)을 Nest/SQL/Next/Android에 연결. 기존 SECURITY DEFINER 함수 재사용, 신규 마이그레이션·권한 확대·WLD 쓰기 없음.
- TDD 실패 재현 후 수정. 중복·비정상 검색 조건 거부, 적용 증명 `appliedStance`, 웹 접근성·검색엔진 색인 방지, Android의 증명 없는 HTTP 200 차단. 기본 GET 폼의 빈 제목 입력 처리 보완.
- 개발 PostgreSQL 읽기 전용: 함수 실행 허용, 실제 최근 공개 글 1건/종목 연결 0건, 양성 다건 검증 불가. 합성 읽기 전용 SQL에서 의견 필터 분리 확인. 앱 역할의 account_balances UPDATE 및 user_items DELETE 권한 문제(P0) 잔존. 운영 DB 권한 미확인.
- 작업 중 main 재확인 결과 변경 없음. 다른 브랜치 삭제·수정, DB 쓰기, Test/Production 배포 없음.

## 종료 및 보류
- 최종 테스트·SHA는 QA·릴리스 기록과 Draft PR에 기록. 공식 Test 정확 SHA 인증 E2E, 독립 복원, 운영 실행 코드 출처, P0 권한 및 GitOps 게이트 완료 전 병합·배포 금지. 롤백은 후보 코드 미승격 유지/추가 기능 되돌리기이며 금융 원장·DB 롤백 없음.

## 종료 감사 — 03:41 KST
- 기능 SHA `f991fb04bc013b3b8aad49c34d163755015c71ee`; 생성된 `.build_id` 추적 제거 SHA `919da38e763aa0135d093630ffad48f8c38198fe`. 순변경 20개 파일. 최종 문서 포함 SHA는 PR HEAD로 확인.
- 종료 비-main 브랜치 173개(고유 미병합 160개, main 포함 13개), 열린 PR 157개, 충돌 29개. 고유 변경 및 소유권·PR 의존성 보호로 삭제 0개. A #2412와 가상 병합 시 11개 파일 충돌, 강제 병합 금지.
- 초기 로컬 게이트: Backend 2,988 PASS/518 SKIP(최종 컨트롤러 타입 보완 이전), Frontend 2,926 PASS, DB 62 PASS/5 SKIP, Lint 오류 0/경고 1,027, Typecheck·Build PASS(602 페이지), 운영 의존성 취약점 0, 전체 의존성 9건 FAIL(낮음 1/보통 8). 기존 경로의 보안 스크립트 3개는 실행 파일 없음으로 실패해 보안 PASS로 보지 않음. 최신 `scripts/security/*.mjs` 및 루트 테스트 재검증 필요.
- 공식 Test 정확 SHA 검증 FAIL: Test 서버·프론트·manifest·빌드가 `510dbe6...` 실행, 후보 불일치. Test Treasury 공개 상태 HTTP 200. 운영 Backend `353c6d5...`, Frontend `1793450413898`(SHA 아님). P0 #993/#1984 보고. 최종 루트 테스트·GitHub CI 대기, 운영 HOLD.
