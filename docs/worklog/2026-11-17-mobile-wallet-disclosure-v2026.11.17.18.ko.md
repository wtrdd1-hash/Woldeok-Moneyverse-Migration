# v2026.11.17.18 — 모바일 지갑·주식 공시 장애 작업 기록

상태: INVESTIGATING / 미배포. 격리 브랜치 `fix/mobile-wallet-disclosure-v2026.11.17.18`.

## 작업 시작(2026-11-17 KST)
- 사용자 화면: `/wallet` 지갑 전체 데이터 로딩 실패, `/stocks` 공시 대화상자가 모바일 화면을 과다 점유.
- 기준: `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/DOCUMENTATION_POLICY.md`, `AGENTS.md`. 기획서는 변경 가능한 권위 자료이며 운영 증거와 구분.
- 시작 `origin/main`: `e96e8f81f4d6b99b221392a2b6fe46356361b145`; 로컬 `main`: `d926d8f8bc7ae5f386cc5e4b45b616a67ef27894`(미공유 10커밋). 다른 에이전트 작업과 충돌 방지를 위해 격리 워크트리 사용.
- 운영 비인증 GET 실측: `/wallet` 200이지만 오류 화면, `/api/v1/wallet?recent=50` 404, `/api/v1/bank/loans` 404, `/api/v1/rewards/availability` 404, `/api/v1/stocks/portfolio` 200, `/api/v1/auth/session`는 쿠키 없는 요청에도 생성형 CSRF 문자열과 200 반환.
- 현행 Spring `/api/wallet/overview`는 프론트 계약과 경로가 다르며 외부 전달/default 사용자 UUID 및 100000 가잔액 폴백이 있어 금융 진실성 미충족. 주소만 변경해서 연결 금지.
- 인증정보·사용자 원장/개인정보 조회·금융 쓰기·DB 마이그레이션·Test/운영 배포는 수행하지 않음.

## 목표 및 검증 게이트
1. 인증 없는 세션 응답 거부 및 신원 위조 방지. 기존 정상 로그인 흐름 보존.
2. 실제 인증 세션과 원장에 근거하는 지갑만 표시. 임의 잔액/타인 정보/허위 성공 금지.
3. 실패 시 재시도·안내 UX와 모바일 공시 팝업 스크롤/닫기/버튼 개선.
4. 회귀 테스트 및 결과 기록.
5. 작업 중 `origin/main` 재확인, diff 검토, 독립 Test 및 원장/보안/복원 게이트 확인 후에만 운영승격 판단.

## 중간 기록(2026-11-18 KST)
- 작업 중 GitHub `origin/main` SHA `e96e8f81f4d6b99b221392a2b6fe46356361b145`로 시작 시점과 동일함을 재검증. 통합기획의 금융·보안 P0 `RELEASE HOLD` 유지.
- 신규 경로 미존재에 따른 Spring 최초 컴파일 실패는 TDD RED, 구현 후 집중 검증 통과. 모바일 팝업 테스트의 선택자 수정 후 통과.
- 실제 원장 계정의 본인 지갑/은행/보상 읽기, 주식 본인 세션, 비로그인 인증 401 및 구버전 가상잔액 경로 격리를 별도 브랜치에 적용.
- 운영/공식 Test Nginx·systemd·DB 변경 없음.


## 종료 기록(격리 검증, 2026-11-18 KST)
- Spring `./gradlew test bootJar --offline --no-daemon`: 빌드 통과, JUnit 35 파일 **135건 통과/실패·오류·생략 0**.
- 테스트 H2 DB를 사용하는 Spring 임의 포트 실제 HTTP 확인: 비로그인 세션/지갑/대출/보상/주식 개인 조회 401, 레거시 지갑 3개 경로 503. 금융 쓰기 없음.
- 프론트 `NODE_ENV=test pnpm exec vitest run` 지갑요약·공시 12건 통과, `tsc --noEmit` PASS, `git diff --check` PASS.
- 공식 Test/Production 전 P0: 정상 로그인 사용자·동의·CSRF, PostgreSQL17.11 실제 역할/원장 정확성, Next+Spring 모바일 E2E, 전체 회귀, 독립 복원/롤백 확인. **운영 검증 완료 아님**.
- GitHub 공개용 `docs/updates/v2026.11.17.18-mobile-wallet-disclosure.md` 및 `.ko.md` 별도 작성.
