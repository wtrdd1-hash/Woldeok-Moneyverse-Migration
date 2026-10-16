# 금융·국고·DB 최소권한 P0 결함 상세 수정 설계 — v2026.10.16.713

**PLANNING 제안. 실제 돈/권한/운영을 수정하는 문서가 아님.** [영문 정본](P0_FINANCIAL_AND_DATABASE_REMEDIATION_DESIGN_v2026.10.16.713.md) · [종합 기획](PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.ko.md)

## 1. 실제 스키마·권한·코드의 문제

- v711 감사 및 이번 추가 읽기 검사에서 개발 public 241테이블 중 `moneyverse_app`은 237개에 직접 INSERT/UPDATE/DELETE 가능. 별개 v701에서 공개 SECURITY DEFINER 실행 11→0 조치 완료. **직접 금전 DML이 남았다는 것이 현재 핵심**이다. 이 수치는 운영 DB 전체에 자동 일반화하지 않는다.
- 오늘 개발 DB `information_schema` 실측: `account_balances.available_amount NUMERIC`, `ledger_postings.amount NUMERIC`. `ledger_transactions`는 `idempotency_key UUID`, `request_hash BYTEA`, `request_hash_version SMALLINT`, `reverses_transaction_id UUID`을 보유. 초기 `001-economy-core.sql`의 `BIGINT`·옛 구조만 보고 신규 함수를 작성하면 최신 스키마와 충돌할 수 있다.
- 개발 DB에서 `account_balances`, `ledger_postings`, `ledger_transactions`, `system_treasury_vaults`, `pvp_wager_rooms`, `stock_league_participants` 각각 앱 계정 직접 SELECT·INSERT·UPDATE·DELETE가 허용된다.
- 소스 269는 기부금을 직접 잔액 갱신하고 전표를 추가하는 함수가 있으며, 271에는 선택적 REVOKE가 있다. 적용된 파일/체크섬/실효 권한을 구분하고, 과거 번호의 SQL 원본은 변경하지 않는다. v701 긴급 공개 실행권 수정과 향후 정규 마이그레이션의 중복·부작용을 차단한다.
- 코드 확인: `backend/src/casino/pvp-arena.repository.ts:347~373` 패자/승자/국고 direct UPDATE, `stock/stock-league.repository.ts:223` 참가비 직접 UPDATE. 국채·연금·FX·SWF·마켓플레이스·암시장에도 후보 경로가 있다. 사용자가 실제 이 경로를 이용하는지는 라우트/스위치/운영 프로세스 분석으로 증명한다.

## 2. 목표 금융 데이터 구조

### 2.1 계좌 원장 관계
- 사용자의 현금/은행 계정, 국고 실계정, 사업/주식/연금 적립, 에스크로/잠금, Mint 및 Sink 성격 계정을 유일한 account identity와 actor 소유권으로 관리.
- 개별 경제 명령은 서버가 검증한 actor, 도메인, 거래키, 정책 버전, 정확한 정수 WLD, 수수료/거래 상대방을 받아 **계좌 잔액 변동 + 불변 원장 + 도메인 거래 상태 + 감사 + Outbox**를 한 PostgreSQL 트랜잭션에 확정.
- 앱은 다른 회원 계좌나 국고 계정 ID를 선택해서 임의 수정을 요청할 수 없다. 서버 함수 안에서 신뢰 가능한 사전 정책과 계정 owner ID를 다시 확인한다.
- 전표가 이미 확정된 거래를 취소해야 한다면 과거 행 수정/삭제가 아니라 **역거래 참조가 붙는 별도 상계 전표**로 처리한다.

### 2.2 대사 A: 원장↔사용자/시스템 계좌
같은 시점 H까지 각 계좌의 기초잔액 + 독립 원장 순변동 = 현재 반영된 계좌 잔액이어야 한다. 실제 전표의 `direction`와 `amount` 필드 부호 규칙은 현행 schema로 확인한다. 음수 계정 잔액이 허용되는 Mint/Sink 특수 계정은 일반 개인계좌의 마이너스 허용과 혼동하지 않는다.

### 2.3 대사 B: 국고 재정 원장↔금고
국고 잔액 = 인증된 기초 재정 + 세금·기부·수수료·사업수익의 실제 납입 − 보조금·지출·국채상환 등 실제 재정지급이다. 같은 국고 금액이 메인 금고/세부 금고/은행계좌에 **복수 표시된 것**을 모두 더하지 않는다. 금고 이동은 수입이 아니며 예정 사업비·묶인 자금도 지급 가능한 금액이 아니다. 국고 출금 조건에 법정 준비금/가용액/약정 차감 적용.

