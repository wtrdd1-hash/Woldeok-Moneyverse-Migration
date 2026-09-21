# 관리자 국고·세금·재정 운영 상세 기획서

> 버전: v2026.09.21.323
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-21
> 영어 원문: [ADMIN_TREASURY_MANAGEMENT_SPEC.md](ADMIN_TREASURY_MANAGEMENT_SPEC.md)
> 선행 버전: v2026.09.20.306
> 적용 성격: 기획/문서 전용. 런타임·DB·API·Production 변경 없음.

## 1. 목적

국고를 단순 관리자 잔액이 아니라 **세금·수수료 수입 → 국고 유입 → 예산 예약 → 승인된 지출 → 대사·감사 → 경제 안정화**까지 연결되는 서버 권위 재정 시스템으로 정의한다.

국고는 일반 회원 지갑이 아니며 로그인할 수 없는 전용 시스템 계정이다. 모든 WLD 이동은 Economy Core/원장 계약을 통과해야 하며 과거 거래 수정, 임의 잔액 덮어쓰기, UI-only 보정은 금지한다.

## 2. 설계 원칙

1. **국고와 소각을 구분한다.** 국고로 들어간 WLD는 재지출 가능 공급량이며 자동으로 소각으로 계산하지 않는다.
2. **세금은 목적이 아니라 조절수단이다.** 초보 진입장벽을 만들지 않고, 인플레이션·과도한 거래회전·과잉수익을 완만하게 제어한다.
3. **기본세율은 낮게, 변경은 느리게.** 자동/관리자 정책 모두 0~10% 승인 범위 안에서만 움직이고 긴급상황 외 최소 7일 유지한다.
4. **예산은 돈을 만드는 기능이 아니다.** 국고 내 기존 잔액을 목적별로 예약할 뿐이다.
5. **재정정책은 증거 기반이다.** 발행/소각, 유통속도, 거래회전율, 사용자 자산집중, 사업수익률, 준비금, 대사상태를 함께 본다.
6. **대사 실패 시 fail-closed.** 자동 세율 변경, 자동 보조금, 대량 국고지출은 중단하고 읽기·경고 중심 안전모드로 전환한다.

## 3. 국고 수입원

모든 국고 수입은 분류, 원천, 계산근거, 적용세율, 과세표준, 정산ID를 가진다.

### 3.1 초기 세율표

| 항목 | 과세표준/발생시점 | 초기값 | 허용범위 | 국고 귀속 |
|---|---|---:|---:|---:|
| 일반 사용자 간 송금세 | 수취인에게 실제 이전되는 WLD, 송금 확정 시 | 0% | 0~2% | 100% |
| 장터 판매세 | 판매자 실수령 전 체결금액 | 2% | 0~5% | 100% |
| 주식 매매세 | 체결금액 기준 매도 시 | 1% | 0~3% | 100% |
| 사업 정산 소득세 | 비용 차감 후 양(+)의 정산이익 | 3% | 0~8% | 100% |
| 사업체 간 B2B 거래세 | 실제 정산대금 | 1% | 0~3% | 100% |
| 일반 상점 소비세 | 과세대상 SKU 결제금액 | 1% | 0~3% | 100% |
| 고급/사치 SKU 소비세 | 지정 luxury SKU 결제금액 | 3% | 0~8% | 100% |
| 클럽/도시 프로젝트 관리세 | 환급되지 않는 참가·등록금 중 지정분 | 1% | 0~3% | 100% |
| 카지노/확률형 흐름 | 별도 카지노 계약 우선 | 0% | 0% 고정 | 0% |
| 작업/출석/퀘스트 보상 | 보상 지급액 | 0% | 0% 고정 | 0% |
| 거래정지 매수원가 환급 | 환급원금 | 0% | 0% 고정 | 0% |

초기값은 런칭 가설이며 구현 시 현재 경제 시뮬레이션·실측 데이터로 재검증한다. 사용자에게 이미 약속된 정산이나 원금 반환에 사후 세금을 붙이지 않는다.

### 3.2 면세/비과세

- 신규 사용자 온보딩 보상
- 작업·퀘스트·출석의 기본 보상
- 관리자 오류에 대한 환불/복구
- 주식 거래정지 매수원가 자동정산
- 시스템 장애 보상
- 본인 계정 내부의 단순 하위지갑 이동
- 동일 거래의 reversal/refund 원금

## 4. 세금 계산 규칙

- 금액은 항상 정수 문자열/BigInt-safe 연산을 사용한다.
- 세금 = floor(과세표준 × basisPoints / 10,000).
- 최소 과세액 미만은 0 처리할 수 있으나 정책값으로 명시한다.
- 한 거래에 여러 세금이 중첩되면 중첩 순서와 총 실효세율을 서버가 결정한다.
- 같은 경제행위에 중복과세가 생기지 않도록 taxable event ID를 고정한다.
- 세금 계산 결과, 세후금액, rounding remainder를 거래 receipt에 기록한다.
- 정책 변경은 effective_at 이후 신규 거래에만 적용하며 과거 거래를 재계산하지 않는다.

