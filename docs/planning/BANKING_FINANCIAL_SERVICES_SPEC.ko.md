# 월덕 머니버스 — 은행·금융 서비스 기획 명세서

> 버전: v2026.09.12.17
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> 관련 구현 문서: `docs/features/banking.md`
> 영문 기준 문서: [BANKING_FINANCIAL_SERVICES_SPEC.md](BANKING_FINANCIAL_SERVICES_SPEC.md)

## 0. 목적

이 문서는 Moneyverse 은행을 단순 잔액/대출 화면이 아니라 예산관리, 가상신용, 가상채권, 사업보호, 기록·보관·전시 서비스와 반복 가능한 WLD 소비처를 제공하는 장기 서비스 계층으로 구체화한다. 다만 부채 악순환이나 실제 금융상품으로 오해될 구조는 만들지 않는다.

모든 상품은 서비스 내부 게임 시스템이다. 실제 예금, 증권, 보험, 신용상품, 투자수익 또는 현금환급 권리가 아니다.

두 가지 상위 정책을 유지한다.

1. **기본 한도 없음.** 일반 사용자의 행동 횟수에 임의의 상한을 두지 않는다. 제한은 보안·무결성·실제 유한 재고·시장 무결성·법적/운영 정책 또는 계약 자체의 조건일 때만 둔다.
2. **몰수보다 자발적 소비.** 고자산 유저에게 숨은 부유세를 부과하기보다 기록, 명예, 보관, 편의, 공간과 서비스에 자발적으로 WLD를 쓰게 한다.

## 1. 제품 목표

은행 시스템은 다음 여섯 가지 요구에 답해야 한다.

- **이해:** WLD가 어디서 들어오고 어디로 나갔는지 알 수 있다.
- **계획:** 예산, 저축목표, 상환계획을 세운다.
- **회복:** 가상 부채를 감당하지 못할 때 구조조정 경로가 있다.
- **보관:** 수집품·기록·장기 계정 역사를 정리한다.
- **학습:** 차입, 이자, 분산, 만기형 상품을 안전하게 학습한다.
- **소비:** 경쟁력을 사지 않고도 유용하거나 명예성 있는 서비스에 WLD를 쓸 수 있다.

## 2. 시스템 분류

모든 은행 행동은 구현 전 경제 분류를 가져야 한다.

| 유형 | 의미 | 예시 |
|---|---|---|
| Transfer | 유통 계정 사이에서 WLD 이동 | 대출 원금 지급, 채권 원금 반환 |
| Faucet | 정책에 따라 신규 WLD가 유입 | 이자 재원이 명시적 발행일 때 |
| Hard sink | WLD가 유통에서 영구 제거 | 대출 취급수수료, 보고서 비용, 금고 서비스료 |
| Converter | WLD/자원을 비통화 권리로 전환 | 아카이브 증명서, 장식형 명세서 |
| Hold | 소각하지 않고 잠금 | 담보성 예약, 대기 중 채권 구매 |

관리자 대시보드는 원금 이동을 소각량으로 집계하면 안 된다.

## 3. 은행 홈 정보구조

`/bank`는 5개 핵심 탭을 권장한다.

1. **개요** — 유동 WLD, 저축잔액, 예정 의무, 목표, 추천 행동.
2. **저축·목표** — 저축 포켓, 목표 추적, 선택형 자동화.
3. **신용** — 가상대출, 자격사유, 상환, 구조조정.
4. **채권·학습** — 가상 만기상품과 금융학습/리플레이.
5. **서비스·기록** — 보고서, 아카이브북, 금고/전시, 증명서, 사업보호.

홈 추천 행동은 최대 3개만 노출한다. 연체 중인 사용자에게 새 대출을 첫 추천으로 보여주지 않는다.

필수 화면상태: 로딩, 비어있음, 정책잠금, 정산대기, 성공, 멱등재생, 잔액부족, 오래된 견적/정책, 연체, 구조조정 검토, 점검, 서버오류.

## 4. 저축 포켓과 목표

### 4.1 저축 포켓

유저는 `비상금`, `본사`, `시즌 박물관`, `다음 사업` 같은 이름의 여러 저축 포켓을 만들 수 있다.

기본 정책:

- 포켓 개수: `null` / unlimited;
- 기본 포켓 생성 무료;
- 본인 유동계정과 저축계정 간 이동은 transfer이고 sink가 아니다;
- 목표금액, 선택형 목표일, 아이콘/테마, 공개범위를 저장한다;
- 모든 잔액 이동은 원장 권위와 멱등성을 유지한다.

