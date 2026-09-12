# 월덕 머니버스 — 기본 무제한 정책 정합성 구현 명세

> 버전: v2026.09.12.23
> 상태: 구현 지향형 정책 정합성 명세
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> 영문 기준 문서: [LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md](LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md)

## 0. 목적

이 문서는 과거 기획서에 남아 있는 수치형 제한을 현재의 `기본 무제한` 정책과 일치시키기 위한 구현 기준이다. 과거 튜닝 예시가 그대로 영구적인 사용자 하드캡으로 개발되는 것을 방지한다.

핵심 원칙은 **정상적인 유효 플레이는 기본 무제한이고, 보호 장치는 위험한 동작만 제한한다**는 것이다.

기존 문서에서 `max`, `cap`, `limit`, `일일 최대`, `이월 상한` 또는 사실상 상한으로 동작하는 고정값을 발견하면 구현 전에 반드시 분류한다.

## 1. 필수 분류

모든 수치형 상한은 다음 중 정확히 하나로 분류한다.

1. `UNLIMITED_DEFAULT` — 정상 플레이/제품 수량. 상한 없음은 `null`로 저장.
2. `UNIQUENESS` — 트로피 등 본질적으로 1회/1개인 소유·수령 규칙.
3. `TRUE_SCARCITY` — 구매 전에 공개된 실제 유한 재고.
4. `SECURITY_PROTECTION` — 봇·스팸·무차별대입·API 악용 보호.
5. `SYSTEM_SAFETY` — payload, queue, 동시성, 메모리, DB, backpressure 보호.
6. `MARKET_INTEGRITY` — 자기거래·시세조작·유동성·서킷브레이커·정산 무결성 보호.
7. `LEGAL_COMPLIANCE` — 실제로 확인된 법적 요구사항만 해당.
8. `CONTENT_BUDGET` — 제작된 콘텐츠/보상량의 유한성. 다른 정상 플레이를 막는 규칙이 아님.

`CONTENT_BUDGET`은 다른 보호 사유가 없는 한 계정 전체 플레이 잠금으로 구현하면 안 된다.

## 2. 설정 계약

권장 공통 스키마:

```text
limit_mode: unlimited | uniqueness | scarcity | protection
limit_value: bigint | null
limit_reason_code: string | null
limit_scope: account | item | order | request | market | season | project | system | null
reset_policy: none | rolling_window | fixed_window | lifecycle | null
user_visible: boolean
```

규칙:

- `unlimited`이면 `limit_value = null`.
- `0`을 무제한 의미로 사용하지 않는다.
- 보호용 제한은 `limit_reason_code`가 필수다.
- 보호장치 지표와 성장/진행 지표를 분리한다.
- 보호 기준 변경은 감사 가능하고 config version으로 관리한다.
- 프론트엔드 상수만으로 제한을 권위 있게 적용하지 않는다.

## 3. 확인된 기존 하드캡 정합성

### 3.1 WDX 미체결 주문 수

기존 `PRODUCT_DESIGN_SPEC.md`의 `계정당 최대 20개 미체결 주문`은 일반 진행 제한으로 사용하지 않는다.

**새 분류:** `SYSTEM_SAFETY`.

구현 방향:

- 사용자 제품 정책상 임의의 미체결 주문 개수 제한은 기본 없음;
- 주문 목록은 cursor pagination;
- 매칭/정산은 queue backpressure와 요청 단위 동시성 보호 사용;
- 부하테스트에서 명확한 자원 불변조건이 확인될 때만 임시 보호 상한 설정;
- 보호값은 정상 사용보다 충분히 높고 관측 가능하며 reason code를 가져야 하고 코드 배포 없이 조정 가능해야 함;
- 이를 일반 게임 규칙처럼 홍보하지 않음.

완료조건: 부하테스트 후 `null` 또는 근거가 문서화된 안전 기준을 결정하고, 보호기준 도달 시 `SYSTEM_CAPACITY_PROTECTION` 계열 문제응답을 반환한다.

