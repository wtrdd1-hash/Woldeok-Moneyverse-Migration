# v2026.10.28.1415 — 국고·조폐국·중앙은행 실제 오류 안정화 기록

## 작업 시작
- 사전 지시: v1401 국고·조폐국·중앙은행 조사 결과 P0 해결, 실제 코드/운영/테스트 기준.
- authoritative: `PROJECT_PLAN.ko.md` → `INTEGRATED_PLANNING_MASTER.ko.md` → v523 → v542. `AGENTS.md` 및 Superpowers isolated worktree, TDD, systematic debugging 적용.
- 시작 main/운영 `a28bed9aa40ff74d492824ae12892a7d52132fdd`. 미니PC 별도 `fix/treasury-money-truth-v20261028-1415`; Gemini/병렬브랜치 및 운영 코드는 읽기만 진행.
- 기존 회귀 기선 백엔드 4 파일/35개 통과.

## 원인 및 중간 작업
- 프론트 `/treasury`와 `/api/treasury/overview`: 관리자 전용 API 실패 후 25M/3.42M/1420명 가짜 숫자, 임의 날짜/가짜 원장·자격을 사용함. 공개 진실용 승인 read model이 없어 확정 전 `UNVERIFIED`/HTTP 503으로 변경. `TreasuryReserveGauge` 검증 전 정보 상태 표시, 지출 기록 빈 목록, 자격 false; 사용자 인터페이스 설명은 복식부기 대사 전 지급 가능성 보증 금지.
- 관리자 `CentralBankPanel`/`NationalMintPanel`: 하드코딩 M0·M1·M2/가짜 발행 증서와 상태 변경 UI를 회계적 진실로 오인하는 위험 제거. 독립 원장 증거 대기 표시.
- 기존 조폐국/중앙은행 API: 메모리에서 발행·소각·기준금리·지준율을 생성/변경한 결과를 성공으로 노출하는 엔드포인트에 503 stable code 도입.
- 신형 `admin/economy/monetary/execute-mint`: 인증서만 기록하고 원장을 움직이지 않는 API 차단. 수동 자동규제 및 `is_enabled:true` 변경 차단. 긴급 발행동결과 정책 read 유지.
- 관리자 국고 inject/absorb/배당/맞춤 보조/기부/그랜트/예산배정/바이백/부유세는 직접 잔액 수정 및 정식 원장 미연결로 503 보류. 비금융 조회는 유지.
- SWF `liquidateToTreasuryVault` 감사 쿼리 `$1`이 numeric 및 text로 동시에 추론되어 실행 오류였음. 금액은 `$1::numeric`, 설명은 `$1::text` 등 명시 캐스팅 수정. 회계 이체 검증 전 관리자 수동 SWF 현금화/리밸런스는 503 차단.
- 검증 전 운영 DB 금융 write/임의 초기화 불가. 작업 브랜치의 코드는 진실성/불안전 동작 차단 조치이며 전체 경제 기능 완성 주장 금지.

## 후속 작업 및 승격 게이트
- 정식 공개 read-model 및 지급용 원자적 SECURITY DEFINER 함수, 원장 대사, 회원 보안, 표준화된 국고 준비금과 Mint certificate 공급증빙, 정확 SHA Test E2E, migration272 미적용 및 DB 격리/권한 문제 우선 해결 필요.
- 공식 Test/CI/운영 완료는 마지막 종료 보고에서 실제 증거를 명시한다. 코드만 브랜치 및 PR에 보유한 상태는 운영 승격이 아니다.
