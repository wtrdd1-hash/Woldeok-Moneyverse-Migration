# 월덕 머니버스 — 유저 거래소·제작 시스템 기획 명세서

> 버전: v2026.09.12.16
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`, `PERSONAL_SPACES_CITY_PROJECTS_SPEC.md`
> 영문 기준 문서: [PLAYER_MARKETPLACE_CRAFTING_SPEC.md](PLAYER_MARKETPLACE_CRAFTING_SPEC.md)

## 0. 목적

기존 소비처 문서에 아이디어 수준으로 있던 유저 거래소와 제작 시스템을 실제 개발 가능한 계약 수준으로 구체화한다. 사용자의 플레이·거래·제작 횟수에는 임의의 하드캡을 기본으로 두지 않으면서 WLD hard sink와 유저 간 가치교환을 함께 만든다.

핵심 루프는 다음과 같다.

`획득/수집 -> 보유/사용 -> 제작/꾸미기 -> 판매 등록 -> 구매/판매 -> 전시/수집 -> 다시 제작`

거래소는 실제 증권시장이나 현금 거래소가 아니다. WLD와 아이템은 서비스 내부 가상 데이터이며 현금 환급권을 제공하지 않는다.

## 1. 제품 원칙

1. **기본 unlimited.** 일반 등록횟수·구매횟수·제작횟수·누적거래횟수 제한을 기본으로 두지 않는다.
2. **경제분류 정확성.** 구매자에서 판매자로 이동하는 원금은 `TRANSFER`, 등록·판매·감정·제작·복원 서비스 비용만 `HARD_SINK`로 집계한다.
3. **서버 권위.** 소유권, 거래가능성, 가격 견적, 수수료, 에스크로, 정산, 레시피 입력/출력은 서버가 결정한다.
4. **원자성.** 구매자가 돈만 잃고 아이템을 못 받거나 판매자가 돈을 받으면서 아이템을 유지하는 상태가 생기면 안 된다.
5. **멱등성.** 모든 상태 변경 요청은 멱등키 또는 결정적 operation key를 사용한다.
6. **P2W 거래 금지.** 경쟁·경제를 압도하는 핵심 파워 아이템은 거래소가 있다고 자동으로 거래 가능해지지 않는다.
7. **숨은 확률 판매 금지.** 랜덤 제작은 확률 공개가 필수이며 실결제 기반 반복 확률 구매는 별도 검토 없이는 금지한다.
8. **가짜 희소성 금지.** 실제 유저가 1개를 등록한 경우의 희소성과 시스템이 인위적으로 만드는 가짜 품절을 구분한다.
9. **수수료 투명성.** 확정 전에 구매자 총지출과 판매자 순수령액을 표시한다.
10. **학습정보 무료.** 거래기록·수수료 설명·위험안내·사기예방 안내는 유료화하지 않는다.

## 2. 아이템 거래정책

각 아이템 정의와 인스턴스는 명시적인 이전 정책을 가져야 한다.

| 정책 | 의미 | 거래소 | 직접이전 | 예시 |
|---|---|---|---|---|
| `ACCOUNT_BOUND` | 계정 귀속 | 불가 | 불가 | 시즌 랭크 트로피 |
| `SYSTEM_ONLY` | 시스템 권리형 | 불가 | 불가 | 계정 테마 권리 |
| `TRADABLE_SINGLE` | 고유 인스턴스 거래 | 가능 | 향후 선택 | 서명 수집품 |
| `TRADABLE_STACK` | 수량형 재료 거래 | 가능 | 향후 선택 | 일반 제작재료 |
| `TRADABLE_AFTER_COOLDOWN` | 무결성 대기 후 거래 | 시간 후 | 시간 후 | 신규 제작 고급 장식 |
| `SEASON_RESTRICTED` | 시즌 정책에 따름 | config | config | 현 시즌 수집품 |
| `CLUB_BOUND` | 클럽 귀속 | 클럽 흐름만 | 개인이전 불가 | 클럽 트로피 |

프론트 카테고리명으로 거래 가능 여부를 추론하지 않는다.

### 2.1 권장 아이템 인스턴스 필드

```text
item_instance_id
catalog_item_id
owner_type            USER | CLUB | SYSTEM_ESCROW
owner_id
quantity
transfer_policy
bound_reason nullable
crafted_by_user_id nullable
crafted_at nullable
season_id nullable
provenance_version
condition_state
appearance_variant
custom_label nullable
tradable_after nullable
metadata_version
created_at
updated_at
```

고유 아이템은 소유자가 바뀌어도 제작자·획득이력 등 provenance를 삭제하지 않는다.

## 3. 거래소 P0 범위

P0은 **고정가격 등록 방식**만 사용한다.

포함:

- 검색/필터/정렬;
- 아이템 상세 및 출처 요약;
- 판매 등록;
- 등록 취소;
- 구매;
- 판매자 정산기록;
- 구매기록;
- 최근 체결가격 요약;
- 수수료 미리보기;
- 무결성 검토 상태.

P0 제외:

- 레버리지/신용/공매도;
- 현금 정산;
- 아이템 대여;
- 블라인드 확률 경매;
- 영국식/네덜란드식 경매;
- 외부 결제 링크;
- 유저 임의 계약 스크립트.

매수주문은 P0 정산·어뷰징 탐지가 안정화된 후 P1/P2에서 검토한다.

### 3.1 판매 등록 횟수 기본 무제한

일반 계정의 active listing 개수에 제품용 하드캡을 두지 않는다. 규모는 다음으로 관리한다.

- 의미 있는 등록수수료;
- API burst/rate 보호;
- pagination/indexing;
- 반복 복제 등록 탐지;
- 자동화·봇 이상행위 탐지;
- payload/batch 안전제한.

향후 인프라 보호를 위해 안전상한이 필요하다면 그것은 게임 성장 제한이 아니라 시스템 보호 한도로 문서화한다.

## 4. 판매글 상태머신

정상 흐름:

`DRAFT -> ACTIVE -> RESERVED -> SETTLEMENT_PENDING -> SETTLED`

종료/예외 흐름:

- `ACTIVE -> CANCELLED`
- `ACTIVE -> EXPIRED`
- `ACTIVE -> BLOCKED`
- 예약 결제 실패 시 `RESERVED -> ACTIVE`
- 무결성 문제 시 `SETTLEMENT_PENDING -> REVIEW_REQUIRED`
- 검토 후 `REVIEW_REQUIRED -> SETTLED | CANCELLED`

상태 의미:

- `DRAFT`: 견적/확정 전.
- `ACTIVE`: 아이템이 에스크로로 이동하고 검색 가능.
- `RESERVED`: 특정 구매 시도에게 짧은 정산 우선권 부여.
- `SETTLEMENT_PENDING`: 원장·소유권 정산 중.
- `SETTLED`: 구매자 소유권 이전, 판매자 순액 지급, 수수료 소각 완료.
- `CANCELLED`/`EXPIRED`: 미판매 에스크로를 정확히 판매자에게 반환.
- `BLOCKED`: 무결성 검토로 공개만 중지하고 소유 추적은 유지.

예약시간 예시는 30초이며 동시성 보호용 config다. 사용자 플레이 한도가 아니다.

## 5. 수수료와 소비처

### 5.1 등록수수료

계획식:

`listing_fee = max(25 WLD, ceil(list_price * 0.001))`

분류: `HARD_SINK`
원장유형: `SINK_LISTING_FEE`

목적은 무의미한 스팸을 억제하면서 정상 판매자를 횟수 제한하지 않는 것이다.

일반 취소 때는 반환하지 않는다. 시스템 장애 때문에 ACTIVE 상태까지 한 번도 가지 못한 경우에는 멱등적으로 환불한다.

### 5.2 판매수수료

초기 계획값:

`sale_fee = ceil(sale_price * 0.01)`

분류: `HARD_SINK`
원장유형: `SINK_MARKETPLACE_FEE`

판매자 순수령:

`seller_net = sale_price - sale_fee`

구매자가 판매자에게 지급하는 원금은 `TRANSFER_MARKETPLACE_PAYMENT`로 기록하고 소각량으로 계산하지 않는다.

### 5.3 감정 서비스

고가 수집품에는 선택형 시스템 감정 서비스를 제공할 수 있다.

`appraisal_fee = max(250 WLD, ceil(reference_value * 0.0025))`

가격 범위·출처 요약을 제공할 뿐 미래 판매가를 보장하지 않는다.

## 6. 가격발견

일반 거래가능 수집품에 임의의 가격 상한/하한을 기본 적용하지 않는다.

대신 다음 정보를 제공한다.

- 최근 정상 체결 20건;
- rolling median;
- P25/P75 가격대;
- 7일/30일 체결량;
- 현재 등록건수;
- 상태/외형/시즌별 필터;
- 최근 정상가격과 지나치게 차이나는 경우 사실형 경고.

참고가격은 차단 규칙이 아니라 정보다. 다만 어뷰징 정책상 무결성 검토 대상이면 별도 hold를 사용할 수 있다.

## 7. 원자적 구매 정산

한 번의 성공 구매는 하나의 논리 트랜잭션으로 처리한다.

1. 구매자 인증;
2. listing 상태 확인;
3. buyer != seller 확인;
4. listing row/version lock;
5. 에스크로 소유권/수량 재확인;
6. listing에 잠긴 config version 기준 수수료 계산;
7. 구매자 WLD 확인;
8. 구매자 원금 차감;
9. 판매수수료 소각;
10. 판매자 순액 지급;
11. 에스크로에서 구매자에게 아이템 이전;
12. listing `SETTLED`;
13. 정산·원장·provenance 이벤트 기록;
14. analytics/outbox 기록;
15. 1회 commit.

커밋 전 실패하면 모든 경제 변경을 롤백한다.

### 7.1 멱등키

권장 키:

- 등록: `market_list:{seller_id}:{client_operation_uuid}`
- 취소: `market_cancel:{listing_id}:{client_operation_uuid}`
- 구매: `market_buy:{buyer_id}:{listing_id}:{client_operation_uuid}`
- 정산: `market_settle:{listing_id}:{settlement_version}`

같은 키+같은 payload는 원결과를 반환한다. 같은 키+다른 payload는 conflict 처리한다.

## 8. 에스크로

ACTIVE가 되면 판매 대상 아이템/수량은 논리적 `SYSTEM_ESCROW`로 이동한다.

규칙:

- 판매자는 에스크로 물품을 사용·제작·분해·재등록·이전할 수 없음;
- 에스크로는 시스템 자산이 아니라 정산을 위한 보관 상태;
- 취소/만료 때 동일 인스턴스/수량/출처를 반환;
- 고유아이템 메타데이터는 에스크로 중 변경불가;
- 정합성 작업이 orphan escrow를 탐지;
- 불일치가 생겨도 아이템을 임의 복제해 복구하지 않는다.

## 9. 제작 시스템

제작은 기본적으로 `CONVERTER + WLD HARD_SINK 수수료`다.

### 9.1 P0 레시피 종류

1. 색상변경
2. 수집품 복원
3. 각인
4. 중복 수집품 합성
5. 가구 제작
6. 아카이브 복원
7. 사업체 장식 제작

### 9.2 레시피 계약

```yaml
recipe_code: CRAFT_CITY_DISPLAY_01
version: 1
enabled: true
season_id: null
inputs:
  - item_code: MAT_CITY_METAL
    quantity: 4
  - item_code: MAT_CITY_GLASS
    quantity: 2