### 3.2 WDX 단일 주문 금액

기존 `유동 WLD의 20% 또는 정책상한 중 작은 값`은 임의 자산비율 상한으로 유지하지 않는다.

**새 분류:** `MARKET_INTEGRITY`.

권장 모델:

```text
allowed_notional = min(
  available_cash,
  instrument_dynamic_notional_guard
)
```

무결성 보호가 필요하지 않으면 `instrument_dynamic_notional_guard = null`이 가능하다. 보호가 필요한 경우 사용자 자산비율이 아니라 가상 종목의 유동성, 허용 가격영향, 기준 거래량, 시장상태를 근거로 계산한다.

입력 예시:

- 최근 시뮬레이션 ADV/유동성 구간;
- 현재 spread/변동성;
- 최근 주문 불균형;
- 계정/연계계정 무결성 신호;
- 현재 circuit-breaker 상태.

목적은 부유한 사용자를 느리게 만드는 것이 아니라 가격형성 보호다.

### 3.3 튜토리얼 거래 수량

기존 `첫 3회 거래는 주문당 최대 5주`는 **튜토리얼 샌드박스 규칙**으로만 유지 가능하다.

명시적으로 표시된 가이드 주문에서만 사용하고 튜토리얼 상태 종료 후에는 일반 시장 정책으로 전환한다. 숨은 영구 제한으로 남기지 않는다.

### 3.4 시즌 XP 소스 최대치

일일/주간/이벤트 XP 최대치는 `CONTENT_BUDGET`으로 해석한다.

예를 들어 하루 제작된 일일 미션 보상이 450 XP라는 뜻이지, 그 XP를 획득한 뒤 다른 정상 시즌 활동을 막는다는 뜻이 아니다. 스토리, 이벤트, 클럽, 수집, 학습, 캐치업 등 별도 유효 콘텐츠는 계속 XP를 지급할 수 있다.

저가치 반복행동은 계정 전체 상한보다 한계보상 감소를 사용한다.

```text
xp_multiplier(n) = max(floor_multiplier, 1 / sqrt(max(1, n)))
```

이 식은 튜닝 예시이며 고정 공식이 아니다.

### 3.5 시즌 토큰 발행 목표

기존 `500~700 ST`는 지갑 상한이 아니라 `CONTENT_BUDGET`이다. 정상적인 추가 콘텐츠, 보정지급, 향후 정책으로 더 많은 수량이 생겨도 저장할 수 있어야 한다.

### 3.6 Season Token -> Legacy Token 이월

기존 `20% 전환, 최대 100 ST` 중 고정 `100` 상한은 기본 무제한 정책과 충돌하므로 폐기 대상으로 분류한다.

기본 대체안:

```text
legacy_token_grant = floor(unused_season_token * configured_conversion_ratio)
```

계정별 고정 이월 최대치는 두지 않는다. Legacy Token 누적이 과도해질 경우 개인 상한 대신 아카이브 상점 가격, 점진적 명예비용, 추가 Legacy 소비처 또는 전체 공개 전환비율 조정으로 대응한다.

### 3.7 시즌 랭크 WLD 보상 상한

기존 `최대 500 WLD`는 플레이 제한이 아니라 **시스템 보상 예산**이다. 따라서 튜닝값으로 유지할 수 있다. 구현 필드 이름은 `reward_cap`보다 `reward_amount_by_tier` 또는 `reward_budget`을 사용해 의미 혼동을 줄인다.

### 3.8 고유 외형/트로피

`limit = 1`은 소유 자체가 본질적으로 유일한 경우에만 허용한다. 일반 구매횟수 제한보다 `UNIQUE(user_id, entitlement_code)` 같은 DB 유일성 제약을 사용한다.

### 3.9 실제 유한 이벤트 재고

실제 유한 재고만 허용한다. 필수 필드:

```text
scarcity_mode = finite
initial_stock
remaining_stock
stock_version
published_before_purchase = true
```