### 4.2 선택형 유료 꾸미기

| 서비스 | 초기 기획가격 | 분류 | 반복 |
|---|---:|---|---|
| 포켓 테마 색상변경 | 100 WLD | hard sink | 가능 |
| 커스텀 아이콘 팩 | 300 WLD | hard sink | 신규 팩마다 |
| 목표 달성 증명서 | 250 WLD | hard sink/converter | 가능 |
| 목표완료 아카이브 카드 | 500 WLD | hard sink/converter | 가능 |
| 액자형 마일스톤 기록 | 1,500 WLD | hard sink/converter | 가능 |

이 구매는 이율, 작업보상, 주식체결, 대출자격을 개선하지 않는다.

## 5. 예치 이자 계약

기존 무결성 규칙을 유지한다. 잔액변경 시 구현 정책에 따라 적립 기준시점을 갱신하고, 1 WLD 미만 이자는 강제 반올림 지급하지 않으며 누적한다. 하나의 멱등키는 하나의 정산만 나타내고, 애플리케이션이 보호된 이자 추적 테이블을 직접 수정하지 않는다.

### 5.1 이자 재원

이자는 재원 설계에 따라 faucet 또는 treasury transfer이다. 반드시 원장에 출처를 구분한다.

권장 모드:

- `TREASURY_FUNDED`: 투명한 시스템 금고에서 이동.
- `POLICY_MINTED`: 명시적 발행. 관리자 화면에서 신규발행으로 집계.
- `DISABLED`: 이자 비활성. 저축목표 기능은 유지.

출처를 숨기는 구조는 금지한다.

### 5.2 설정 항목

- `interest_mode`;
- `annualized_rate_bps` 또는 서비스 기간 기준 이율;
- `minimum_accrual_unit`;
- `claim_mode = automatic | manual | mixed`;
- `effective_from`;
- `policy_version`.

이율 변경이 이미 정산된 과거 이자를 다시 쓰면 안 된다.

### 5.3 악용 방지

이자 경계 악용을 위한 입출금 진동, 타임스탬프 재생, 중복정산, 오래된 정책 청구를 탐지한다. 보안성 요청제한은 가능하지만 일반 사용자 저축에 일일 한도를 두지 않는다.

## 6. 가상 신용과 대출

### 6.1 원칙

대출은 일시적 유동성과 상환계획 학습을 제공한다. 무제한 화폐발행, 레버리지 증폭, 벌금 악순환이 되어서는 안 된다.

### 6.2 자격평가

가능한 입력:

- 계정 연령과 검증된 진행도;
- 최근 소득 안정성;
- 현재 미상환 원금;
- 상환 이력;
- 활성 연체/구조조정 상태;
- 사업목적 대출이라면 대상 사업 조건;
- 어뷰징/무결성 제한.

서버 정책이 판단하고 UI에 이해 가능한 reason code를 반환한다.

### 6.3 임의 대출횟수 상한 금지

“평생 1번”, “월 3번” 같은 전역 제한을 기본으로 쓰지 않는다. 대신 총 익스포저, 상환능력, 계약상태를 평가한다.

정책이 허용하면 여러 계약을 가질 수 있지만 총노출·상환능력·무결성 기준을 넘으면 신규 차입을 거절한다.

### 6.4 초기 가격안

아래는 운영 상수가 아닌 튜닝 시작점이다.

| 상품 | 원금 예시 | 기간 | 취급/서비스비 | 총 계약이자 예시 |
|---|---:|---:|---:|---:|
| Starter Builder | 5,000–25,000 WLD | 7–14일 | 1.0%, 최소 50 WLD | 1–3% |
| Business Working Capital | 20,000–250,000 WLD | 14–30일 | 1.5%, 최소 200 WLD | 2–5% |
| Expansion Credit | 정책기반 | 30–60일 | 2.0%, 최소 1,000 WLD | 3–7% |

취급/서비스비는 **hard sink**이다. 원금은 재원정책에 따라 transfer/faucet으로 별도 집계한다. 원금상환이 순환 treasury로 돌아가면 sink가 아니며, 소각 목적지로 들어간 수수료 부분만 sink다.

### 6.5 상환

지원:

- 수동 부분상환;
- 전액상환;
- 구현된 경우 서버 예약정산;
- 수수료 → 이자 → 원금처럼 명시적으로 버전된 배분순서;
- 정확한 정수연산;
- 상환요청별 안정적 멱등키.

