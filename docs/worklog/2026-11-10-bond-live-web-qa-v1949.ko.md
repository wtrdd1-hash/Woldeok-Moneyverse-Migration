# v2026.11.10.1949 — 국채 청약 실제 웹 QA

## BEFORE WORK — 2026-11-10 KST
- 요청: 모바일 국채 청약 UI에서 기능 미작동 보고. 운영에서 로그인 후 실제 청약·잔액·원장·만기까지 검증하고 장애 수정 요청.
- 기준: `origin/main` SHA 기록 후 독립 worktree; 다른 에이전트의 작업트리 및 미커밋 변경 불변.
- 문서 우선순위: `AGENTS.md`, `GEMINI.md`, `DOCS_INDEX.md`, `docs/DEVELOPMENT_STATUS_AND_MASTER_REFERENCE.ko.md`, `docs/architecture/TREASURY_CORE.md`, `docs/RELEASING.md`, 국채 변경기록.
- 사전 관찰: 독립 서비스 `moneyverse-frontend`는 `prod-v2026.11.09.1777-b2980de529`로 실행 중이나 공개 edge의 `/api/version` 및 `/frontend-version`은 **a13a18cd70709a6f4df320d4d76ea834baae2331**. 테스트 공개 edge도 같은 SHA. DB 연결/서비스 active. 상태 active는 실제 거래 성공을 증명하지 않음. `origin/main`은 prod와 달라 별도 비교 필요.
- P0 안전원칙: 운영의 실제 WLD 이동/국채 매입/만기 지급은 테스트용 고립 계정과 재무 증빙 없이 수행하지 않음. 무결성·권한·중복요청/잃어버린 응답 점검.

## IN PROGRESS — 2026-11-10 KST
- [x] 운영/테스트 Chromium 모바일 실측: `/bonds` HTTP 200, CTA 3개, 청약 모달 열림, 비로그인 확정 시 로그인 안내, 결제 POST 없음, JS 예외 없음, 390px 가로 넘침 없음.
- [x] 공개 라우트/실제 메뉴: `/`, `/bonds`, `/treasury`, `/wallet`, `/stocks`, `/work`, `/blog`, `/search`, `/status`, `/announcements` HTTP 200. `/bank` 및 `/admin/bonds` 비로그인 세션은 로그인 화면으로 이행. `/jobs`, `/news`는 실제 메뉴 경로가 아닌 임의 점검 경로로 결함 집계하지 않음.
- [x] `origin/main=edd709bcbe96f6f5ceca8372f244b632e8211242` 기준 소스와 라이브 release SHA 차이 확인. 기존 main의 미커밋 변경 불변.
- [x] Test/개발 DB SQL 인트로스펙션: `treasury_bond_subscribe(uuid,uuid,bigint,uuid DEFAULT gen_random_uuid())` 존재. 3인자 SQL EXPLAIN이 4번째 인자를 자동 생성하므로 3인자 호출 자체는 오류가 아님.
- [x] 중대 미검증: 각 재시도마다 UUID가 달라지는 청약, 명시적인 청약 보유 영수증 조회 부재, 매회 임의 UUID를 발급하는 쿠폰 정산으로 중복 지급 위험; `ACTIVE` 보유 상태 vs 구형 조회 집계 `HOLDING`, 실제 쿠폰 이벤트 vs 구형 `COUPON_INTEREST` 상태 불일치.
- [x] `moneyverse_app`은 `treasury_bond_holdings` UPDATE, `treasury_bonds` INSERT/UPDATE 권한이 없음. 자동 롤오버 및 관리자 발행/상태 변경 경로는 직접 DML이므로 정상 완료를 증명할 수 없음. 레포 신청/상환은 백엔드에서 의도적으로 503 차단.
- [x] 사용자 화면의 `ACTIVE` 표시 오류 수정 + 회귀 테스트 RED→GREEN; 비검증 자동 롤오버/담보대출 사용자 유도 제한, 국채 가상성 및 부정확한 이자·국가보증 설명 정정.
- [x] Frontend targeted 18/18, Backend targeted 23/23, contract build, frontend typecheck 통과. Focused eslint 0 errors (기존 16 warnings).
- [ ] 공식 인증된 Test의 실제 사용자 청약·원장·중복요청·쿠폰·만기 정산 E2E (전용 fixture/복제 원장 인증 미확보로 미검증).
- [ ] 본 QA 산출물 GitHub에 올리고 PR 열기, 메인 재확인 및 완료 기록.
- [ ] 후보 exact-SHA 테스트 서버 배포와 검증 (재무 P0 미해결이므로 운영 승격 HOLD).

- [x] 최종 카피 수정 후 Next 전체 재빌드 599페이지 통과, 독립 로컬 후보 `127.0.0.1:3193` 모바일 Chromium 실제 랜더링/청약 모달/차단/JS 오류 없음 확인. 화면에서 실제 정부 기관·실제 국가보장·시간당 확정 수익 오표현 제거 확인, 해당 로컬 서버 종료. **공식 Test 배포가 아닌 격리 미리보기.**

## FINISHED — 소스 QA 완료 / 금융 E2E 및 배포 보류
- GitHub [초안 PR #3008](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3008)을 생성함(미병합). 마지막 문서/후보 HEAD는 `43a1d1fd67a50e1754f49254afd0d385cc61ee31`이며, 공식 Test/운영 서버에는 배포하지 않음.
- 기준 메인 재조회: `edd709bcbe96f6f5ceca8372f244b632e8211242`, 신규 충돌 없음. 최초 기록+UI 변경 커밋 `696995e1f814e60053af70a4b1f45e3af7340ef3`를 독립 브랜치에 push 완료.
- Frontend 18/18, Backend 23/23, 계약 빌드, 프론트 타입 검사 및 전체 Next production build(정적 페이지 599개), eslint 오류 0(기존 경고 16건).
- **실제 금융 처리 검증 미완료:** 로그인 Test 청약 성공, 지갑 차감, 국고 입금, 원장 전표, 재전송 중복 방지, 쿠폰/만기 정산 미인증. 위 항목은 통과로 계산하지 않음.
- **공식 Test 후보 배포 미실시 및 운영 승격 미실시.** 사용자 WLD/국고/원장 데이터, 마이그레이션, 운영 프로세스 변경 없음.
- 운영 승격 선결 조건: 국채 구매별 중복 방지 영수증과 기간별 쿠폰 정산 영수증, 소스·DB 상태/계약 수정, 권한 통제 SQL, 격리 DB 동시성 실증, 인증 Test exact-SHA 거래 검증, 롤백/세션 검증.
- 보고서: [EN](2026-11-10-bond-live-web-qa-v1949.md) · [내부](../updates/v2026.11.10.1949-bond-live-qa-internal.ko.md) · [GitHub 공개](../updates/v2026.11.10.1949-bond-live-qa-github.ko.md).