차감은 원자적으로 처리하고, 가짜 `몇 개 남음` 표시는 금지한다.

## 4. 하드캡 없는 경제 제어

플레이를 무제한 허용하려면 경제 제어가 더 강해야 한다. 인플레이션 해결을 플레이 차단으로 대신하지 않는다.

### 4.1 Faucet 규칙

각 faucet에 다음을 기록한다.

- 기본 지급량;
- 반복행동 family;
- 한계보상 곡선;
- 숙련/성장 의존성;
- 악용검증;
- 예상 일/주 발행량 분포;
- 보정/취소 transaction type.

### 4.2 자산 구간별 소비처

항상 여러 자산층에 소비처가 남아 있어야 한다.

- 입문: 100~5,000 WLD — 정체성·수집·꾸미기;
- 성장: 5,000~100,000 WLD — 공간·제작·직업·사업확장;
- 안정: 100,000~1,000,000 WLD — 갤러리·본사 모듈·아카이브·클럽/도시 프로젝트;
- 고자산: 1,000,000+ WLD — 명예공간·박물관·랜드마크 후원·레거시 프로젝트;
- 초고자산: 상한 없는 자발적 프로젝트 기여와 점진적 명예 건축.

이 값은 가격 튜닝 구간이지 참여자격 상한이 아니다.

### 4.3 인플레이션 대응 순서

운영자는 다음 순서로 대응한다.

1. 원장 데이터로 faucet/sink 원인 분석;
2. 매력적인 소비처 추가·개선;
3. 저가치 반복행동의 한계보상 조정;
4. 경제적으로 타당한 유지·시장·서비스 비용 조정;
5. 제작 콘텐츠 보상예산 조정;
6. 실제 안전/무결성 불변조건이 있는 경우에만 운영 하드리밋 사용.

정상적인 인플레이션 수정 목적으로 사용자 잔액을 몰래 몰수하지 않는다.

## 5. 경제 대시보드 추가지표

필수 지표:

- WLD 총 발행량;
- hard-sink 실제 소각량;
- 순발행량;
- hard-sink / faucet 비율;
- 소각과 분리된 transfer volume;
- 평균/중앙/P90/P95/P99 유동잔액;
- 상위 1%/10% 자산점유율;
- 소비처 카테고리별 소각비율;
- 상위 3개 소비처 집중도;
- 코호트별 실제 구매일수;
- 고자산층 잔액증가율;
- 한계보상 적용률;
- reason code별 보호한도 발동률;
- 보호장치 오탐/재시도 비율.

`보호한도 발동률`이 높다는 사실은 사용자가 너무 많이 플레이했다는 뜻이 아니라 운영 검토가 필요하다는 신호다.

## 6. 시장/시즌 공정성 경계

메인경제 부가 시즌 경쟁우위로 연결되면 안 된다. 시즌 시장경쟁은 동일조건의 격리된 계정을 사용한다. TradingView의 2026 Paper Trading 대회도 참가자마다 동일한 고정 파라미터의 별도 경쟁계정을 생성한다. Moneyverse도 이 격리 원칙을 유지하되 자체 가상시장 점수체계를 사용한다.

시즌 랭킹은 메인 WLD 잔액이나 구매력보다 학습·위험관리·격리된 챌린지 성과를 중심으로 한다.

## 7. 상점/설정 분리

영구적인 아이템 정체성과 운영중인 가격·판매설정을 분리한다. PlayFab Economy V2 Store도 Catalog 기본 가격을 Store에서 재정의할 수 있다.

Moneyverse는 다음을 분리한다.

- 안정적인 SKU identity;
- 버전관리되는 상점/이벤트/시즌 가격 config;
- effective-from/effective-to;
- 감사이력;
- 결제확정 전 표시가격;
- 멱등 구매정산.

이렇게 하면 사용자 하드캡을 만들지 않고도 경제조정이 가능하다.

## 8. DB/API 요구사항

### 8.1 정책 테이블

권장 구조:

