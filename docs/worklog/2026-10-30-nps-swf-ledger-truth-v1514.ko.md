# v2026.10.30.1514 — 국민연금·국부펀드 증빙형 오류 조치

## 작업 전 / Before work
- 기준: origin/main 62c6cd038951d65c94b709302bdaec6e75b080b6. 2026-10-29 통합 감사 v1513, AGENTS, 통합 기획 마스터, NPS/SWF 상세 사양, 릴리스 안내 확인.
- 작업공간: 독립 브랜치 fix/nps-swf-ledger-truth-v1514-20261030. 공유 checkout 미커밋 변경 보존. 다른 에이전트 v641 SWF / v645 NPS 작업 브랜치 확인, 직접 수정 금지.
- P0 원인: 메인/운영 SWF 수동 리밸런싱은 실제 자금 정산 없이 포트폴리오 갱신 시각 및 0-WLD `SUCCESS` 이벤트만 기록하며 성공으로 보고. 수동 회수도 실거래 영수증 없이 성공 기록 가능. 과거 직접 자금 변경 SWF 코드의 재활성화 위험에 대비한 서비스 차단도 필요.
- P1 원인: NPS 공개 API 실패시 확인되지 않은 0·25,000,000 WLD 표기, 연 수익률 표기와 시간당 공식 불일치.
- 원칙: DB 금융 금액·권한·운영 포트 직접 변경 금지. 검증 전 실행 차단 및 명확한 조회 실패/율 미인증 안내. 코드 변경시 실제 테스트/빌드 후 Test 및 무중단 승격 조건 검증.

## 체크리스트
- [x] 정본·원인·작업 독립성 확인
- [x] RED: 기존 실패 테스트/신규 회귀 테스트 실행
- [x] SWF 백엔드 Fail-closed 및 관리자 경계/웹 CTA 동기화
- [x] NPS 조회 실패 사실 표시, 수익률 문구 진실성 복구
- [x] GREEN: 관련 단위·계약·타입·빌드 테스트 (확대 재무 QA는 별도 미통과)
- [x] 중간 main 재확인 및 업데이트 기록 / Draft PR #1967 발행
- [x] 분리된 Test DB 기반 localhost 백엔드/프런트 smoke 및 운영 승격 게이트 확인 (운영 승격 BLOCKED)

## 중간 / In progress
- 2026-10-30: 작업 시작, 작성 전 문서/코드/분리된 기존 작업 확인.

- 09:02 RED 기존 SWF 핵심 7 실패/4 통과. 신규 SWF 설정·NPS 통계 장애 테스트 각각 실패 확인. 초기 테스트 환경 undici 미설치였으나 다른 독립 에이전트 workspace 의존성 링크를 **읽기 전용**으로 사용하여 재실행.
- 09:06 수동 회수 차단·금융 실행 차단 통합 13/13 PASS, NPS 수익률 정밀도 5/5 PASS. SWF 설정 5/5 PASS, NPS 화면 3/3 PASS, SWF 화면·조회 8/8 PASS. 백엔드·프런트엔드 전체 타입검사 PASS.
- 확대 백엔드 Treasury/NPS 173 PASS 13 FAIL 18 SKIP; 미해결 항목: SWF 관리자 소유권 DB 스냅샷(2), Treasury 흐름·CSV·원장 커서 및 대사(11). 수정 범위 별도 기록. 확대 프런트 최초 37 PASS 4 FAIL(전부 국부펀드 정밀도·조회), 이후 해당 실패 테스트 8/8 PASS, 나머지 전체 재실측 예정.
- 작업 중 재확인 origin/main: 62c6cd038로 변경 없음. 공식 Test는 이전 v1502로 실행 중; 현재 변경 SHA 검증 미충족.