### 2.4 대사 C: 총통화량↔조폐/소각
`M_total(H)=M_opening + CertifiedMint(H) − CertifiedRetirement(H)`. 세금/송금/예치/주식 매수/기부/국고 재배분은 소유자만 변경하고 총 공급 변화는 0. 조폐 명령은 중앙은행 승인서 및 고유 증명서와 1:1 대응; 소각은 Mint/Sink 성격이 실제 공급 감소로 기록되었는지 별도 판단. AI 정책 또는 SWF 예상 수익은 직접 발행 근거가 될 수 없다.

### 2.5 동일 스냅샷·검증 기록
- 계좌 원장, 국고 금고, 조폐 증빙은 **같은 원장 high-water mark/DB 스냅샷**까지 자르고 비교한다. 서로 다른 시각 쿼리로 생긴 차이는 오류가 아니라 시차일 수 있으므로 식별한다.
- 대사 실행기록 필수: `run_id`, DB 정체성, 소스 SHA/스키마 체크섬, 스냅샷 시작/종료, 원장 상한, 정책 버전, 기초잔액 근거, 비교 기준 두 합계, 차액, 불일치 계좌 개수, 상태, 오류 코드, 재무 홀드 사유.
- 관리 UI: `PENDING` / `RECONCILED` / `DISCREPANCY` / `INCOMPLETE` / `UNAVAILABLE`. 조회 SQL 실패라면 **0 차액+정상 표시 금지**; `last_reconciled_at`은 실제 완료 기록 시각만 사용.
- **음성 수용 테스트:** 복구된 격리 Test DB의 계좌 투영액을 원장 없이 1 WLD 임시 불일치시켰을 때 대사가 차액을 감지하고 위험 국고 지급이 차단되는지 검증. 운영 DB를 시험 데이터로 바꾸지 않는다.

## 3. 표준 금융 명령(API/RPC) 제안

**제안 계약**(함수명과 컬럼은 최종 스키마 검증 전 가칭):
- 입력: `actorId UUID`, `commandId UUID`, `commandType`, `requestHash`, `policyVersion`, `amountWld TEXT`, `domainArguments`, 서버가 검증한 권한/2FA/기능스위치.
- 출력: `state`(`COMMITTED`/`REJECTED`/`UNKNOWN_RECONCILING`), `operationId`, 원장 `transactionId`, 분개 목록, 정확한 계좌 변동, 수수료, 확정일시, 도메인 영수증.
- `commandId`+actor+canonical payload는 유일한 금융 의도를 뜻한다. 같은 요청 재전송은 같은 영수증, 같은 키로 내용이 바뀌면 `IDEMPOTENCY_CONFLICT` 반환/돈 변화0.
- 로직 순서: 로그인 actor 검증 → 역할/스위치/국가별 허용 여부 → 입력값·금액·잔액·준비금 검증 → 계좌/거래 잠금 정렬 → 기존 command 조회 → 분개 보존식 검사 → 원장/잔액/도메인/Outbox 일괄 커밋 → 영수증 생성. 모든 단계 실패 시 전체 ROLLBACK.
- DB 권한: 도메인 SECURITY DEFINER 함수의 owner에만 필요한 권한. 함수 정의에서 `search_path`에 비신뢰 스키마 금지, `pg_temp` 후순위. 함수 생성/권한 변경 트랜잭션에서 PUBLIC EXECUTE 차단 후 앱 서비스에 필요한 EXECUTE만 부여.
- API 실패시 `UNKNOWN_RECONCILING` 상태를 알려 주고 actor가 자신의 `operationId`로 조회할 수 있도록 한다. 프론트에서 자동으로 새 키를 생성해 다시 결제하지 않으며, 타인 영수증은 403/404.
- 금액: WLD JSON은 정수 문자열, SQL에선 검사된 `NUMERIC`; 클라이언트 Number나 `parseFloat`로 지급액을 만들지 않음. 환율 같은 소수계수는 정책 버전의 명시적 정밀도·반올림 규칙으로 최종 원장 WLD 정수에 한 번만 반영.

## 4. PvP 개선 계획: 현재 개선 보호 + 원장 복원

**현황:** 기존 코드에는 이미 `withPgTransaction`, 계좌 순서 잠금, Node `crypto.randomInt`가 있다. 이전 보고서의 '트랜잭션 없이 난수 Math.random' 설명은 현재 소스와 맞지 않으므로 폐기하고 이 보호 장치를 보존한다.