초기 출시에서는 조기상환 벌금을 두지 않는다.

## 7. 연체·곤란상태·구조조정

Moneyverse는 영구 처벌보다 회복을 우선한다.

### 7.1 상태

`CURRENT -> DUE_SOON -> PAST_DUE -> HARDSHIP_ELIGIBLE -> RESTRUCTURED -> CURRENT`

예외:

- `PAST_DUE -> DEFAULTED`
- `DEFAULTED -> RECOVERY_PLAN`
- `RECOVERY_PLAN -> CLOSED`

### 7.2 보호장치

상환이 어려운 경우:

- 추가대출보다 상환계획을 우선 표시;
- 정책에 따라 만기연장/분할 구조조정 제공;
- 필요시 신규신용만 잠그고 무관한 게임기능은 잠그지 않음;
- 관리수수료를 무한 복리처럼 누적하지 않음;
- 계약 안전을 위해 필요할 때만 **해당 계약의 유료 구조조정 횟수**를 제한할 수 있고 일반 플레이 상한으로 사용하지 않음;
- 상환을 강제하기 위해 무관한 영구 수집품·주택·프로필 자산을 초기화하지 않음.

### 7.3 구조조정 수수료 예시

`fee = min(500 WLD, max(50 WLD, outstanding_principal * 0.5%))`

곤란상태 코호트에는 운영설정으로 0 WLD까지 낮출 수 있다. 실제 부과되면 hard sink다.

## 8. 게임 신용평판

실제 신용점수가 아닌 설명 가능한 게임 내부 신용평판을 사용한다.

가능 입력:

- 정시상환 비율;
- 미해결 연체;
- 계정 진행도;
- 검증된 안정적 소득 이력;
- 어뷰징/무결성 보류상태.

금지 입력:

- 실제 인구통계 대리변수;
- 정치·종교·사회적 민감정보;
- 숨은 소셜그래프 불이익;
- 꾸미기/실제결제 구매액;
- 주식 수익률.

UI는 실제 신용도를 암시하는 알 수 없는 숫자 하나보다 폭넓은 사유를 보여준다.

## 9. 가상채권·만기형 학습상품

### 9.1 목적

만기, 기회비용, 고정정산을 학습하면서 선택형 서비스 sink를 만든다.

### 9.2 계약 저장

각 계약에 저장:

- `bond_product_id`;
- `policy_version`;
- 구매원금;
- 구매시각;
- 만기시각;
- 정확한 만기금액 또는 결정식 입력값;
- 중도해지 규칙;
- 출금/정산 계정;
- 상태.

기존 계약은 나중 정책으로 소급 재가격하지 않는다.

### 9.3 구매/정산

원금 구매는 구현에 따라 transfer/hold이다. 공개된 발행/서비스수수료는 hard sink다.

예시 수수료:

`max(10 WLD, principal * 0.10%)`.

임의의 채권 구매횟수 상한은 두지 않는다. 경제무결성·실제 계약재고·어뷰징 방지 이유가 있으면 노출총액 등을 제한하고 이유를 문서화한다.

### 9.4 중도해지

중도해지가 있으면 불투명한 랜덤손실보다 투명한 서비스 할인/수수료를 우선한다. 확정 수령액을 확인한 뒤 승인하게 한다.

## 10. 예산·분석 서비스

기본 금융 이해 기능은 무료다. 유료기능은 표현/편의 소비처이고 특권정보 판매가 아니다.

### 무료 기본

- 수입/지출 요약;
- 내 계정 faucet/sink 분류;
- 예정 상환의무;
- 저축목표 진행률;
- 주식/사업 노출 요약 링크;
- 기술적으로 가능한 범위의 일반 명세서.

### 선택형 유료서비스

| 서비스 | 기획가격 | 분류 | 가치 |
|---|---:|---|---|
| 스타일 월간명세서 | 250 WLD | hard sink | 꾸민 카드/PDF |
| 연간 원장책 | 1,500 WLD | hard sink/converter | 수집형 아카이브 |
| 사업 재무보고서 테마 | 800 WLD | hard sink | 시각포맷 |
| 시즌 금융 스크랩북 | 2,000 WLD | hard sink/converter | 영구 기록품 |
| 커스텀 차트스킨 팩 | 500 WLD | hard sink | 시각화 전용 |

기본 데이터와 이해에 필요한 내용은 유료벽 뒤에 두지 않는다.

