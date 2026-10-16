# v2026.10.16.737 — 운영 금융 정합성 승격 검사기 (읽기 전용)

**상태: 승격 차단 검증 자동화 완료, 운영승격은 차단·미실행.** [English](2026-10-16-financial-readiness-v737.md)

## 기준 및 실측
- 최신 `main 6eceec56ab0637d62f490a9524af6eec184624e0`, 살아 있는 PROJECT_PLAN/통합 마스터/v713 금융 P0/v530 UI 5회/RELEASING 확인. 독립 브랜치 `fix/financial-release-readiness-v2026.10.16.737`, 다른 에이전트 코드·런타임 보호.
- 현행 운영 systemd 백엔드의 실제 DB URL은 `/home/debian/Woldeok-Moneyverse-Migration/backend/.env`에서 로드되며, DB 이름은 과거 명칭 그대로 **`woldeok_moneyverse_dev`**. 공식 Test DB와 다름. 인증정보를 소스·로그에 복사하지 않음.
- 미니PC에서 `sudo -n node scripts/release/verify-financial-readiness.mjs --env-file /home/debian/Woldeok-Moneyverse-Migration/backend/.env` 로 실행. `REPEATABLE READ READ ONLY` 단일 스냅샷 사용, 다섯 핵심 원장/잔액/금고 테이블의 앱 직접 DML 및 원장 분개·잔액 증빙을 검사 후 언제나 ROLLBACK. 금액·권한·세션은 절대 변경하지 않음.
- 실제 운영 읽기 결과 **BLOCKED**: `account_balances`, `accounts`, `ledger_transactions`, `ledger_postings`, `system_treasury_vaults` 앱 직접 쓰기 권한 있음. 계정 잔액 행 40개 중 19개가 지금까지의 부호 있는 원장 분개와 불일치, 집계 잔액 차이 **+4,779,188 WLD**. 차변-대변 불일치 트랜잭션 0, 분개 없는 원장 헤더 0. 이 차이는 **과거 초기 잔액이 미인증된 것인지, 실제 원장 드리프트인지 입증되지 않았으며 유실·탈취라고 단정할 수 없음**.
- 차이를 억지로 맞추기 위한 조폐/원장 생성/잔액 정정 절대 금지. 도입 당시 장부/오프닝 기준을 확인하고 원천 근거로 인증해야 함. DB 권한 회수는 실제 호출하는 은행·국고·연금·채권·FX·주식/마켓·PvP 경로를 별도 Test 검증하고 최소권한 DB 함수로 전환한 후 진행.
- 자가 테스트 11/11 PASS. 준비 상태 `READY_FOR_OTHER_RELEASE_GATES`도 **다른 릴리스 조건 통과를 뜻하지 않음**. 금융 발행량/금고 독립 정합, 관리자 MFA, v530 실제 166x5 동적 정상화면, Test DB/세션/롤백 미해결.
- 이번 v737은 수정/승격 통제 자동화이며 기존 회원 잔액·운영 코드·공식 Test·Production 변경 없음.