**권장 방식 A — 방 생성 시 예치 없이, 상대 참가 시 3계좌 한 번 정산**
1. 방 생성자와 참가자의 활성 계좌, 충분한 WLD, 방 waiting 상태와 별개 사용자 ID를 같은 DB 트랜잭션 안에서 검사한다.
2. 양측 1회 경기 확정. 베팅액 `stake`, 국고 수수료 `round(2*stake*feeRate)`. 서버 인증/정책상 허용한 범위로만 적용.
3. 패자 `−stake`, 승자 `+(stake−fee)`, 국고 `+fee` 전표를 원자적으로 기록한다. 합은 정확히 0이며 이익과 총 팟을 영수증에 별도 표시한다.
4. 예시 10,000+10,000 판돈 → 전체 팟20,000 / 수수료600 / 승자 표시상 총 수령19,400이더라도 **실제 계좌 순증가9,400**, 패자 −10,000, 국고 +600. 승자 자신의 10,000을 중복 차감하거나 19,400을 신규 발행하는 방식 금지.
5. 방 상태+승자+주사위 증거+원장 transactionId+수수료+알림 outbox를 함께 확정한다. 실패/타임아웃 시 동일 operation 조회.
6. Test: 2명이 동시에 참가, 본인 방 참가, 같은 키 100회, 참가 시 잔액 부족, 국고 계좌 없음, 취소/만기/중간 크래시, 잔액 동시 인출, 동점 난수 재현 증거, 수수료 소수 반올림, 외부 차단 정책.

**대안 B — 양측 판돈을 미리 escrow 잠금/예치**
양측 출금→에스크로 20,000→승자 총19,400+국고600. 취소·시간초과·만기·환급과 위약금 설계가 추가로 필요하다. 모델 A와 혼용하면 중복 출금이 발생하므로 **최초 구현은 A를 원칙으로 제안**하고 B는 새로운 독립 기획 승인 시만 한다.

## 5. 도메인별 코드·수정 단위

| 우선 | 확인할 소스 파일 | 경제 흐름 수정 설계 |
|---|---|---|
| F1 | `backend/src/admin/treasury/treasury.repository.ts:506,879` | 실제 국고 대사에서 차액/근거/홀드 제공 |
| F2 | `backend/src/casino/pvp-arena.repository.ts` · controller | 패자/승자/국고 3계좌 단일 전표·멱등·영수증 |
| F3 | `backend/src/stock/stock-league.repository.ts` | 참가비-재정 귀속 및 시즌 참가 유일성, 보상/역거래 |
| F4 | `backend/src/marketplace/black-market.repository.ts` | 경매 에스크로·입찰 실패 반환·낙찰자 1회 지급 |
| F5 | `backend/src/marketplace/marketplace.service.ts` | 구매자·판매자·수수료·취소/환불 완전 분개 |
| F6 | `backend/src/admin/bonds/treasury-bond.repository.ts` | 채권 인수/국고 현금유입·쿠폰 수입원·만기 원금 지급 |
| F7 | `backend/src/admin/pension/national-pension.repository.ts` | 납입/95:5 분배/매칭 원천/지급/탈퇴 환급 |
| F8 | `backend/src/admin/fx/fx.repository.ts` | 환율 snapshot/외환 준비금/스프레드/소수계수 안전 |
| F9 | `backend/src/admin/treasury/auto-swf.service.ts` | 추정 수익의 현금화 금지, 실현 수익 출처, 스케줄러 홀드 |
| F10 | `packages/database/migrations/240*.sql`, `244*.sql`, `245*.sql`, `267*.sql`, `269*.sql` | 과거 SQL 직접 수정 금지; 실 DB 함수와 정책권한 조사 |

각 F는 서로 다른 모듈 범위만 수정하는 소규모 PR로 분리한다. 함수/마이그레이션 번호 충돌을 피하려면 마이그레이션을 쓰는 작업은 단일 순차 소유자가 관리한다.

## 6. 권한 복원 및 마이그레이션 6단계