## 5. 국고 잔액 구조

표시값:
- 총 국고 잔액
- 예약액(committed)
- 사용 가능액(available)
- 비상준비금(reserve)
- 미정산 유입/유출(pending)
- 오늘/7일/30일 수입·지출
- 순유입
- 국고 커버리지 일수

공식:
- available = total - committed - protected_reserve
- coverage_days = available / max(1, 최근 30일 일평균 필수지출)

## 6. 국고 사용처

국고 지출은 반드시 예산 분류와 연결한다.

### 6.1 필수 우선순위

1. **정산·환불·복구**: 시스템 오류, 이중결제, 잘못된 차감 복구.
2. **보상 재원**: 이벤트·퀘스트 중 국고재원으로 명시된 보상.
3. **경제 안정화**: 신규/복귀자 완충, 특정 필수품 공급 보조.
4. **사업 보조금**: 경기침체 시 한시적 운영비 지원.
5. **커뮤니티/도시 프로젝트**: 목표 달성 보상, 공공성 콘텐츠.
6. **시즌/이벤트 예산**: 사전 배정 범위 내 지급.
7. **관리자 보정**: 회계오류를 바로잡는 최후 수단.

### 6.2 금지 사용

- 특정 개인을 임의로 부자로 만드는 무근거 지급
- 관리자 본인/지인 계정 특혜
- 감사근거 없는 대량지급
- 손실 투자 포지션의 임의 보전
- 카지노 손실 보전
- 과거 원장 삭제를 통한 잔액 맞추기

## 7. 예산 체계

초기 예산 envelope:
- ESSENTIAL_REFUND
- REWARD_POOL
- NEW_USER_SUPPORT
- RETURNING_USER_SUPPORT
- BUSINESS_STABILIZATION
- MARKET_STABILIZATION
- CITY_COMMUNITY
- SEASON_EVENT
- INCIDENT_RESPONSE
- ADMIN_CORRECTION

각 예산은 budget_id, 기간, 배정액, committed, settled, remaining, 우선순위, 자동/수동 사용 가능 여부, 생성자, 변경이력을 가진다.

예산 부족 시 하위 우선순위 지출부터 차단한다. 필수 환불/복구 예산을 이벤트 예산이 잠식할 수 없다.

## 8. 준비금 정책

- 초기 보호준비금 목표: 최근 30일 필수지출의 **14일치**.
- 경고선: 14일 미만.
- 위험선: 7일 미만.
- 비상선: 3일 미만.

비상선에서는 이벤트성/선택적 지출 자동중단, 보조금 신규 승인 중지, 관리자 경고를 기본값으로 한다. 필수 환불·복구는 유지한다.

## 9. 자동 재정 조절

자동조절은 기존 AI/경제정책 권위와 분리된 treasury policy engine으로 기록하되 동일한 변경 안전장치를 따른다.

관찰 지표:
- 1h/24h/7d/30d faucet, sink, treasury inflow/outflow
- sink-to-faucet ratio
- 유통속도
- 장터/주식 회전율
- 사업 이익률 분포
- 상위 1/10% 자산집중도
- 신규/기존 사용자 자산격차
- 준비금 커버리지
- 대사오차

자동변경 규칙:
- 한 정책 최소 7일 유지
- 한 번에 세율 ±0.5%p 이내
- 주 1회 이하 자동변경
- 전체 세금·수수료 0~10% 절대범위
- 대사 실패, 데이터 stale, 표본 부족 시 자동변경 금지
- 카지노 확률, 기존 대출계약, 과거 거래는 변경대상 제외

## 10. 관리자 화면

**관리자 → 경제 → 국고 관리**

탭:
1. Overview
2. Revenue
3. Taxes
4. Expenditure
5. Budgets
6. Corrections
7. Reconciliation
8. Policy & Alerts
9. Audit

세금 화면은 항목별 현재세율, 허용범위, 다음 변경 가능일, 최근 변경자/사유, 24h/7d 수입, 실효세율을 보여준다.

고위험 변경 확인창에는 기존값/새값, 영향 예상 거래수, 7일 추정 국고증감, 사용자 부담 변화, rollback version을 표시한다.

## 11. 사용자 표시

사용자 거래 receipt에는:
- 거래원금
- 세율
- 세금액
- 세후 실수령/실지출
- 세금명
- 정책 version
- transaction ID

숨은 세금은 금지한다. 세율이 0%라도 면세/비과세 사유를 거래 상세에서 구분할 수 있다.

## 12. 회계/원장 모델

