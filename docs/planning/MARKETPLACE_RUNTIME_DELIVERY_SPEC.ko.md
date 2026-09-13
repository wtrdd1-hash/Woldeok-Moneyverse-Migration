# Woldeok Moneyverse — 마켓플레이스 런타임 전달 및 신뢰 명세

> 버전: v2026.09.13.21
> 상태: Living implementation-delivery companion
> 기준일: 2026-09-13
> 상위 명세: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`, `INVENTORY_ENTITLEMENT_INTEGRITY_SPEC.md`, `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md`
> 영문 canonical: [MARKETPLACE_RUNTIME_DELIVERY_SPEC.md](MARKETPLACE_RUNTIME_DELIVERY_SPEC.md)

## 0. 목적

이 문서는 완성형 Player Marketplace & Crafting 설계와 실제 단계적 런타임 전달 경로를 연결한다. 기존 제품 명세는 목표 계약으로 유지하고, 권위 있는 inventory·escrow·settlement·provenance·ledger 계약이 없는 상태에서 mutation UI가 먼저 노출되지 않도록 전달 순서를 정의한다.

핵심 원칙은 **클라이언트에서 가짜 마켓플레이스를 만들지 않는 것**이다. 읽기 전용 inventory/workbench는 거래 기능보다 먼저 제공할 수 있지만, 판매 등록·구매·이전·에스크로·제작 버튼은 서버/DB 불변식이 존재하고 격리 Test 검증을 통과한 이후에만 활성화한다.

## 1. 현재 런타임 현실

기획 시작 시점 최신 `main`: `6ad8304ac743366ae8b9bc445934160b0eaecdee`.

열린 런타임 후보 PR #225 (`feat/marketplace-workbench-v2026.09.13.20`, head `54ea358a30845117aca97412f854cebd83440971`)는 **아직 병합되지 않았으며 Production 동작으로 기록하면 안 된다**.

해당 후보가 의도적으로 제공하는 범위는 다음뿐이다.

- 로그인 회원 전용 + `noindex` `/marketplace` workbench;
- 기존 권위 read API `GET /api/v1/shop/holdings` 사용;
- 보유 수량·카테고리·serialized instance 표시;
- 로그인 상태의 `/shop`에서 진입 링크 제공;
- listing·purchase·transfer·escrow·settlement·price write·crafting mutation 없음.

서버/DB 마켓플레이스 계약이 아직 없으므로 이 형태가 올바른 fail-closed 단계다.

이번 기획 회차에서 `easy-scraping.com` 외부 런타임 확인은 `HTTP 530`으로 불가능했다. 따라서 workbench나 기타 marketplace 기능이 현재 운영 배포되었다고 주장하지 않는다.

## 2. 전달 단계

### R0 — 권위 inventory workbench

목표: 사용자가 자신이 실제로 보유한 것과 향후 marketplace/crafting에 참여할 수 있는 후보 item을 안전하게 확인한다.

필수 조건:

- 기존 권위 source에서 inventory를 읽는다;
- serialized instance를 구분한다;
- ownership을 client state에서 합성하지 않는다;
- mutation CTA는 없거나 명확히 비활성화하고 “아직 사용할 수 없음”을 사실대로 표시한다;
- private inventory는 인증 + `noindex`;
- empty/loading/error/permission-denied/offline 상태 정의;
- 모바일 카드와 데스크톱 테이블이 동일 ownership fact를 제공한다.

R0는 두 번째 inventory DB나 ownership truth를 만들지 않는다.

### R1 — listing quote + escrow 활성화

판매 UI를 활성화하기 전에 다음 서버/DB 계약이 있어야 한다.

1. catalog + item instance + season/integrity state 기반 tradability resolver;
2. listing fee·expiry/config version·seller net을 포함한 권위 quote;
3. 정확한 instance/quantity를 logical escrow로 이동하는 원자 연산;
4. 결정적/idempotent create-listing;
5. cancel/expiry 시 동일 instance/quantity 반환;
6. cursor pagination + 안정 sort key를 가진 listing read model;
7. escrow 입·출고 provenance event;
8. orphan escrow/listing-ownership mismatch reconciliation query.

정상 active listing 수에는 임의 하드캡을 두지 않는다. request/batch 보호는 별도의 infrastructure protection이다.

### R2 — 원자 구매 및 정산

구매는 하나의 권위 transaction boundary에서 다음을 원자적으로 처리한다.

- buyer 인증/권한 확인;
- listing 상태 및 buyer != seller 재확인;
- listing lock/version;
- escrow ownership/quantity 검증;
- listing에 고정된 fee/config version 사용;
- buyer principal 차감;
- buyer→seller principal을 `TRANSFER`로 분류;
- 실제 시스템 제거 수수료만 `HARD_SINK`;
- seller net 지급;
- 정확한 item ownership/provenance 이전;
- listing settled 처리;
- ledger·settlement·provenance·audit reference 기록;
- post-commit analytics/outbox;
- idempotent replay-safe 결과 반환.

프론트에서 “잔액 차감 후 inventory API 호출” 같은 분리 흐름은 금지한다.

### R3 — 결정적 제작

제작은 inventory input 소비, WLD fee burn, output 생성이 하나의 원자 연산에 포함될 때만 활성화한다.

P0는 deterministic-first를 유지한다. recipe input/output/fee/availability/transfer policy는 서버 버전형 정책이다. `craft_count_limit`과 user cap은 구체적인 무결성·진짜 콘텐츠·법적 이유가 없으면 기본 `null/unlimited`다.

### R4 — 확장 서비스

R1–R3 telemetry와 reconciliation이 안정된 이후에만 다음을 추가한다.

- price history/reference band;
- provenance appraisal;
- 정산 우선순위를 바꾸지 않는 featured visual placement;
- marketplace watchlist/notification;
- season/archive recipe;
- buy order 또는 commission은 별도 integrity review 후 검토.

## 3. API 전환 계약

현재 `GET /api/v1/shop/holdings`가 ownership authority를 가진 동안 R0 read source로 유지할 수 있다. 미래 URL 구조를 맞춘다는 이유로 ownership을 client/별도 service에 복제하지 않는다.

- `GET /api/v1/shop/holdings` — 현재 holdings read source;
- marketplace listing/read API — 파생 market state, inventory truth 아님;
- marketplace mutation API — escrow/settlement를 소유하는 서버/DB 함수;
- crafting mutation API — input consumption/output creation을 소유하는 서버/DB 함수.

향후 별도 inventory read model을 만들더라도 권위 ownership table/function과 reconciliation 후 교체한다.

## 4. 규모 확장과 하드캡 금지

inventory/marketplace 규모 문제를 평생 보유량·listing 수·crafting 수의 임의 하드캡으로 해결하지 않는다.

사용할 방식:

- cursor pagination;
- owner/catalog/state indexed query;
- infrastructure 보호 목적의 bounded page/request batch size;
- 대규모 결과 virtualized rendering;
- archive/filter view;
- server-side search/sort;
- 비권위 summary용 asynchronous aggregate/read model.

PlayFab Economy V2 같은 외부 제품이 batch/collection/query 제한을 가진다는 사실은 안전한 pagination/batching의 참고일 뿐, 해당 숫자를 Moneyverse 사용자 gameplay cap으로 복사하는 근거가 아니다.

## 5. 가격 신뢰 UX

화면과 analytics는 다음을 구분한다.

1. **asking price** — 현재 seller 요청가;
2. **settled price** — 실제 완료 거래가;
3. **reference range** — 파생 참고 통계.

reference range는 보장가치·매입보장·강제 가격통제가 아니다. 정상 가격 선택은 허용하되, documented integrity rule이 발동할 경우에만 review를 적용한다.

wash/circular 의심 거래는 clean reference metric에서 제외하거나 명확히 표시한다. raw transfer volume은 integrity analytics에 남길 수 있지만 정상 수요처럼 취급하지 않는다.

## 6. 사용자 작성 메타데이터와 모더레이션

타인에게 보이는 engraving, custom label, seller profile snippet, item note는 UGC로 취급한다.

공개 전에 요구되는 조건:

- 안전/저장 목적의 길이·문자 제한;
- server-side normalization/output encoding;
- public content report/hide/block/moderation;
- 외부 결제 링크·연락처·비밀정보 입력 금지;
- 미성년자/연령 정책 상속;
- abusive text 처리와 item ownership 분리;
- offensive text 숨김이 item 또는 무관 자산 삭제로 이어지지 않음.

향후 rating/review를 넣는 경우 긍정 리뷰를 구매하거나, 가짜 리뷰를 만들거나, 부정적 의견이라는 이유로 숨기거나, 운영자/관계자 리뷰를 독립적인 것처럼 표시하지 않는다. FTC consumer-review rule은 공개 review 기능 출시 전 compliance gate다.

## 7. 반응형·접근성 계약

### Desktop
- dense table 허용, 숫자 정렬 유지;
- filter를 명확히 유지;
- 확인 전 seller net/buyer total/fee classification 표시.

### Tablet
- 동시 column 축소;
- item identity/price/quantity/state/primary action 유지;
- provenance/fee secondary detail은 expandable disclosure로 이동.

### Mobile
- 필요시 table→card;
- bottom-sticky CTA는 content/focus를 가리지 않을 때만;
- filter/sort drawer는 focus 복귀 지원;
- 가격/거래 확인은 full-width review step;
- hover/drag/color-only 조작 금지.

mutation confirmation은 item, quantity, gross WLD, fee, net/proceeds, action verb를 텍스트로 보여준다.

## 8. 부정행위와 오탐 처리

고위험 signal:

- self-purchase;
- linked account circular trade;
- 반복 round trip;
- 비정상 가격 + 빠른 재판매;
- duplicate settlement;
- escrow bypass;
- inventory/provenance mismatch;
- cancel/relist automation flood;
- 의심 faucet reward의 item laundering.

대응은 비례적이어야 한다. 잘못된 거래 차단, 특정 listing/proceeds hold, integrity review를 우선하고 하나의 risk score 때문에 무관 자산 몰수나 정상 플레이 전체 정지를 하지 않는다.

false-positive rate와 operator reversal rate를 핵심 integrity KPI로 추적한다.

## 9. 경제 회계와 소비처

- buyer principal → seller: `TRANSFER`;
- listing fee: `HARD_SINK`;
- 시스템이 제거한 sale fee: `HARD_SINK`;
- crafting/restoration/engraving fee: `HARD_SINK`;
- item/material conversion: `CONVERTER`;
- escrow reservation: `HOLD`;
- 새로 발행된 보상 WLD/material: `FAUCET`.

Marketplace GMV를 burn으로 계산하지 않는다.

저가·중가·고가·명예 단계에서 customization, restoration, provenance display, archive reconstruction, furniture/business fabrication, prestige service 같은 자발적 소비처를 계속 확장한다. 고자산 유저에게 강제 몰수형 세금보다 수집·공간·명예 소비를 우선한다.

## 10. 분석·운영 대시보드

최소 지표:

- R0 workbench 방문;
- inventory empty/error rate;
- holdings read latency/error rate;
- R1 이후 active listing/unique seller;
- create/cancel/expiry rate;
- escrow reconciliation error;
- purchase conflict/idempotent replay;
- GMV `TRANSFER`;
- hard-sink fee 분리;
- sell-through/median time to sale;
- clean vs suspicious volume;
- repeat-counterparty share;
- price outlier rate;
- integrity hold/false-positive rate;
- craft completion/rollback failure;
- 자산 코호트별 sink adoption;
- mobile completion/error;
- accessibility QA/support issue.

거래 churn 증가 자체를 성공 KPI로 삼지 않는다.

## 11. 관리자 및 reconciliation

write-capable launch 전에 read-only reconciliation이 필요하다.

- listing→escrow owner/quantity;
- settled listing→buyer ownership;
- settlement→buyer/seller/fee ledger reference;
- duplicate unique ownership;
- orphan escrow;
- stuck reservation/settlement;
- provenance gap;
- suspicious circular flow;
- 각 quote/settlement config version.

추후 repair action은 audited server/database repair function만 사용한다. 범용 `set inventory quantity/owner` 관리자 기능은 금지한다.

관리자 입력 화면은 작성 중 자동 새로고침을 금지한다.

## 12. 수익화 경계

허용:

- 비-P2W cosmetic/profile/space 상품;
- 명확히 표시된 sponsored cosmetic collection;
- settlement priority를 바꾸지 않는 WLD 기반 visual placement;
- settlement와 무관한 광고 제거 구독;
- ranking/WDX/경제/모더레이션 우위를 팔지 않는 B2B/B2B2C sponsorship.

별도 검토 없이는 금지:

- 실결제로 settlement priority 구매;
- 유료 seller proceeds 증가 또는 integrity check 완화;
- 현금화/외부교환 가능한 inventory;
- 실결제 random item;
- 결제와 WDX/loan/ranking 우위 연동.

수익 KPI는 refund/support/abuse/moderation/infrastructure 비용까지 포함한다.

## 13. 법률·개인정보 gate

현재 marketplace는 virtual/non-redeemable이다. 다음은 도입 전 `legal review required`다.

- 실결제 유저간 item settlement;
- cash-out/외부 교환 가치;
- 유료 random outcome;
- 제3자 merchant/seller 구조;
- 공개 ratings/reviews의 상업적 이용;
- 아동/미성년자 대상 commerce 또는 맞춤 광고 변경;
- 새로운 identity/payment 정보 수집.

공개 text/provenance는 community moderation/privacy/minor-safety 정책을 상속한다.

## 14. SEO

품질·개인정보 검토 후 index 후보:

- 공개 catalog/lore;
- private inventory를 노출하지 않는 crafting guide/recipe;
- marketplace/fee/provenance 교육 페이지;
- 일부 공개 collection/archive.

항상 인증 + `noindex`:

- 개인 `/marketplace` holdings workbench;
- private inventory;
- my listings/history;
- purchase/settlement state;
- seller proceeds;
- integrity case;
- admin/reconciliation.

검색 유입만을 위한 thin auto-generated listing page를 만들지 않는다.

## 15. 릴리스 gate

### R0 후보

- exact-head CI 통과;
- immutable exact-SHA Test image;
- isolated Test에서 정확한 SHA 확인;
- authenticated `/marketplace`와 authoritative holdings 검증;
- empty/large/serialized inventory 검증;
- mobile/keyboard/noindex 검증;
- accidental marketplace mutation 부재 확인;
- 로그의 private inventory leakage 없음.

### R1/R2/R3 mutation

추가로:

- forward-only migration + migration parity;
- PostgreSQL 권한/least-privilege;
- concurrent buy/list/cancel/craft;
- idempotency same-key/same-payload 및 same-key/different-payload;
- ledger + inventory + provenance reconciliation;
- rollback/failure injection;
- integrity hold/release audit;
- backend/API/UI end-to-end Test;
- rollback/compensation 준비.

정확히 검증한 revision만 Production으로 승격할 수 있다.

## 16. Research note — 2026-09-13

### Microsoft PlayFab Economy V2 — 직접 채택: reliability pattern만

공식 개발자 문서는 bounded batch, pagination/continuation token, transaction history 같은 패턴을 제공한다. Moneyverse는 안전 batching/pagination/traceability만 참고하고 PlayFab의 collection-size limit 숫자를 user-facing gameplay cap으로 복사하지 않는다.

- https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/limits
- https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/inventory/transaction-history

### PlayFab Trading — 참고만

owned inventory instance가 trade의 선행조건이며 하나의 item instance가 동시에 여러 open trade에 참여하지 못하는 패턴은 escrow/exclusive lock 설계 근거로 참고한다. Moneyverse의 PostgreSQL ledger/ownership이 계속 권위 source다.

- https://learn.microsoft.com/en-us/gaming/playfab/economy-monetization/economy/trading/

### FTC Consumer Reviews and Testimonials Rule — review 도입 시 조건부 직접 채택

현재 rule과 최근 집행은 fake/false review, 특정 감정 조건 보상, 관계 미공개, 기만적 review suppression을 문제 삼는다. Moneyverse는 지금 marketplace review가 필요하지 않으며, 향후 도입 시 launch gate로 사용한다.

- https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers
- https://www.ftc.gov/business-guidance/blog/2025/12/warning-letter-or-ten-businesses-comply-ftcs-consumer-review-rule

### Apple App Review Guidelines — 향후 모바일 UGC 참고

2026년 guideline 업데이트에서도 UGC 안전 요구를 계속 강조한다. 미래 iOS 배포를 위한 참고자료일 뿐 현재 웹서비스가 App Store 앱이라고 가정하지 않는다.

- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/news/?id=d75yllv4

## 17. 이 기획 계약의 완료 조건

- runtime stage와 mutation gate가 명확하다;
- PR #225를 미병합 후보로 기록한다;
- `/api/v1/shop/holdings`를 R0 bridge로 허용하되 영구 ownership duplication으로 만들지 않는다;
- inventory/listing/crafting 임의 하드캡을 만들지 않는다;
- transfer/hard sink를 분리한다;
- 사용자 작성 marketplace metadata가 moderation/minor-safety 정책을 상속한다;
- desktop/tablet/mobile/accessibility를 정의한다;
- revenue/legal/SEO 경계를 정의한다;
- runtime verification 불가 상태를 사실대로 기록한다;
- 실제 mutation 구현은 별도 개발 브랜치 → isolated Test → backend/DB/API/integrity 검증 → Production 순서를 유지한다.
