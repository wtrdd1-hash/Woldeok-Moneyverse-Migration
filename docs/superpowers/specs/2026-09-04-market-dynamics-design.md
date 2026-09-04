# 가상 주식 시장 동역학 v2 — 방향성 · 수요와 공급 · 변동성

작성일 2026-09-04. 마이그레이션 `124-market-dynamics.sql`의 설계 근거.

## 무엇이 문제였나

052/053의 `stock_market_live_tick`은 1초마다 종목별로

```
shock = (random() - 0.5) * 0.006        -- ±0.3 %, 균등분포
drift = -0.05 * (price / day_open - 1)   -- 당일 시가로 되돌리는 힘
price = price * (1 + shock + drift), 시가 ±30 % 안으로 자름
```

을 적용했다. 세 가지가 어긋난다.

1. **방향이 없다.** 유일한 힘이 "당일 시가로 돌아가라"이므로 하루 안에서는
   평균 회귀만 있고, 어제와 오늘을 잇는 추세도, 시장 전체의 분위기도 없다.
   호재·악재를 낼 자리가 없다.
2. **수요·공급이 없다.** 매수 1건은 수량과 무관하게 +1 %, 매도는 -1 %다
   (`stock_trade`). 1주를 사도 100만 주를 사도 같다. 유통 주식수(053)가 있는데
   가격에 쓰이지 않는다.
3. **변동성이 너무 크다.** 초당 ±0.3 % 균등 충격은 초당 표준편차 0.17 %,
   분당 1.3 %, 시간당 10 %에 해당한다. 실제 주식은 **하루** 1~3 %다. 1분봉이
   위아래로 긴 꼬리를 달고 요동치는 스크린샷이 그 결과다.

## 모형

시간 단위는 1초(틱)와 1분(체제)이다. 모든 계수는 `virtual_stock_market_params`
한 행에 있고 마이그레이션 없이 바꿀 수 있다. 아래 값은 기본값이다.

### 상태

| 테이블 | 행 | 내용 |
|---|---|---|
| `virtual_stock_market_regime` | 1 | `market_trend_bps` — 시장 전체 방향(하루당 bp). 1분마다 갱신 |
| `virtual_stock_dynamics` | 종목당 1 | `price_exact`(소수 가격), `fair_value`(적정가), `trend_bps`(종목 추세), `vol_bps`(현재 일변동성) |
| `virtual_stock_market_events` | 사건당 1 | 뉴스·호재·악재. 대상 종목(없으면 시장 전체), 방향, 강도, 기간 |

`price_exact`를 따로 두는 이유: `current_price`는 정수(bigint)라 1,000 WLD짜리
종목은 초당 0.01 % 움직임이 0.1 WLD, 즉 반올림하면 0이다. 걷기는 소수로 이어
가고 표시할 때만 반올림한다.

### 1분마다 — 체제(regime)

Ornstein–Uhlenbeck 과정으로, 평균으로 천천히 돌아가면서 잡음을 받는다.

```
market_trend = clamp(market_trend * (1 - 0.001) + 5 * N(0,1),  ±200 bp/day)
trend_i      = clamp(trend_i      * (1 - 0.003) + 15 * N(0,1), ±400 bp/day)
ln vol_i     = ln vol_i * (1 - 0.02) + ln(300) * 0.02 + 0.08 * N(0,1)
vol_i        = clamp(exp(ln vol_i), 100, 1000 bp/day)
```

- 시장 추세는 반감기 약 11시간, 정상 표준편차 약 110 bp/day. 종목 추세는
  반감기 약 4시간, 표준편차 약 190 bp/day. 즉 "오늘 오전은 오르는 분위기"가
  몇 시간 지속되다 바뀐다.
- 변동성은 로그 공간에서 300 bp/day(하루 3 %)로 돌아가며 100~1000 사이를
  오간다. 조용한 시간과 요동치는 시간이 번갈아 생긴다(변동성 군집).

### 1초마다 — 걷기

```
μ   = (trend_i + β·market_trend + Σ 활성 사건 drift) / 10000 / 86400
σ   = (vol_i / 10000) / sqrt(86400) * max(활성 사건 vol_multiplier)
fair  = fair * (1 + μ)                              -- 적정가가 방향을 따라 움직인다
fair += (price_exact - fair) * absorb                -- 가격과의 차이 일부를 흡수(반감기 12h)
pull  = (fair / price_exact - 1) * κ                 -- 적정가로 되돌리는 힘(반감기 4h)
price_exact = price_exact * (1 + pull + σ·N(0,1))
price_exact = clamp(price_exact, day_open ± 30 %, ≥ 10)
current_price = round(price_exact)
```