필수 원장 category:
- TAX_MARKETPLACE
- TAX_STOCK_SELL
- TAX_BUSINESS_PROFIT
- TAX_B2B
- TAX_CONSUMPTION
- TAX_LUXURY
- TREASURY_FEE
- TREASURY_REWARD
- TREASURY_SUBSIDY
- TREASURY_GRANT
- TREASURY_REFUND
- TREASURY_INCIDENT
- ADMIN_CORRECTION_IN
- ADMIN_CORRECTION_OUT
- REVERSAL

국고 수입은 USER/SYSTEM → TREASURY, 지출은 TREASURY → USER/SYSTEM으로 이중분개한다. 소각은 USER/SYSTEM → SINK로 별도 기록한다.

## 13. API 계약

읽기:
- GET /admin/treasury/summary
- GET /admin/treasury/transactions
- GET /admin/treasury/revenue
- GET /admin/treasury/expenditure
- GET /admin/treasury/taxes
- GET /admin/treasury/budgets
- GET /admin/treasury/reconciliation
- GET /admin/treasury/audit

변경:
- POST /admin/treasury/taxes/:code/preview
- POST /admin/treasury/taxes/:code/commit
- POST /admin/treasury/budgets
- PATCH /admin/treasury/budgets/:id
- POST /admin/treasury/corrections/preview
- POST /admin/treasury/corrections/commit
- POST /admin/treasury/reconciliation/run

모든 변경은 actor-scoped 권한, step-up 인증, CSRF, request hash, idempotency key, DB-side actor 검증, 불변 감사로그를 요구한다.

## 14. DB 방향

권장 테이블:
- treasury_accounts
- treasury_transactions
- treasury_tax_policies
- treasury_tax_policy_versions
- treasury_budgets
- treasury_budget_commitments
- treasury_reconciliations
- treasury_adjustments
- treasury_alerts

핵심 제약:
- amount > 0
- rate_bps BETWEEN 0 AND 1000
- unique(taxable_event_id, tax_code)
- unique(actor_id, action, idempotency_key)
- append-only transaction rows
- policy version immutable after activation

## 15. 대사

최소 매시간 빠른 대사, 일 1회 전체 대사를 계획한다.

비교:
- treasury account balance
- treasury ledger 합계
- tax source aggregate
- fee source aggregate
- budget settled aggregate
- refund/reversal aggregate

차이가 있으면 자동 보정하지 않는다. 원인 레코드, first_seen_at, variance, affected range를 보존하고 고위험 mutation을 안전모드로 제한한다.

## 16. QA 수용 기준

- 각 세금의 과세표준/시점 정확성
- 면세항목 0원 처리
- basis-point rounding
- 동일 taxable_event 중복과세 방지
- 동시 체결/정산 중복수입 방지
- 세율변경 effective_at 경계
- 예산 committed/settled/remaining 불변식
- 준비금 하한
- 대사 실패 safe mode
- 보정 preview/commit 일치
- 관리자 BOLA/IDOR
- 재인증/CSRF/멱등성
- 320/360/390/768/1024/1440 반응형
- BigInt-safe 표시
- exact-SHA Test backend/API/DB 검증

## 17. 레퍼런스 적용 원칙

이번 기획은 대규모 게임경제/재정관리 자료군을 폭넓게 참고하되 개별 1만 페이지를 수동검토했다고 주장하지 않는다. 구현 근거는 다음 패턴을 채택한다.

- 게임경제: faucet/source와 sink를 분리하고 유입·유출 균형을 실측한다.
- 대규모 가상경제 연구: 거래세/아이템 sink와 같은 개입의 실제 효과를 사후 측정한다.
- 공공재정/treasury 사례: 단일 권위 잔액, 예산 집행 통제, 자동대사, 현금가시성, 변경불가 회계흔적을 우선한다.
- 세금은 소각과 동일시하지 않고 국고 귀속 여부를 별도 회계한다.

## 18. 작업 순서

- **v2026.09.21.323-01** — 세금 이벤트/분류/면세/회계 계약 확정
- **-02** — treasury/tax/budget/reconciliation DB schema + DB actor 권한
- **-03** — 세금 계산·국고 유입 원자적 정산
- **-04** — 예산·지출·준비금·safe-mode
- **-05** — 관리자 API/UI + 사용자 receipt
- **-06** — real-DB 동시성·대사·보안·반응형 E2E
- **-07** — 최신 Living Project Plan 재확인 → 차이해소 → exact-SHA Test
- **-08** — 병합 → 동일 병합 SHA 재빌드 → 무중단 Production 승격 → 운영 스모크

## 19. 현재 구현 상태

이번 회차는 **기획/문서 전용**이다. 기존 저장소의 관리자 경제 제어·원장·정책 인프라를 재사용할 수 있으나, 본 문서의 세율표·전용 국고 원장·예산·대사·관리자 UI/API가 이미 구현됐다고 간주하지 않는다.
