# 월덕 머니버스 — 사업체 운영·공급망 기획 명세서

> 버전: v2026.09.12.25
> 상태: 구현 지향형 제품 기획 명세
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md`
> 영문 기준 문서: [BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.md](BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.md)

## 0. 목적

현재 사업체 기능은 장기 경제자산 역할을 하지만 구매가격·일일매출·운영비 중심의 단순 구조보다 더 깊은 운영 루프가 필요하다. 이 명세는 사업체를 능동적인 공급망 시스템으로 발전시켜 의사결정, 반복 소비처, 수집가치, 시즌 콘텐츠를 만들되 무위험 복리상품이 되지 않도록 한다.

핵심 루프:

`사업체 선택 -> 원재료 조달 -> 재고 보관 -> 운영 -> 수요 충족 -> 정산 -> 재투자/꾸미기 -> 지점/네트워크 확장 -> 성과 복기`

사업체는 서비스 내부 가상게임 기능이다. 실제 회사·예금·증권·프랜차이즈·고용·투자계약·수익보장 상품이 아니다.

## 1. 제품 원칙

1. **기본 무제한.** 구현 편의만을 이유로 일일 운영횟수, 지점수, 재고기록수, 조달횟수, 사업체 보유수에 임의의 하드캡을 두지 않는다. 가능한 숫자형 제한은 `null = unlimited`를 지원한다.
2. **수익 보장 금지.** 매출은 수요·재고·품질·서비스상태·운영선택·비용에 따라 달라진다.
3. **소비흐름 명시.** 모든 WLD 흐름은 `HARD_SINK`, `TRANSFER`, `CONVERTER`, `HOLD`, `FAUCET` 중 하나로 분류한다.
4. **영구 성장 ≠ 지수적 돈복사.** 확장은 용량·선택지·명예·분석·운영옵션 중심이며 수익이 무한 복리로 커지지 않아야 한다.
5. **서버 권위.** 가격, 수요계수, 비용, 레시피, 운영시간, 소각률은 버전 관리되는 서버 정책/config다.
6. **모든 가치변경은 원장+멱등성.** 재시도로 이중구매·이중정산·재고복제가 발생할 수 없다.
7. **복귀 가능성 보장.** 장기 미접속 때문에 무제한 유지비가 쌓여 복귀 즉시 파산하는 구조를 만들지 않는다.

## 2. 사업체 유형

| 코드 | 사업체 | 핵심 루프 | 주요 투입 | 주요 산출 | 초기 진입비 예시 |
|---|---|---|---|---|---:|
| `KIOSK` | 동네 키오스크 | 소매 | 포장상품 | 소비판매 | 25,000 WLD |
| `DELIVERY_OFFICE` | 배송 사무소 | 물류 | 연료/서비스용량 | 배송수행 | 50,000 WLD |
| `SMALL_STUDIO` | 소형 스튜디오 | 서비스 | 재료/작업슬롯 | 디자인·미디어 주문 | 75,000 WLD |
| `REPAIR_SHOP` | 수리점 | 서비스/제작 | 부품 | 수리계약 | 90,000 WLD |
| `CONVENIENCE` | 24시 편의점 | 소매 | 식품/생활품 | 소매수요 | 300,000 WLD |
| `ORGANIC_FARM` | 스마트 유기농장 | 생산 | 종자/영양재 | 농산물/재료 | 500,000 WLD |
| `LOGISTICS` | 스마트 운송회사 | 물류 | 차량용량 | 노선서비스 | 1,200,000 WLD |
| `WORKSHOP` | 제조 작업장 | 생산 | 원재료 | 부품 | 600,000 WLD |
| `WAREHOUSE` | 유통 창고 | 보관/물류 | 저장공간 | 이행용량 | 750,000 WLD |

가격은 튜닝 시작값이며 불변 상수가 아니다. 기존 구현값은 별도 버전 정책/마이그레이션 전까지 역사적 정책으로 보존한다.

## 3. 사업체 상태머신

기본 상태:

`PLANNED -> REGISTERED -> ACTIVE -> PAUSED -> ACTIVE`

선택 분기:

- `ACTIVE -> DEGRADED -> ACTIVE`
- `ACTIVE -> RENOVATING -> ACTIVE`
- `ACTIVE -> TRANSFER_PENDING -> ACTIVE`
- `ACTIVE -> CLOSED`
- `PAUSED -> CLOSED`

`CLOSED` 이후에도 과거 소유권·정산·감사기록은 삭제하지 않는다.

## 4. 조달과 재고

사업체 재고는 WLD가 아니며 통화량에 포함하지 않는다. 품목별 보유수량, 예약수량, 분석용 취득원가, 출처, 필요 시 품질/유통기한, 지점/보관위치를 가진다.

P0 조달:

- **시스템 공급처 구매:** NPC/시스템에 지급한 WLD는 명시적 재원정책이 없는 한 `HARD_SINK`.
- **내부 생산 변환:** 원재료 + 서비스비 -> 산출재. 원재료는 `CONVERTER`, 서비스비는 `HARD_SINK`.

P1:

- **유저 거래소 조달:** 판매자에게 간 금액은 `TRANSFER`, 등록/체결수수료만 `HARD_SINK`.
- **클럽/프로젝트 조달:** 소유권·권한·악용방지 정책이 정의된 경우만 허용.

정상 조달횟수와 금액은 기본 무제한이다. 중복요청, 잔액/보관공간 부족, 실제 유한재고, 봇/악용, 시스템 backpressure, 시장무결성 hold만 보호 제한 사유가 된다.

## 5. 보관공간과 용량

확장은 하드캡 대신 반복 소비처로 설계한다.

`storage_upgrade_cost(n) = base_cost * 1.40^(n-1)`

예시 기본비용:

- 키오스크 6,000 WLD
- 배송사무소 10,000
- 스튜디오 12,000
- 편의점 20,000
- 농장 25,000
- 작업장 30,000
- 운송회사 50,000

확장횟수는 기본적으로 상한이 없다. 실제 스토리지 아키텍처가 증명된 안전경계를 필요로 할 때만 시스템안전 제한을 별도 문서화한다.

원장 유형: `SINK_BUSINESS_STORAGE_UPGRADE`.

## 6. 수요모델

`effective_demand = base_demand * city_factor * season_factor * category_factor * service_factor * bounded_event_factor`

수요는 서버 계산값이다. 기획 범위 예시:

- 도시요인 0.75~1.25
- 시즌요인 0.80~1.20
- 서비스요인 0.50~1.10
- 이벤트요인은 정책범위 내 허구 이벤트만 사용

이는 활동횟수 제한이 아니라 튜닝범위다. 결제여부·클럽부유도·유료코스메틱이 숨은 수요보너스를 주면 안 된다.

## 7. 운영 세션

클라이언트 타이머가 직접 돈을 만드는 구조를 금지한다.

1. 유저가 운영계획 선택
2. 서버가 상태/재고 검증
3. 필요한 재고 예약
4. `operation_run` 생성 및 config 버전 고정
5. 완료 시 서버시간과 상태 재검증
6. 투입재 확정 차감
7. 매출/비용 계산
8. 원장 정산 1회 수행
9. 분석/감사 이벤트 생성

정상 운영횟수는 무제한이다. 같은 최단작업 반복은 일일 캡 대신 한계수요 감소·운영마찰·비용곡선으로 조절할 수 있다.

## 8. 매출과 정산

`gross_revenue = fulfilled_units * effective_unit_price`

`net_result = gross_revenue - input_cost_basis - service_cost - maintenance_cost - logistics_cost - platform_fee`

원재료 취득비가 조달 시점에 이미 분류되었다면 정산에서 다시 sink로 이중집계하지 않는다.

시스템이 지급하는 매출 부분만 `FAUCET`이다. 다른 유저가 지급한 판매대금은 신규발행이 아니다.

권장 멱등키:

`business_settlement:{business_id}:{operation_run_id}:{settlement_version}`

DB 유니크 제약으로 같은 버전의 이중정산을 차단한다.

## 9. 사업체 소비처

| 코드 | 소비처 | 분류 | 가격/곡선 | 반복 | 가치 | P2W | 원장유형 |
|---|---|---|---|---|---|---|---|
| `BUS-REG` | 사업등록 | HARD_SINK | 10,000 + 유형별 진입비 | 사업체별 | 소유권 | 아니오 | `SINK_BUSINESS_REGISTRATION` |
| `BUS-STOR` | 창고확장 | HARD_SINK | base × 1.40^n | 무제한 | 용량 | 수익보장 없음 | `SINK_BUSINESS_STORAGE_UPGRADE` |
| `BUS-BRANCH` | 지점개설 | HARD_SINK | 25,000 × 1.45^지점순번 × 지역계수 | 무제한 | 운영거점 | 수익보장 없음 | `SINK_BUSINESS_BRANCH` |
| `BUS-RENO` | 리모델링 | HARD_SINK | 5,000~150,000 | 반복 | 외형/공간 | 아니오 | `SINK_BUSINESS_RENOVATION` |
| `BUS-BRAND` | 브랜딩 | HARD_SINK | 2,500~50,000 | 반복 | 간판/테마 | 아니오 | `SINK_BUSINESS_BRANDING` |
| `BUS-AD` | 광고 | HARD_SINK | 5,000/15,000/40,000 시작안 | 반복 | 제한된 노출/수요기회 | 제한 필요 | `SINK_BUSINESS_ADVERTISING` |
| `BUS-MAINT` | 예방정비 | HARD_SINK | 상태별 config | 반복 | 열화회복 | 아니오 | `SINK_BUSINESS_MAINTENANCE` |
| `BUS-LOGI` | 시스템 물류 | HARD_SINK | 거리×중량×등급 | 반복 | 재고이동 | 아니오 | `SINK_BUSINESS_LOGISTICS` |
| `BUS-CERT` | 인증/전문화 | HARD_SINK | 15,000~250,000 | 경로별 반복 | 콘텐츠/정체성 | 현금배율 금지 | `SINK_BUSINESS_CERTIFICATION` |
| `BUS-ARCH` | 기업 아카이브/박물관 | HARD_SINK | 100,000~750,000+ | 확장 | 명예/기록 | 아니오 | `SINK_BUSINESS_ARCHIVE` |
| `BUS-HQ` | 본사 확장관 | HARD_SINK | 200,000 × 1.45^n | 무제한 | 공간/명예 | 아니오 | `SINK_BUSINESS_HEADQUARTERS` |
| `BUS-PROTECT` | 사업보호 서비스비 | HARD_SINK | 위험/config 기반 | 반복 | 제한된 회복 | 양의 기대수익 약속 금지 | `SINK_BUSINESS_PROTECTION_FEE` |

광고는 발견확률이나 제한된 수요기회를 높일 수 있지만 `X 지출 → X보다 큰 확정수익` 구조로 만들지 않는다.

## 10. 지점 네트워크

지점수 기본값은 `null = unlimited`.

각 지점은 지역, 재고, 운영상태, 서비스점수, 수요스냅샷, 지역비용, 외형, 정산기록을 가진다.

`branch_cost = 25,000 * 1.45^existing_branch_count * region_factor`

지역계수는 공개된 config이며 개인의 부유도에 따라 몰래 다르게 책정하지 않는다. 지점 증가는 단순 패시브수익 배수가 아니라 운영복잡성·분산·소비처를 늘려야 한다.

## 11. 물류

배송 상태:

`DRAFT -> QUOTED -> RESERVED -> IN_TRANSIT -> DELIVERED`

예외:

- `RESERVED -> CANCELLED`
- `IN_TRANSIT -> DELAYED -> DELIVERED`
- 무결성 이상 -> `REVIEW_REQUIRED`

가격식:

`logistics_fee = base_fee + distance_units * distance_rate + quantity_weight * weight_rate + priority_fee`

시스템 운송비는 `HARD_SINK`, 유저 운송업자 대금은 `TRANSFER`, 플랫폼/보호서비스비만 sink다.

유료 빠른배송은 시간/표현만 바꿀 수 있고 재고를 복제하거나 정산검증을 우회할 수 없다.

## 12. 유지보수와 열화

상태 예시:

`GOOD`, `WORN`, `DEGRADED`, `SERVICE_REQUIRED`

열화는 미접속 시간보다 실제 운영사용량 중심으로 진행한다. 장기 미접속 유저에게 유지비가 무한 누적되어 자동 부채가 생기지 않게 한다. 미접속비가 있다면 정지, 공개된 회복상한, 복구가능 상태 전환 중 하나를 사용한다.

정비비는 `HARD_SINK`.

## 13. 광고

- 지역 전단 5,000 WLD
- 구역 캠페인 15,000
- 도시 캠페인 40,000
- 시즌 브랜드 이벤트 75,000+ config

광고효과는 서버가 제한한 발견확률 또는 추가 수요기회다. ROI 보장표현 금지.

## 14. 계약/주문

P1 계약 필드:

- 계약유형
- 요구 산출/서비스
- 수량/품질
- 기한
- 보상 재원
- 실패/포기정책
- 시즌/이벤트 연결
- config 버전

시스템 보상은 faucet 예산이 필요하고 유저가 지급하는 계약은 `TRANSFER + escrow/HOLD`로 처리한다. 시도횟수 하드캡 대신 중복계약·자전보상 루프를 차단한다.

## 15. 전문화와 명예

전문화 예시:

- 지속가능 운영
- 프리미엄 서비스
- 물류 전문
- 장인 생산
- 기록/헤리티지
- 지역 커뮤니티 브랜드

인증비는 sink이며 레시피·외형·계약종류·분석·명예를 열 수 있다. 무한 WLD 배율은 금지한다.

고자산 명예 소비처:

- 기업 역사박물관 750,000 WLD
- 스카이라인 본사 1,500,000+
- 창립자 아카이브 윙 `250,000 × 1.45^n`
- 도시 기업후원 250,000+
- 랜드마크 후원 5,000,000+

보상은 명패·전시·칭호·역사기록이며 주식체결우위·리그점수를 주지 않는다.

## 16. 사업보호 계약

실제 보험이 아닌 게임 내부 회복서비스다. 배송사고, 장비사고, 이벤트중단 같은 정의된 허구 사건만 다룬다.

필수:

- 수수료와 보상재원 분리기록
- 수익보장 표현 금지
- 저장된 사건상태 기반 결정형 청구
- 중복청구 멱등 차단
- 고의손실 루프 제외/검토
- 사건결과를 안 뒤 소급가입 금지

## 17. 시즌 연동

### Season 1 — First Capital

- 첫 사업체 등록
- 첫 조달
- 첫 운영완료
- 손익표 확인
- 선택형 리모델링
- 예산관리 미션

보상은 배지·간판·책상장식·시즌XP 중심.

### Season 2 — Industrial Expansion

- `WORKSHOP`, `WAREHOUSE`
- 생산 레시피/부품
- 다지점 물류목표
- 클럽 공동생산
- `WDX-MFG`, `WDX-INF` 허구 이벤트
- 산업형 가구/오피스 소비처

시즌 한정 진행만 종료 시 아카이브/리셋한다. 일반 소유권·지점·재고·역사는 유지한다.

## 18. 시즌 전환 공지

- D-14: 미완료 사업목표 + 다음 시즌 티저
- D-7: 신규 업종/레시피/물류 예고
- D-3: 시즌 사업 장식·아카이브 소비처
- D-1: 시즌 계약 종료시각·유지/리셋 표·미수령 보상

시즌 변경만으로 일반 영구 사업체를 초기화하지 않는다.

## 19. DB 모델

권장 테이블:

- `business_instances`: 소유자, 유형, 상태, 지역, 정책버전, 생성/종료시각
- `business_branches`: 사업체, 지점순번, 지역, 상태, 창고레벨, 상태등급
- `business_inventory_balances`: 지점, 품목, 수량, 예약수량, 버전
- `business_procurements`: 출처, 품목, 수량, WLD 금액, 분류, 멱등키
- `business_operation_runs`: 작업코드, 상태, config버전, 시작/완료가능/완료시각, 정산버전
- `business_settlements`: 총매출, faucet, hard sink, transfer, 순손익, 원장트랜잭션
- `business_shipments`: 출발/도착, 상태, 수량, 견적, 분류, 예약, 무결성상태
- `business_policy_versions`: 수요식, 비용, 가격곡선, 물류, 유지보수, 광고, 적용기간

주요 제약:

- 재고 가용수량 음수 금지
- `(business_id, branch_index)` 유일
- `(operation_run_id, settlement_version)` 유일
- 요청범위 멱등키 유일

## 20. API 계약

P0 조회:

- `GET /api/businesses`
- `GET /api/businesses/:id`
- `GET /api/businesses/:id/branches`
- `GET /api/businesses/:id/inventory`
- `GET /api/businesses/:id/operations`
- `GET /api/businesses/:id/settlements`

P0 변경:

- `POST /api/businesses/register`
- `POST /api/businesses/:id/procure`
- `POST /api/businesses/:id/storage/upgrade`
- `POST /api/businesses/:id/operations/start`
- `POST /api/businesses/:id/operations/:runId/complete`
- `POST /api/businesses/:id/maintenance`
- `POST /api/businesses/:id/branding/purchase`
- `POST /api/businesses/:id/branches/open`

P1: 배송 견적/생성/취소, 계약, 광고, 인증, 박물관/본사확장.

모든 가치변경 POST는 인증된 소유권/권한, 서버 가격검증, 멱등성을 요구한다.

## 21. 오류코드

- `BUSINESS_NOT_FOUND`
- `BUSINESS_NOT_OWNED`
- `BUSINESS_STATE_INVALID`
- `BUSINESS_POLICY_VERSION_INVALID`
- `INVENTORY_INSUFFICIENT`
- `INVENTORY_RESERVATION_CONFLICT`
- `STORAGE_INSUFFICIENT`
- `BALANCE_INSUFFICIENT`
- `OPERATION_NOT_READY`
- `OPERATION_ALREADY_SETTLED`
- `IDEMPOTENCY_CONFLICT`
- `TRUE_STOCK_EXHAUSTED`
- `MARKET_INTEGRITY_HOLD`
- `SYSTEM_BACKPRESSURE`

일반 사업 밸런스에 `DAILY_LIMIT_REACHED`를 쓰지 않는다.

## 22. 관리자 config

콘텐츠 식별자와 운영 가격을 분리한다. 버전 관리 대상:

- 진입/등록비
- 창고/지점 가격곡선
- 시스템 공급가격
- 수요계수
- 운영 투입/산출
- 시스템 매출 발행예산
- 물류요율
- 유지보수 임계값/비용
- 광고 패키지/효과상한
- 시즌 가용성
- 사업보호 수수료/보상정책

고위험 금액정책 변경은 미리보기·사유·감사기록·적용시각/버전이 필요하다. 과거정산은 재작성하지 않는다.

## 23. 경제 대시보드

필수 지표:

- 사업 시스템발행량
- 사업 hard-sink 총액
- 사업 transfer/converter volume
- 사업 순발행
- 등록/창고/지점/정비/물류/광고/명예 소비처별 소각
- 보유자 유동 WLD 중앙/P90/P95/P99
- 사업체 유형/코호트별 예상 회수기간
- 영업마진 분포
- 지점수 분포
- 재고회전율/품절률/수요충족률
- 광고비 대비 추가수요
- 상위 1%/10% 사업자산 집중도
- 복귀유저 회복률
- 멱등거절률
- 정산대사 오류수

faucet이 sink를 지속 압도하면 튜닝 신호이지 플레이 하드캡 근거가 아니다.

## 24. 분석 이벤트

`business_registered`, `business_procurement_completed`, `business_storage_upgraded`, `business_branch_opened`, `business_operation_started`, `business_operation_completed`, `business_settlement_posted`, `business_maintenance_purchased`, `business_ad_campaign_started`, `business_shipment_created`, `business_shipment_delivered`, `business_certification_purchased`, `business_prestige_sink_purchased`, `business_return_recovery_started`.

분석로그는 원장 증빙을 대신하지 않는다.

## 25. 악용/무결성

탐지/검토:

- 중복 완료요청
- 불가능한 완료시간
- 재고예약 경쟁/복제
- 보상 파밍 목적 순환거래
- 자기자금 계약루프
- 연계계정 상대방 링
- 광고/환불 루프
- 가격/config 불일치
- 지점/정산 race condition
- 감사없는 관리자 정책변경

이상신호는 검토·보호를 유발하며 관련 없는 영구자산을 조용히 재작성하지 않는다.

## 26. 구현 단계

### P0

사업체/지점 모델, 시스템 조달, 재고예약, 운영run, 원자적 정산, 창고확장, 유지보수, 대시보드, faucet/sink 분류.

### P1

배송, 광고, 인증, 시스템계약, 신규 생산업종, 시즌연동.

### P2

유저거래소 조달, 유저계약 escrow, 클럽 공동생산, 복합 제조망, 기업 박물관/본사 명예카탈로그.

## 27. 완료조건

1. 모든 WLD 흐름 분류/대사
2. 중복요청 멱등성 검증
3. 동시성 상황에서도 재고 음수/복제 불가
4. 과거정산 정책버전 보존
5. 클라이언트 타이머만으로 돈 생성 불가
6. 일반 경제밸런스에 일일 사업행동 하드캡 불필요
7. sink/faucet/transfer 대시보드 제공
8. 소유자/관리자 UI의 loading/empty/error/locked/review 상태
9. 영문 기준+한국어 대응문서 유지
10. 실제 런타임 구현은 별도 브랜치 CI + exact-SHA 격리 Test 검증 후 운영

## 28. 외부 사례 반영

- Microsoft PlayFab Economy V2는 카탈로그 아이템과 Store별 가격 override를 분리한다. Moneyverse도 사업 서비스/SKU 정체성과 운영가격 config를 분리한다.
- PlayFab Inventory API는 쓰기 요청의 idempotency를 지원한다. Moneyverse 조달·구매·정산도 동일한 exactly-once 경제행동을 요구한다.
- EVE Online의 2026년 8월 Monthly Economic Report는 경제활동과 가격지표를 공개적으로 관측한다. Moneyverse도 임의 하드캡으로 인플레이션을 숨기지 않고 발행·소각·재고회전·집중도를 관측한다.
- TradingView Paper Trading/Replay는 학습 시뮬레이션을 실제 금융노출과 분리한다. Moneyverse 사업·시장 학습도 가상성과 비현금성을 명확히 유지한다.

## 29. 현재 구현과의 정합성 후속

저장소의 과거 마이그레이션에는 작업 `daily_limit` seed와 고정 일일매출 사업체 데이터가 존재한다. 적용된 마이그레이션을 수정하지 않는다. 후속 런타임 작업에서 `DEFAULT_LIMIT_POLICY.md` 기준으로 해당 값을 분류하고 필요하면 새 forward migration/policy version으로 전환한다.

이 문서는 기획-only이며 Production DB나 런타임 직접 변경을 승인하지 않는다.