## 11. 금고·안전보관·전시 서비스

실제 수탁이 아니라 게임 인벤토리/전시 서비스이다.

기본 정리는 무료로 제공한다.

| 서비스 | 가격 예시 | 기간 | 분류 |
|---|---:|---:|---|
| 프리미엄 전시 서랍 | 1,000 WLD | 영구 | hard sink/converter |
| 테마 금고방 | 7,500 WLD | 영구 | hard sink/converter |
| 박물관 조명 패키지 | 2,500 WLD | 영구 | hard sink |
| 아카이브 회수 연출 | 500 WLD | 회당 | hard sink |
| provenance 증명서 | 750 WLD | 아이템당 | hard sink/converter |
| Prestige vault wing | `50,000 * 1.45^n` WLD | 영구 | hard sink |

`n`은 임의 최대치 없이 증가할 수 있다. 렌더링/성능은 소유상한 대신 페이지네이션·가상화로 해결한다.

## 12. 가상 사업보호 서비스

실제 보험으로 표현하지 않는다. **Business Protection Contract**, **Operational Recovery Plan** 같은 이름을 사용한다.

목표는 설정된 게임 사고에 대한 회복수단과 반복 sink를 제공하는 것이다. 이익보장 기능이 아니다.

대상 이벤트 예시:

- 재고폐기 사고;
- 설비고장;
- 일시 물류차질;
- 점포 운영사고.

일반적인 실적부진, 주식손실, 의도적 어뷰징은 보상하지 않는다.

가격 예시:

`service_fee = base_fee + covered_business_value * rate_bps + risk_modifier`

- Basic: 기간당 1,000 WLD;
- Standard: 3,000 WLD;
- Prestige: 고가 사업체 10,000+ WLD.

수수료는 hard sink다. 지급재원은 treasury transfer인지 faucet인지 명확하게 기록한다.

계약은 사고 생성 전에 존재해야 하며 사후가입은 금지한다. 사고·정책·지급에는 고유/멱등 settlement key를 사용한다.

## 13. 고자산 금융 명예 소비처

수익력을 높이지 않는 장기 소비처:

- Founder Treasury Room: 100,000 WLD;
- Personal Financial Archive Hall: 250,000 WLD;
- Platinum Ledger Binding: 권당 50,000 WLD;
- 도시 금융교육 후원명패: 500,000+ WLD, 명예 전용;
- Historical Market Research Wing: 1,000,000+ WLD, 박물관/전시 해금 전용;
- Legacy Treasury Gallery 확장: `500,000 * 1.5^n` WLD.

프로필, 박물관, 도시 프로젝트, 시즌 아카이브에 명예를 노출할 수 있으나 대출이율, 주식수익, 사업매출, 경쟁랭킹에는 영향을 주지 않는다.

## 14. 시장학습 연동

학습·리플레이·경쟁은 가능한 한 메인경제와 분리한다.

- 과거 리플레이는 격리된 가상잔액;
- 리그는 동일 시작잔액;
- 학습현실성을 위한 수수료 설정 가능;
- 기본 리플레이 학습은 무료;
- 테마형 리플레이/시각 아카이브는 WLD 소비처 가능;
- 메인 WLD로 리더보드점수나 시작자본 구매 금지.

평가는 거래횟수보다 수익률, 최대낙폭, 분산, 거래일지/복기를 중심으로 한다.

## 15. 시즌 연동

각 시즌은 금융 파워를 키우지 않는 은행/서비스 콘텐츠를 최소 1개 추가한다.

### Season 1 — First Capital

- 저축목표 튜토리얼;
- 첫 명세서 아카이브 수집품;
- 예산관리 퀘스트;
- 기본 사업보호 학습;
- `Founding Ledger` 아카이브 스킨.

### Season 2 — Industrial Expansion

- 창고/프로젝트 저축목표;
- 산업형 사업보호 테마;
- 물류비용 보고서;
- 가상채권 교육 챕터;
- 산업 아카이브북.

시즌이 끝나도 대출계약, 저축잔액, 채권계약, 영구 아카이브품은 유지한다. 시즌 전용 꾸미기/토큰은 Season System Spec을 따른다. 시즌 종료로 부채가 자동 삭제되지 않는다.

D-14/D-7/D-3/D-1 안내에 시즌 명세서/아카이브, 종료 예정 꾸미기, 다음 시즌 금융학습 콘텐츠를 넣을 수 있으나 “지금 빌리거나 거래해야 한다”는 긴박감을 만들지 않는다.