## 종료 / Finished
- 09:12 (첫 독립 작업공간) 백엔드 Nest + 프런트 Next 운영 빌드 성공(`MV_V1514_BUILDS_PASS`). 이후 공용 디스크 정리 과정에서 해당 작업공간 경로가 외부에서 제거됨. 작업 기록/코드는 이미 원격 브랜치에 푸시돼 있어 소실되지 않았고, 신규 `/srv/moneyverse-data/tasks/nps-swf-fix-v1514-close-20261030`에 Git 워크트리를 복원함. 다른 개발자 checkout·운영 릴리스 불변.
- 09:18 이후 복구된 작업공간에 `pnpm install --offline --frozen-lockfile` 성공(846개 패키지, 다운로드 0). 공통 `@moneyverse/contract` 빌드 후 백엔드·프런트 타입 검사 모두 PASS. 복구 브랜치 관련 SWF/NPS 백엔드 12 파일/67건 PASS, 프런트 15 파일/41건 PASS. 별도 확대 백엔드 국고 테스트는 앞서 173 PASS/13 FAIL/18 SKIP로 확인되어 **전수 QA는 PASS 아님**.
- 09:21 복구 소스 Nest 빌드·Next 운영 빌드 **두 번 모두 성공(두 번째 `MV_V1514_RESTORED_BUILD_PASS`)**. 변경 파일 집중 ESLint 오류 0건, 기존 경고 8건, `git diff --check` 정상.
- 격리 Preview: 127.0.0.1:3990/backend 및 localhost 3991/frontend를 `/proc`에서 확인된 기존 공식 **Test DB `wdmv_v761_test_acl`** 환경으로 분리 실행. 사전 가드로 다른 DB 주소는 거절, SWF 실행 및 스케줄러 OFF. **backend `/health` HTTP 200**, 관리자 SWF/NPS 비로그인 GET 각각 HTTP 401. **backend `/api/v1/pension/overview`는 HTTP 500: `permission denied for table national_pension_accounts`** — 테스트 DB 읽기 권한 문제 미해결, DB GRANT 변경 없음.
- 격리 Preview의 Host 기반 공개 페이지 `/pension`, `/ko/pension`, `/status` 모두 HTTP 200; 연금 API가 실패해도 '연금 통계 조회 불가' 및 **3곳 '조회 불가'**, '연 지급률 미검증' 표시. 프런트 SWF `POST /api/admin/treasury/swf` 및 `/liquidate` 각각 HTTP **503 `SWF_LEDGER_SETTLEMENT_UNAVAILABLE`**, no-store. 임시 Preview 포트 3990/3991의 소유 PID 확인 후 종료, 리스닝 포트 0개 확인.
- 최신 `origin/main` 74ca81cdeb2b86e24c8b1d1a4c9acd1bc4fe55d6까지 수차례 재확인·충돌 없이 task 브랜치에 병합; 추가 변경은 Telegram/디스크 운영 문서여서 SWF/NPS 소스 중복 수정 없음. 원본 타 에이전트 v641/v645 브랜치는 직접 수정하지 않음.
- GitHub Draft PR **#1967** (`fix/nps-swf-ledger-truth-v1514-20261030`): 작업 브랜치 코드/테스트/영문·국문 업데이트 기록까지 푸시. 초기 2026-10-30 기준 main 병합은 하지 않음.
- **운영 승격 HOLD**: 공식 `test-main-*` 및 Production은 모두 기존 **v1502**를 실행하며, 빌드 결과를 공식 Test v1514로 교체하지 않음. 확대 재무 QA 실패 13건 및 18 skip, DB migration 300 미적용·NPS Test SELECT 42501, Treasury 552개 거래 원장 키 미연결, canonical Treasury 계정 0 WLD와 구형 vault 220,923,528 WLD 간 정합성·실지급 재원 불인증, 인증 세션 연속성 및 원장 복구/롤백 게이트 미통과. 금융 변경·Production DB DML·금액 보정·메인/운영 코드 적용 없음. 실패 조건이 있는 한 무중단 승격도 진행하지 않음.
- 후속 처리: Test NPS SELECT는 최소 권한/소유자 Scoped read 설계와 마이그레이션 300 Test 적용 전 승인 및 테스트 필요; 원장 소급 분개 금지. 최신 메인 소스 동일성 및 검증된 원장·권한·Test 정확한 SHA·인증 QA/세션 유지 증거가 있을 때만 PR 승인 및 무중단 배포 가능.
