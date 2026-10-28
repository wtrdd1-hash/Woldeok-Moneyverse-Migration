# A1725 업무 난이도 필터 — 개발 기록 (한국어)

## 작업 전 — 2026-10-28 17:26 KST
- Debian 13.6 미니PC 접속 및 Backend/Frontend/Bot/MCP/Nginx/Docker/개발 DB 상태 확인.
- 기준 main `35971c600f25869c96f1c666d4b9f58927202730`. AGENTS/README/영문 원본·한국어 통합기획서/QA v1344·v1345/열린 PR·CI 확인. 신규 분리 브랜치 및 worktree 사용.
- 데이터 디스크 97%, 18,000 WLD 원장 차이, 광범위한 앱 DB DML 권한, 공식 Test SHA 불일치, 마이그레이션 공백·체크섬 불일치, 독립 복원 증거 미확보로 운영 승격 차단.

## 작업 중 — 17:33~17:44 KST
- TDD RED: Backend 22 FAIL/1 PASS, Frontend 16 FAIL/29 PASS. GREEN: Backend 집중 52 PASS, Frontend 집중 45 PASS.
- 인증된 업무 목록 `GET /api/v1/work/tasks?difficulty=1..5` 정규 입력 검증, 기존 회원 범위 PostgreSQL `work_task_board($1)` 결과에 바인딩된 난이도 조건 적용. 기본 전체 목록 유지. 웹 난이도 선택/접근성, Android app-api 쿼리 전달과 개인정보 캐시 금지 구현.
- 격리 PostgreSQL 17.11 합성 테스트 4 PASS: 회원 격리, 타인 조회 차단, 64비트 금액 문자열 보존, 앱 계정의 직접 SELECT/DELETE 거부. 컨테이너 삭제. 실제 전체 운영 스키마 검증은 아님.
- 계약 빌드/API 180개 PASS, Typecheck PASS, 전체 Lint 0 오류/기존 경고 1,099개. Backend 전체 1,964 PASS/444 SKIP. 전체 프로젝트 테스트 150초 TIMEOUT, 중복 실행은 자원 보호를 위해 종료. Frontend 전체 1,888 PASS(추가 UI 테스트 이전), 난이도 접근성 UI 2 PASS. Database 46 PASS/4 SKIP, Bot 오프라인 의존성 설치 후 11 PASS, 보안 테스트 23 PASS, 운영 의존성 High 이상 0건(Moderate 1건). Frontend Build는 1GiB 힙 제한 OOM 후 2GiB로 재실행하여 PASS. 최종 SHA 전체 프로젝트 재검증 대기.

## 종료 및 배포 판단
- 전체 CI/공식 Test 검증 통과 전 Draft PR/HOLD. 마이그레이션·금융 원장·운영 DB·서비스 배포·브랜치 삭제 0건. 기존 복구 참조 보존.
- 기존 업무 보상 미리보기의 `net_reward` 부동소수점 계산은 이번 조회 필터 변경 범위 밖이며 정산의 권위 근거가 아님. 운영 RELEASE HOLD 유지.