wld_fee: 1200
output:
  item_code: DEC_CITY_DISPLAY_01
  quantity: 1
transfer_policy: TRADABLE_SINGLE
randomized: false
cooldown_seconds: null
max_per_user: null
starts_at: null
ends_at: null
```

`max_per_user`, `cooldown_seconds`는 기본 `null`이다. 무결성·실제 콘텐츠 이유로 값이 들어가면 이유를 문서화한다.

### 9.3 제작 트랜잭션

한 제작 요청에서 원자적으로 처리한다.

- 레시피/config version 확인;
- 재료 소유권/수량 확인;
- 에스크로/잠금 여부 확인;
- WLD 제작비 소각;
- 재료 소비;
- output 생성;
- 제작자/레시피/버전 provenance 기록;
- analytics/outbox 발생.

output 생성 실패 시 재료와 WLD도 함께 롤백한다.

### 9.4 결정형 우선

P0 제작은 결정형이다. 랜덤 제작은 향후 도입 시 다음 조건을 모두 지켜야 한다.

- 확률 사전 공개;
- 숨은 pity/reset 금지;
- 기대 비용 문서화;
- 실패 결과도 가능하면 유용한 잔여가치 제공;
- 실결제 기반 확률 반복은 별도 검토.

## 10. 재료·중복아이템 경제

중복 소유에 사용처가 있다면 중복을 허용한다.

재료 공급원:

- 작업/사업 콘텐츠;
- 보유 중복아이템 분해;
- 시즌/이벤트 목표;
- 명시적으로 허용된 도시프로젝트 보상;
- 비P2W 시스템 상점 재료팩;
- 거래가능 제작재료의 유저 거래소.

### 10.1 분해

분해는 아이템을 재료로 바꾸며 소액 서비스비를 붙일 수 있다.

`dismantle_fee = max(50 WLD, floor(reference_material_value * 0.01))`

확정 후 되돌릴 수 없으며 결정형 분해는 정확한 산출물을 미리 보여준다.

## 11. 추가 소비처 카탈로그

| 코드 | 서비스 | 분류 | 초기 가격 | 반복 | 가치 | 원장유형 |
|---|---|---|---:|---|---|---|
| `CRAFT-DISMANTLE` | 분해 서비스 | HARD_SINK + CONVERTER | 50+ WLD | unlimited | 중복→재료 | `SINK_CRAFT_FEE` |
| `CRAFT-REPAIR-PRESTIGE` | 고급 수집품 복원 | HARD_SINK | 5,000 | 상태별 | 전시품질 | `SINK_COLLECTIBLE_RESTORATION` |
| `CRAFT-ENGRAVE-PRESTIGE` | 프리미엄 각인 | HARD_SINK | 3,000 | unlimited | 출처/표시 | `SINK_ITEM_ENGRAVING` |
| `CRAFT-FURN-SET` | 가구 세트 조립 | HARD_SINK | 2,500 | unlimited | 공간 꾸미기 | `SINK_CRAFT_FEE` |
| `CRAFT-BIZ-SIGN` | 사업체 맞춤 장식 | HARD_SINK | 4,000 | unlimited | 사업 정체성 | `SINK_CRAFT_FEE` |
| `CRAFT-ARCHIVE-RESTORE` | 과거 시즌 외형 복원 | HARD_SINK | 7,500 | 레시피 기간 | 수집 | `SINK_CRAFT_FEE` |
| `MARKET-APPRAISE` | 출처/가격 감정 | HARD_SINK | 수식 | unlimited | 정보/아카이브 | `SINK_MARKETPLACE_SERVICE` |
| `MARKET-FEATURE` | 추천 판매글 시각노출 | HARD_SINK | 500 | 반복 | 검색 노출 | `SINK_MARKETPLACE_SERVICE` |

추천 판매글은 발견성을 높일 뿐 체결우선권·아이템 품질·가격을 조작하지 않는다.

## 12. 시즌 연계

시즌 아이템은 각각 다음 중 하나를 명시한다.

- 영구 계정귀속;
- 시즌 중 거래가능;
- 시즌 ARCHIVED 이후 거래가능;
- 무결성 대기시간 후 거래가능;
- 거래불가지만 아카이브 재료 변환 가능.

시즌 랭킹 보상은 기본 `ACCOUNT_BOUND`다.

각 시즌은 다음을 권장한다.

- 테마형 결정 레시피 5~10개;
- 주거/사업장식 제작군 1개 이상;
- 중복아이템 변환 경로;
- 시즌 종료 전에 공개되는 archive 복원 경로;
- 경쟁력과 무관한 WLD 제작 소비처.

D-14/D-7/D-3/D-1에는 만료 레시피, 아카이브 이동 레시피, 시즌 종료 후 거래가능 여부, 유지 재료, 거래소에 사용할 수 없는 시즌 재화를 표시한다.

Season Token과 League WLD는 거래소 결제통화로 사용할 수 없다.

## 13. 개인공간·도시프로젝트 연계

제작한 가구/수집품은 실제 소유권이 있을 때 개인공간에 전시한다.

도시프로젝트는 다음 방식으로 제작과 연결할 수 있다.

- 글로벌 달성단계가 새 레시피를 해금;
- 기여 보상은 계정귀속 배지/레시피 장식 중심;
- 도시기부 WLD는 계속 `HARD_SINK`이며 판매자 수익이 되지 않음;
- 공동기념물은 계정/클럽 전시정책에 따름.

## 14. 화면 구조

1. **발견** — 최근, 컬렉션 빈칸, 시즌/아카이브.
2. **찾아보기** — 카테고리·태그·상태·시즌·가격 필터.
3. **아이템 상세** — 정의, 인스턴스 출처, 최근 체결정보, 판매목록.
4. **판매** — 아이템/수량, 가격입력, 수수료/순수령 미리보기, 에스크로 확정.
5. **내 판매글** — ACTIVE/RESERVED/SOLD/EXPIRED/CANCELLED/REVIEW.
6. **거래기록** — 구매·판매·수수료·소유권 변경.
7. **제작** — 레시피, 보유재료, 부족재료, 정확한 비용/결과.

필수 UI 상태:

- loading;
- stale quote/version;
- 잔액부족;
- 이미 판매됨;
- 에스크로/잠금;
- 정책 제한;
- review required;
- 멱등 재생 성공;
- 복구가능 서버오류.

실제 만료시각은 표시하되 과도한 공포/FOMO 문구는 사용하지 않는다.

## 15. 어뷰징 방지

차단/검토 패턴:

- 자기 자신에게 구매;
- 연계계정 자전거래;
- 가격·거래량을 조작하는 원형거래;
- 의미 없는 초고속 왕복거래;
- 참고가격 오염 목적 거래;
- 중복 정산;
- 동시성 기반 아이템 복제;
- 에스크로 우회;
- 예약/정산 중 취소;
- 봇 등록 폭주;
- 비정상 보상 세탁.

위험신호:

- 반복 거래상대;
- 계정 연계 위험군;
- 정상가격 분포 이탈;
- 취소/재등록 과다;
- 높은 circular-flow score;
- 비정상 정산 속도;
- 동일 아이템 왕복;
- 신규계정 고액거래;
- 관리자 수동소유 변경 이력.

위험신호는 자동 몰수와 동일하지 않다. 필요 시 listing 또는 수익만 임시 검토상태로 두며 관련 없는 영구자산을 조용히 몰수하지 않는다.

## 16. 권장 DB 모델

`marketplace_listings`

- 판매자, 아이템/카탈로그, 수량, 단가, 등록수수료, 판매수수료bps, 상태, config version, 예약자/예약기한, 만료/정산시각, optimistic version.

`marketplace_settlements`

- listing, buyer/seller, gross WLD, fee WLD, seller net, buyer/seller/fee ledger tx, item transfer event, idempotency key, settlement version.

`marketplace_price_history`

- 정상 체결로부터 파생한 read model. 소유권 원본으로 사용하지 않는다.

`marketplace_integrity_cases`

- 검토상태, 증거참조, 판정, 관리자 감사정보.

`crafting_recipes`, `crafting_recipe_inputs`, `crafting_recipe_outputs`, `crafting_operations`를 별도 관리한다.

기존 적용 마이그레이션은 수정하지 않고 실제 구현에서는 forward-only migration을 추가한다.

## 17. 권장 API

- `GET /api/marketplace/listings`
- `GET /api/marketplace/listings/:id`
- `POST /api/marketplace/listings`
- `POST /api/marketplace/listings/:id/cancel`
- `POST /api/marketplace/listings/:id/buy`
- `GET /api/marketplace/me/listings`
- `GET /api/marketplace/me/history`
- `GET /api/marketplace/items/:catalogItemId/price-history`
- `GET /api/crafting/recipes`
- `GET /api/crafting/recipes/:code`
- `POST /api/crafting/recipes/:code/craft`
- `POST /api/crafting/items/:itemInstanceId/dismantle`

변경 API 응답은 가능하면 commit 후 authoritative 잔액/인벤토리를 반환한다. 클라이언트가 자체 계산해 잔액을 만들지 않는다.

## 18. 관리자 콘솔

필수 기능:

- 유저/아이템/listing/ledger tx/idempotency key 검색;
- 판매글 사유 포함 freeze/unfreeze;
- 에스크로 소유권 확인;
- 가격이상치 확인;
- 무결성 case 검토;
- 수수료 bps/floor 버전관리;
- 레시피 활성/기간 설정;
- 제작 경제 영향 미리보기;
- orphan escrow/settlement mismatch read-only 대사;
- 승인된 서버 함수만 통한 감사 가능한 복구;
- 거래소 burn vs transfer export.

보호된 원장 row를 직접 수정하거나 소유권을 조용히 생성하지 않는다.

## 19. 경제 대시보드

추가 지표:

- marketplace GMV (`TRANSFER`);
- 등록수수료 소각;
- 판매수수료 소각;
- 감정/추천서비스 소각;
- 제작수수료 소각;
- 재료 파괴량;
- 제작 output 수량;
- active listings;
- 고유 판매자/구매자;
- sell-through rate;
- 중앙 판매시간;
- 아이템군별 중앙/P90 가격;
- 7d/30d price index;
- 상위 1%/10% seller GMV 점유율;
- 반복상대방 거래비율;
- wash/circular 의심 거래량;
- 취소/재등록률;
- 에스크로 대사오류;
- 멱등 재생 건수;
- 자산구간별 제작 사용률;
- 자산구간별 sink 기여.

거래총액을 소각량으로 집계하지 않는다.

## 20. 분석 이벤트

`marketplace_opened`, `marketplace_search_performed`, `marketplace_listing_quote_viewed`, `marketplace_listing_created`, `marketplace_listing_cancelled`, `marketplace_listing_expired`, `marketplace_purchase_started`, `marketplace_purchase_settled`, `marketplace_purchase_conflict`, `marketplace_integrity_hold`, `craft_recipe_viewed`, `craft_started`, `craft_completed`, `craft_failed`, `item_dismantled`, `craft_input_missing`를 최소 이벤트로 둔다.

각인 자유문구 같은 불필요한 개인 콘텐츠는 분석 이벤트에 넣지 않는다.

## 21. 설정 예시

```yaml
marketplace:
  enabled: true
  listing_count_limit: null
  listing_fee:
    fixed_floor_wld: 25
    bps: 10
  sale_fee_bps: 100
  reservation_seconds: 30
  default_expiry_days: 7
  price_warning_deviation_multiplier: 5
  featured_listing_fee_wld: 500
  integrity:
    self_trade_block: true
    circular_trade_review_enabled: true