## 16. 원장 transaction type

권장 의미형 코드:

- `BANK_SAVINGS_TRANSFER`
- `BANK_INTEREST_SETTLEMENT`
- `LOAN_PRINCIPAL_DISBURSEMENT`
- `LOAN_ORIGINATION_FEE_SINK`
- `LOAN_REPAYMENT`
- `LOAN_RESTRUCTURE_FEE_SINK`
- `BOND_PURCHASE`
- `BOND_SERVICE_FEE_SINK`
- `BOND_MATURITY_SETTLEMENT`
- `BANK_REPORT_SERVICE_SINK`
- `VAULT_SERVICE_SINK`
- `BUSINESS_PROTECTION_FEE_SINK`
- `BUSINESS_PROTECTION_SETTLEMENT`
- `FINANCIAL_PRESTIGE_SINK`

transaction type 이름만으로 소각을 판단하지 않고 실제 posting 목적지로 경제분류를 확인한다.

## 17. 권장 DB 구조

### `bank_service_catalog`

- `service_code` PK;
- `service_type`;
- `price_mode`;
- `price_wld` nullable;
- `formula_config jsonb`;
- `duration_seconds` nullable;
- `repeatable`;
- `active_from`, `active_until`;
- `policy_version`;
- `metadata jsonb`.

### `user_savings_goals`

- `id`, `user_id`, `name`, `target_amount`;
- `target_at` nullable;
- `linked_ledger_account_id`;
- `theme_code`;
- `status`, timestamps.

### `loan_contracts`

발행 당시 원금·이율·수수료·만기·정책버전·발행상태를 불변 계약으로 보존한다. 후속 정책은 신규계약에만 적용한다.

### `loan_restructure_events`

`request_id`는 고유/멱등으로 두고 이전/신규 계약 스냅샷, 수수료, 사유코드를 저장한다.

### `virtual_bond_contracts`

정책버전, 원금, 정산 결정식 입력/결과, 만기, settlement ID를 저장한다.

### `bank_service_purchases`

서비스코드·정책버전·견적가격·원장 transaction ID·멱등키·결과 payload를 저장한다.

### `business_protection_contracts`

사업체 ID, 보장설정/버전, 효력기간, 수수료 transaction, 지급상태를 저장한다.

## 18. API 계약

권장 경로:

- `GET /api/bank/overview`
- `GET /api/bank/services`
- `POST /api/bank/services/:serviceCode/purchase`
- `GET /api/bank/savings-goals`
- `POST /api/bank/savings-goals`
- `POST /api/bank/savings-goals/:id/transfer`
- `GET /api/bank/loans/eligibility`
- `POST /api/bank/loans`
- `POST /api/bank/loans/:id/repay`
- `POST /api/bank/loans/:id/restructure`
- `GET /api/bank/bonds/catalog`
- `POST /api/bank/bonds/:productId/purchase`
- `POST /api/bank/business-protection/quote`
- `POST /api/bank/business-protection/contracts`

모든 가치변경 API는 인증된 actor, 서버 권위 견적/정책버전, 멱등키, DB 권한검증/원장정산이 필요하다. WLD는 API에서 정수 안전 문자열로 전달한다.

## 19. 관리자 콘솔

조회:

- 총 저축부채;
- 이자 faucet/treasury 재원;
- 대출 미상환원금;
- 연체/부도/구조조정 코호트;
- 취급·구조조정 수수료 소각량;
- 채권 미상환원금/만기일정;
- 사업보호 수수료 대비 지급액;
- 서비스코드별 은행 sink;
- 유저 유동/저축잔액 P50/P90/P99;
- 상위 1%/10% 자산집중;
- 은행발 순발행 기여도.

설정:

- 서비스 카탈로그 활성/비활성;
- 가격/수식/effective timestamp;
- 대출 자격/이율/수수료 정책버전;
- 채권상품 버전;
- 곤란상태/구조조정 정책;
- 사업보호 config.

고위험 변경은 기존 관리자 권한체계, 필요 시 재인증/2차인증, before/after preview, 사유기록, append-only audit를 따른다.

## 20. 분석 이벤트와 KPI

이벤트:

`bank_overview_viewed`, `savings_goal_created`, `savings_goal_funded`, `savings_goal_completed`, `loan_quote_viewed`, `loan_issued`, `loan_repayment_submitted`, `loan_restructure_started`, `loan_restructure_completed`, `bond_product_viewed`, `bond_purchased`, `bank_service_purchased`, `business_protection_quoted`, `business_protection_purchased`, `financial_archive_created`.