방향은 적정가에 실리고, 가격은 적정가 주위를 확률적으로 돈다. 기본 일변동성
3 %는 실제 시장보다 조금 크고 이전보다 훨씬 작다. 초당 표준편차로는 0.01 %,
가격 100,000 WLD 종목이라면 초당 약 10 WLD, 1분봉 폭 수십~수백 WLD다.

### 매매 — 수요와 공급 (`stock_trade`)

```
impact_bps = min(500, 150 * (수량 / 발행주식수 * 100))    -- 유통량 1 %를 사면 +150 bp
next = round(price * (1 ± impact_bps / 10000)), 당일 밴드 안으로
fair += (next - price) * 0.3                             -- 30 %는 영구적으로 적정가에 남는다
```

- 큰 주문이 더 많이 움직이고, 작은 주문은 거의 움직이지 않는다.
- 일회성 충격의 70 %는 몇 시간에 걸쳐 되돌아오고 30 %는 남는다. 같은 방향의
  주문이 이어지면 적정가가 그쪽으로 이동한다 — 이것이 수요·공급이다.
- 117의 거래소 서킷브레이커(`market_circuit_broken`) 또는 마스터 킬스위치가
  켜져 있으면 매매는 55000(→ 409)으로 거절되고 틱도 움직이지 않는다.

### 사건 — 뉴스, 호재, 악재

운영자(`operator`)가 `stock_market_event_publish`로 낸다. 강도 1·2·3은
하루당 300·800·2000 bp의 drift와 1.2·1.5·2.0의 변동성 배수다. 기간은 1~168시간.
대상 종목이 없으면 시장 전체에 걸린다. 취소는 `stock_market_event_cancel`.
회원은 `stock_market_events_active`로 진행 중인 사건만 본다.

이것이 AI 뉴스 시나리오의 접점이다. AI는 시나리오를 **제안**하고, 운영자가
고른 것이 이 함수로 들어가면 그 순간부터 시장이 그 방향으로 기운다. 사건은
`source = 'ai'`로 구분된다.

### 손으로 정한 가격, 액면분할

`stock_admin_set_price`나 분할이 `current_price`를 바꾸면 다음 틱에서
`price_exact`와 `fair_value`가 같은 비율로 따라간다. 운영자가 정한 가격은
적정가가 되고, 옛 적정가로 끌려가지 않는다.

## 기본값과 튜닝

| 계수 | 기본 | 뜻 |
|---|---|---|
| `base_vol_bps` | 300 | 일변동성이 돌아가는 곳 |
| `vol_floor_bps` / `vol_ceiling_bps` | 100 / 1000 | 일변동성의 범위 |
| `trend_cap_bps` / `market_trend_cap_bps` | 400 / 200 | 추세의 상한(하루당) |
| `fair_reversion_half_life_seconds` | 14400 | 가격이 적정가로 절반 돌아가는 시간 |
| `fair_absorb_half_life_seconds` | 43200 | 적정가가 가격 쪽으로 절반 다가가는 시간 |
| `impact_bps_per_float_percent` / `impact_cap_bps` | 150 / 500 | 주문의 즉시 영향 |
| `impact_permanent_share` | 0.3 | 영구히 남는 몫 |
| `day_range_cap_bps` | 3000 | 당일 밴드(052와 같다) |

너무 조용하면 `base_vol_bps`를, 추세가 약하면 `trend_noise_bps_per_minute`를
올린다. 행은 `moneyverse_app`이 읽을 수 없고 갱신 함수는 이 마이그레이션에
없다 — 운영 화면에서 만질 일이 생기면 그때 함수를 낸다.

## 검증

- 파라미터 행, 체제 행, 종목별 동역학 행이 마이그레이션 직후 존재한다.
- 틱 한 번은 활성 종목 수 이하를 반환하고 모든 가격을 당일 밴드 안에 둔다.
- 서킷브레이커가 켜지면 틱은 0을 반환하고 가격이 변하지 않는다.
- 운영자가 아니면 사건을 낼 수 없다(42501). 낸 사건은 `stock_market_events_active`에
  보이고 취소하면 사라진다.
- 같은 키로 두 번 내면 같은 영수증이 돌아온다(replayed).