crafting:
  enabled: true
  craft_count_limit: null
  deterministic_first: true
  require_idempotency_key: true
```

`listing_count_limit`와 `craft_count_limit` 기본값은 `null`이다. API rate limit는 제품 성장 config가 아니라 보안/인프라 config에서 관리한다.

## 22. 구현 단계

### P0

- 거래정책 flag;
- 고정가격 판매;
- 에스크로;
- 원자정산;
- 등록/판매 hard sink;
- 결정형 제작;
- 분해;
- 기록/감사;
- 기본 무결성 검사;
- 관리자 검색/freeze;
- 경제지표.

### P1

- 가격이력 UI;
- 추천노출;
- provenance 감정;
- 시즌/아카이브 레시피;
- 개인공간 제작아이템;
- 고급 연계거래 탐지;
- 거래소 알림/관심목록.

### P2

P0/P1 데이터가 안전성을 입증한 뒤에만:

- 매수주문;
- 수집품 시장분석;
- 정책형 클럽 인벤토리 교환;
- 고급 제작 의뢰.

어떤 고급기능도 원장/에스크로 원자성 모델을 우회할 수 없다.

## 23. 완료조건

실제 구현은 다음이 모두 통과해야 완료다.

- 판매/제작 횟수에 임의 사용자 하드캡 없음;
- 거래가능 여부 서버 권위;
- buyer/seller/self-trade 권한테스트;
- 에스크로 이중사용 방지;
- 동시 구매자 중 정확히 1건만 정산;
- buy/list/cancel 재시도 멱등성;
- 구매자 차감·판매자 지급·수수료소각·소유권이전 완전 대사;
- 실패 시 전체 rollback;
- `HARD_SINK`와 `TRANSFER` 경제지표 분리;
- 제작 입력소비/출력생성 원자성;
- 결정형 레시피 정확결과;
- 랜덤 제작 도입 시 확률 공개·별도 검토;
- 어뷰징 탐지가 관련 없는 자산을 자동몰수하지 않음;
- 실제 PostgreSQL migration parity 통과;
- 영문/한국어 문서 parity;
- 정확한 candidate SHA를 격리 Test 서버에 배포;
- Test에서 백엔드 기동/API/동시성/멱등성/원장대사/대표 사용자흐름 검증;
- 검증한 정확한 revision만 운영 승격.

## 24. 최신 자료 반영 근거

- Microsoft PlayFab Economy V2는 카탈로그/인벤토리 분리, 아이템 이전, 원자적 다중 인벤토리 작업, 거래기록과 멱등성 패턴을 제공한다.
- 현재 PlayFab Economy V2 문서에서는 제작도 명시적인 add/subtract/transfer/purchase 조합 기반 인벤토리 변환으로 구현할 수 있다.
- EVE Online 2026 Monthly Economic Report는 계속 faucet과 sink를 분리해 경제를 분석한다. Moneyverse 역시 유저간 거래량과 실제 소각을 반드시 분리한다.

외부 서비스의 API 제한은 신뢰성 참고사항일 뿐 Moneyverse 사용자 플레이 한도 정책의 근거로 사용하지 않는다.