핵심 KPI:

- D7/D30 저축목표 사용률;
- 목표달성 중앙시간;
- 정시상환율;
- 연체회복률;
- 구조조정 성공률;
- 정상종료 후 재차입률;
- 은행 hard sink WLD와 전체 sink 대비 비중;
- 사업보호 fee-to-settlement ratio;
- 보고서/아카이브/금고 구매일수;
- 고자산층 명예 sink 노출 후 잔액증가율;
- 오류/중복정산율.

대출발급량이나 수수료수입만을 목표로 최적화하지 않는다.

## 21. 어뷰징·무결성 테스트

반드시 검증:

- 중복 대출발급;
- 중복 상환;
- 중복 이자정산;
- 오래된 견적/정책버전;
- 대출/상환 동시성;
- 음수·0·overflow 원금;
- 클라이언트가 위조한 이율/수수료;
- 만기경계 재생;
- 채권 이중정산;
- 이미 알려진 사고 이후 사업보호 가입;
- 합성사고 반복청구;
- 저축이체 race로 음수잔액 발생;
- 보고서/서비스 이중차감;
- 관리자/특권경로의 직접 원장변경 시도.

정상 유저에게 임의의 일일 요청상한을 두지 않으며 자동화 공격은 보안 계층 rate limit으로 처리한다.

## 22. 경제 통제

은행 대시보드는 다음을 분리한다.

`banking_hard_sinks`, `banking_transfers`, `banking_faucets`, `interest_issuance`, `loan_principal_outstanding`, `bond_liabilities`, `protection_fees`, `protection_settlements`.

자동 하드캡이 아니라 검토 트리거 예시:

- 이자발행이 7일 전체 faucet의 5%를 지속적으로 초과;
- 은행 이용률이 높은데 30일간 은행 hard sink가 전체 sink의 2% 미만;
- 연체회복률이 연속 코호트에서 크게 악화;
- 사업보호 지급액이 수수료보다 위험기준 이상 높음;
- 대출유래 WLD가 비정상 순발행에 크게 기여.

대응은 정책검토·시뮬레이션·config 조정이며 과거계약 소급수정은 금지한다.

## 23. A/B 실험

허용:

- 저축목표 온보딩 위치;
- 명세서/아카이브 표현;
- 상환알림 시점;
- 구조조정 설명방식;
- prestige vault 발견성;
- 사업보호 설명.

숨은 이율/수수료, 더 공격적인 부채압박, 경쟁우위를 A/B 테스트하지 않는다.

## 24. 출시 우선순위

### P0

- 저축 목표/포켓;
- 명확한 대출자격·상환 UX;
- 보고서/테마/아카이브 중심 서비스 카탈로그;
- 은행 sink 분석;
- 대출 구조조정/회복 UX.

### P1

- 금고/전시 서비스;
- 가상채권 교육/카탈로그 개선;
- 사업보호 계약;
- 시즌 금융 아카이브 연동.

### P2

- 고자산 treasury/archive 명예공간;
- 고급 과거 재무보고서;
- 도시 금융교육 후원·박물관 금융역사 프로젝트.

## 25. 완료조건

은행 기능은 아래가 충족되어야 완료다.

- 화면상태·접근성 정의;
- 서버 권위 정책/견적;
- 모든 WLD 정수/문자열 안전성;
- DB actor/소유권 검증;
- 원장 posting 대사;
- faucet/transfer/sink 분류 테스트 가능;
- 모든 가치변경 요청의 멱등성;
- 중복정산/차감 동시성 테스트;
- 기존 계약 불변성;
- 분석 이벤트;
- 필요한 관리자 조회/config/audit;
- 어뷰징/rate limit 검증;
- 영문 기준·한국어 대응 문서;
- 정확한 후보 SHA의 CI와 격리 Test 백엔드/DB/API 검증 후 Production.

## 26. 참고한 외부 설계 패턴

- TradingView Demo/Paper Trading/Bar Replay: 실제 가치 위험과 분리된 학습·리플레이 구조를 참고한다.
- Microsoft PlayFab Economy: 지속 아이템/서비스 정체성과 운영자가 조정하는 상점 가격·정책을 분리하는 패턴을 참고한다.

외부 서비스는 설계 참고자료이며 구현 종속성이 아니다.