```text
product_limit_policies(
  policy_key text primary key,
  mode text not null,
  value_bigint bigint null,
  reason_code text null,
  scope text null,
  reset_policy text null,
  config_version bigint not null,
  effective_from timestamptz not null,
  created_by uuid null,
  created_at timestamptz not null
)
```

검증조건:

- `mode='unlimited' => value_bigint IS NULL`;
- protection mode는 `reason_code` 필수;
- 음수 제한값 금지.

### 8.2 API 표현

사용자에게 정책표시가 필요한 경우:

```json
{
  "mode": "unlimited",
  "value": null,
  "reasonCode": null
}
```

보호 거절은 RFC 9457 계열 문제응답을 사용하되 악용탐지 내부정보를 노출하지 않는다.

## 9. 운영자 콘솔

초기에는 read-only **Limit & Protection Policy** 화면을 제공한다.

- policy key;
- mode/value;
- reason category;
- 영향기능;
- 발동률;
- 마지막 설정변경;
- config version;
- 사용자 표시 여부;
- 경제/성장 규칙인지 인프라/무결성 보호인지 구분.

향후 쓰기기능을 추가할 경우 강한 관리자 권한, 변경사유, before/after diff, 불변 감사로그를 요구한다.

## 10. 구현 전 정합성 검색

새 기능 구현 전 관련 문서/코드/config에서 다음을 검색한다.

- `max`;
- `cap`;
- `limit`;
- `daily`와 숫자;
- `per account`;
- `per user`;
- `carryover`;
- `inventory stock`;
- `open orders`;
- 정상 플레이만 막기 위한 `cooldown`.

검색결과는 기계적으로 삭제하지 말고 분류한다. 보안 rate limit, 멱등성, payload bound, 실제 시장무결성 보호는 유지한다.

## 11. 분석 이벤트

최소 이벤트:

- `limit_policy_evaluated`;
- `protection_guard_triggered`;
- `protection_guard_released`;
- `diminishing_reward_applied`;
- `scarce_inventory_purchase_attempted`;
- `scarce_inventory_sold_out`;
- `economy_sink_purchase_completed`;
- `season_content_budget_exhausted` — 콘텐츠상태일 뿐 계정 잠금이 아님.

클라이언트에 숨은 악용탐지 세부정보를 보내지 않는다.

## 12. 완료조건

수치형 기준이 있는 기능은 다음을 만족해야 완료다.

- 승인된 분류 중 하나를 가짐;
- 정상 진행은 `null/unlimited` 기본;
- 보호값은 명확한 reason code 보유;
- 보호장치는 서버 권위·관측 가능;
- 실제 희소성은 구매 전에 공개;
- 콘텐츠예산이 계정 전체 플레이잠금으로 구현되지 않음;
- 임의 하드캡 없이 WLD 발행영향을 모델링;
- hard sink / transfer / converter 회계 분리;
- 영문/한국어 문서 동등;
- `null/unlimited`, 경계값, 멱등 재시도, 보호모드 테스트 포함.

## 13. 조사 참고자료

- EVE Online, *Monthly Economic Report — August 2026*, 2026-09-09 공개. 경제활동 및 원시데이터를 지속적으로 공개하는 사례를 참고해 Moneyverse도 플레이 제한으로 인플레이션을 숨기기보다 발행·소각·가격/경제신호를 관측한다: https://www.eveonline.com/news/view/monthly-economic-report-august-2026
- TradingView, *The Leap by AMP Futures — September 2026*. 대회별 별도 Paper Trading 계정과 고정된 동일조건을 사용하는 구조를 참고한다: https://www.tradingview.com/the-leap/amp-futures-september-2026/ 및 https://www.tradingview.com/the-leap/amp-futures-september-2026/rules/
- Microsoft PlayFab, *Economy V2 Stores*. Store가 Catalog 기본 가격을 재정의할 수 있는 구조를 참고해 안정적인 SKU와 운영가격을 분리한다: https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/catalog/stores