1. **사전 가시화:** 운영/복원 Test의 `schema_migrations` 파일명+SHA256 checksum, 함수 owner/인자/실효권한/상속권한, 앱에서 직접 쓰는 SQL, view/trigger/job 경로, 과거 회원 잔액/원장/세션 현황을 기록. 개발 DB 수치만 보고 운영 권한을 REVOKE하지 않는다.
2. **확장(Expand):** 새 제한 domain 함수·영수증 조회/중복방지 인덱스를 **실제 최신 main에서 아직 사용하지 않은 연속 번호**로 추가. SECURITY DEFINER는 고정 신뢰 search_path와 PUBIC 실행권 차단. 기존 함수가 일괄 작동하게 사용자 데이터는 자동 수정하지 않는다.
3. **복원 Test 검증:** 원본 운영 백업 복원 → SQL checksum 검증 → 실제 moneyverse_app/migrator/read-only 권한으로 정상·적대적 호출 테스트. 구/신 코드가 예상한 지급·보상 결과를 비교하되 같은 거래를 두 번 실제 게시하지 않는다.
4. **기능별 전환:** PvP·리그 등 도메인별 API에서 새 command를 사용. 영수증·불확정 처리·연금/국채/FX 사례 통과. 다른 에이전트 PR에서 같은 모듈을 변경했으면 충돌 검토 후 한쪽에 모듈 소유권을 넘긴다.
5. **축소(Contract):** 더 이상 직접 쓰는 운영 코드가 없다는 CI 정적 검사·실행 로그 확인 후 앱에서 국고/원장/보호 계좌 및 정책 테이블 INSERT/UPDATE/DELETE 권한 회수. 세션에 필요한 예외 권한은 테스트로 특정하여 유지. PUBLIC/역할 상속/DEFAULT PRIVILEGES 재조회.
6. **감시·복구:** 권한 부족으로 기존 기능이 500이 되는 문제, 원장 불일치, DB 잠금 대기, 처리율 하락을 측정. 실패하면 영향 기능 write path를 안전 차단하고, 호환되는 이전 코드로 롤백하거나 **정방향 보정 SQL**을 설계. 적용된 마이그레이션 파일을 편집·삭제하거나 운영 전체 DB를 무단 복원하지 않는다.

**번호 위험:** Git 소스에 269~271 SQL이 있지만 v697 운영 기록은 266개 적용·최대268이라고 기재. 따라서 다음 마이그레이션을 '272'라고 임의 확정하지 않는다. 실제 환경의 이력·누락·체크섬·다른 작업자 예약 여부를 맞춘 뒤 결정한다.

## 7. 수용·보안 음성 테스트 상세

- **권한:** 일반 `moneyverse_app` 직접 잔액/원장/국고 UPDATE·DELETE·INSERT 거부, API 허용 계정 본인 거래는 성공, 다른 actor 대상 403, PUBLIC EXECUTE=0, 권한 상속 우회 불가.
- **보전:** 거래마다 계좌 차액 합=0, 민간↔국고 일반 이전으로 총공급 변화 0, 진짜 조폐/소각엔 승인 증명서 필수, 국고 결손을 SWF 추정 수익으로 채우지 못함.
- **정확성:** WLD 0/음수/소수/1/정책 최소·최대/2^53 초과/SQL numeric 범위를 검사; 반올림 후 분개 합계 정확 0.
- **동시성:** 2명 동일방 참가 경합, 50개 같은 요청 동시 재전송, 계좌 두 개 순서 역전 데드락, 은행 출금과 PvP 동시, 관리자 지급 중 복제된 API 시도.
- **중복·장애:** 같은 키/다른 payload, DB 커밋 직후 HTTP 단절, Outbox 전송 전 crash, 만기/환급 재시도, 서버 재시작, 작업자 전환, 독립 상태 조회.
- **관리자·사용자:** 세션 만료·2FA 부족·CSRF 누락·권한 없는 관리자·다른 회원 영수증 조회 차단. 실사용 영수증과 DB 원장 일치.
- **대사:** SQL 실패·권한 실패·원장 데이터 누락에서 UNKNOWN/UNAVAILABLE 처리. 실제 1 WLD 차액은 DISCREPANCY 및 고위험 지급 금지. 거짓 RECONCILED 반환 0건.
- **배포:** 백업·복원 가능한 분리 DB·마이그레이션 checksum·Test 앱 동일 SHA·기존 로그인 유지·무중단 Nginx 전환·관측·되돌리기까지 증거 보존.

## 8. 시행 승인에 필요한 산출물

재무/DB 담당의 지급·회계 모형 합의, 실제 운영 DB 권한 매핑, 국고 구조의 비중복 계정 매핑, Test 데이터 격리/백업/복구, PR 파일 소유권, 기능별 테스트 결과, 앱 역할 실제 SQL 거부 로그, 마이그레이션 결과, 정확 SHA, 회원 세션 무손실 증거가 있어야 한다.

**현재 상태:** 설계안만 작성. 운영 잔액·실제 데이터·스위치·자동잡 설정·서비스 포인터·마이그레이션은 변경하지 않음. [PostgreSQL 공식 SECURITY DEFINER 안전 조건](https://www.postgresql.org/docs/17/sql-createfunction.html) 및 [REVOKE 권한 상속 특성](https://www.postgresql.org/docs/17/sql-revoke.html)을 수용 기준으로 채택할 것을 제안한다.
